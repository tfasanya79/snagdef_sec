import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';

// --- Gemini AI logic (unchanged) ---

const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
};

const initializeGenAI = (): GoogleGenAI | null => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("API_KEY is not available. Gemini functionality will be limited.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const ai = initializeGenAI();

async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  if (!ai) {
    return Promise.reject(new Error("Gemini API key not configured. Please set the API_KEY environment variable."));
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      ...(systemInstruction && { config: { systemInstruction } }),
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        return Promise.reject(new Error(`Gemini API request failed: ${error.message}`));
    }
    return Promise.reject(new Error("Gemini API request failed: An unknown error occurred."));
  }
}

// --- Backend API integration ---

const API_BASE = "https://snagdef-sec.onrender.com"; // Change to your backend URL in production

// JWT token helpers
export function saveToken(token: string) {
  localStorage.setItem("access_token", token);
}
export function getToken(): string | null {
  return localStorage.getItem("access_token");
}
export function removeToken() {
  localStorage.removeItem("access_token");
}

// Auth
export async function register(username: string, password: string) {
  const resp = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  const data = await resp.json();
  saveToken(data.access_token);
  return data;
}

export async function login(username: string, password: string) {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  const resp = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!resp.ok) throw new Error(await resp.text());
  const data = await resp.json();
  saveToken(data.access_token);
  return data;
}

// Agent endpoints
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function startScan(ipRange: string) {
  const resp = await fetch(`${API_BASE}/agents/recon?ip_range=${encodeURIComponent(ipRange)}`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

export async function detectThreat(logs: object[]) {
  const resp = await fetch(`${API_BASE}/agents/threat-detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ logs }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

export async function containIncident(target: string) {
  const resp = await fetch(`${API_BASE}/agents/incident-response`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ target }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

export async function logForensics(details: object) {
  const resp = await fetch(`${API_BASE}/agents/forensics`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ details }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

// --- Gemini AI exports (unchanged) ---

export async function generateForensicsReport(incidentSummary: string): Promise<string> {
  const prompt = `
Generate a detailed mock forensics report based on the following incident summary.
The report should be structured with sections like:
1.  Incident ID & Timestamp
2.  Executive Summary
3.  Initial Detection Details
4.  Attacker Information (if known/speculated, e.g., IP, TTPs)
5.  Systems Affected
6.  Timeline of Events
7.  Containment & Eradication Steps
8.  Evidence Collected (brief overview)
9.  Impact Assessment
10. Recommendations

Incident Summary:
${incidentSummary}

Keep the report concise but plausible for a cybersecurity context. Format for readability.
  `;
  const systemInstruction = "You are a cybersecurity forensics analyst generating an incident report.";
  return generateText(prompt, systemInstruction);
}

export async function generateThreatAnalysis(anomalyDescription: string): Promise<string> {
  const prompt = `
Analyze the following security anomaly and provide a brief threat analysis.
Consider:
-   Potential threat type (e.g., malware, intrusion, data exfiltration, reconnaissance).
-   Possible attacker intent.
-   Severity/Impact level (Low, Medium, High, Critical).
-   Recommended immediate actions.

Anomaly Description:
${anomalyDescription}

Provide the analysis in a clear, structured format.
  `;
  const systemInstruction = "You are a senior security operations center (SOC) analyst providing a threat analysis.";
  return generateText(prompt, systemInstruction);
}

export async function* streamChatResponse(chatHistory: Part[], newMessage: string): AsyncGenerator<string, void, undefined> {
  if (!ai) {
    throw new Error("Gemini API key not configured.");
  }
  const chat = ai.chats.create({
    model: GEMINI_MODEL_NAME,
    history: chatHistory,
  });
  const result = await chat.sendMessageStream({ message: newMessage });
  for await (const chunk of result) {
    yield chunk.text;
  }
}