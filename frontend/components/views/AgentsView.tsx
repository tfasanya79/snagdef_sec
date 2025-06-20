import React, { useState, useCallback } from 'react';
import { Agent, Alert, AlertSeverity } from '../../types';
import {
  generateForensicsReport,
  generateThreatAnalysis,
  startScan,
  detectThreat,
  containIncident,
  logForensics
} from '../../services/geminiService';
import { CpuChipIcon, PlayIcon, FileTextIcon, MicroscopeIcon, AlertTriangleIcon, TerminalIcon } from '../icons/AgentIcons';
import { LoaderIcon } from '../icons/StatusIcons';
import { Modal } from '../Modal';
import { MOCK_API_KEY_NOTE } from '../../constants';

interface AgentsViewProps {
  agents: Agent[];
  updateAgentStatus: (agentId: string, status: string, lastActivity?: string) => void;
  addAlert: (newAlert: Omit<Alert, 'id' | 'timestamp'>) => void;
  apiKeyExists: boolean;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  agents,
  updateAgentStatus,
  addAlert,
  apiKeyExists
}) => {
  const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // --- Backend integration for agent actions ---
  const handleAgentAction = useCallback(async (agent: Agent) => {
    setLoadingAgentId(agent.id);
    setActionError(null);
    try {
      if (agent.id === 'recon') {
        updateAgentStatus(agent.id, 'Scanning...', new Date().toLocaleTimeString());
        const result = await startScan('10.0.0.0/24'); // You may want to prompt for IP range
        updateAgentStatus(agent.id, 'Idle', `Scan completed: ${result.status}`);
        addAlert({
          description: `Recon Agent: ${result.status} for ${result.ip_range}`,
          severity: AlertSeverity.INFO,
          sourceAgent: agent.name,
          status: 'New'
        });
      } else if (agent.id === 'threat') {
        updateAgentStatus(agent.id, 'Detecting threats...', new Date().toLocaleTimeString());
        // Example logs; in real use, collect from user input or system
        const logs = [
          { feature1: 1, feature2: 2 },
          { feature1: 100, feature2: 200 }
        ];
        const result = await detectThreat(logs);
        updateAgentStatus(agent.id, 'Idle', `Detection complete: ${result.count} threats`);
        addAlert({
          description: `Threat Detection Agent: ${result.count} anomalies detected.`,
          severity: result.count > 0 ? AlertSeverity.HIGH : AlertSeverity.INFO,
          sourceAgent: agent.name,
          status: 'New'
        });
      } else if (agent.id === 'response') {
        updateAgentStatus(agent.id, 'Containing threat...', new Date().toLocaleTimeString());
        const result = await containIncident('192.168.1.100'); // Example target
        updateAgentStatus(agent.id, 'Standby', `Containment: ${result.status}`);
        addAlert({
          description: `Incident Response Agent: ${result.message}`,
          severity: AlertSeverity.MEDIUM,
          sourceAgent: agent.name,
          status: 'Contained'
        });
      } else if (agent.id === 'forensics') {
        updateAgentStatus(agent.id, 'Logging forensics...', new Date().toLocaleTimeString());
        const details = { attack_type: 'malware', timestamp: new Date().toISOString() };
        const result = await logForensics(details);
        updateAgentStatus(agent.id, 'Idle', `Forensics: ${result.status}`);
        addAlert({
          description: `Forensics Agent: ${result.message}`,
          severity: AlertSeverity.INFO,
          sourceAgent: agent.name,
          status: 'Logged'
        });
      }
    } catch (error: any) {
      setActionError(error.message || 'Agent action failed');
      updateAgentStatus(agent.id, 'Idle', 'Error occurred');
    } finally {
      setLoadingAgentId(null);
    }
  }, [addAlert, updateAgentStatus]);

  // --- Gemini AI report generation (unchanged) ---
  const handleGenerateReport = useCallback(async (agent: Agent) => {
    if (!apiKeyExists) {
      setReportTitle("Feature Unavailable");
      setReportContent(`AI-powered report generation requires a Gemini API key. ${MOCK_API_KEY_NOTE}`);
      setReportModalOpen(true);
      return;
    }

    setLoadingAgentId(agent.id);
    setReportTitle(`Generating Report for ${agent.name}...`);
    setReportContent('');
    setReportModalOpen(true);

    try {
      let generatedText = '';
      if (agent.id === 'forensics') {
        const mockIncidentSummary = "Incident ID #INC-00123: Critical RCE vulnerability exploited on server 'WebServer-03'. Attacker IP: 203.0.113.45. Data exfiltration detected. System isolated by Incident Response Agent.";
        generatedText = await generateForensicsReport(mockIncidentSummary);
        setReportTitle(`Forensics Report: ${agent.name}`);
      } else if (agent.id === 'threat') {
        const mockAnomaly = "Anomaly ID #ANM-00789: Sustained high CPU usage and unusual outbound network traffic on 'DatabaseServer-01' to unknown IP 8.8.4.4. Potential C2 communication.";
        generatedText = await generateThreatAnalysis(mockAnomaly);
        setReportTitle(`Threat Analysis: ${agent.name}`);
      } else {
        generatedText = "This agent does not support AI report generation at this time.";
        setReportTitle(`Report: ${agent.name}`);
      }
      setReportContent(generatedText);
    } catch (error) {
      setReportContent(`Failed to generate report. ${error instanceof Error ? error.message : 'Unknown error'}`);
      setReportTitle(`Error: ${agent.name}`);
    } finally {
      setLoadingAgentId(null);
    }
  }, [apiKeyExists]);

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'recon': return <TerminalIcon className="w-8 h-8 text-blue-400" />;
      case 'threat': return <MicroscopeIcon className="w-8 h-8 text-yellow-400" />;
      case 'response': return <AlertTriangleIcon className="w-8 h-8 text-red-400" />;
      case 'forensics': return <FileTextIcon className="w-8 h-8 text-purple-400" />;
      default: return <CpuChipIcon className="w-8 h-8 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-100">System Agents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-slate-700 p-6 rounded-xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                {getAgentIcon(agent.id)}
                <h3 className="text-xl font-semibold text-cyan-400">{agent.name}</h3>
              </div>
              <p className="text-sm text-slate-300 mb-2">{agent.description}</p>
              <p className="text-xs text-slate-400 mb-1">Status: <span className="font-medium text-slate-200">{agent.status}</span></p>
              <p className="text-xs text-slate-400">Last Activity: <span className="font-medium text-slate-200">{agent.lastActivity}</span></p>
            </div>
            <div className="mt-4 space-x-2 flex items-center">
              {/* Backend actions */}
              {(agent.id === 'recon' || agent.id === 'threat' || agent.id === 'response' || agent.id === 'forensics') && (
                <button
                  onClick={() => handleAgentAction(agent)}
                  disabled={loadingAgentId === agent.id}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium flex items-center shadow disabled:opacity-50"
                >
                  {loadingAgentId === agent.id ? <LoaderIcon className="animate-spin h-5 w-5 mr-2" /> : <PlayIcon className="h-5 w-5 mr-2" />}
                  {agent.id === 'recon' && 'Start Scan'}
                  {agent.id === 'threat' && 'Detect Threats'}
                  {agent.id === 'response' && 'Contain Incident'}
                  {agent.id === 'forensics' && 'Log Forensics'}
                </button>
              )}
              {/* Gemini AI actions */}
              {(agent.id === 'forensics' || agent.id === 'threat') && (
                <button
                  onClick={() => handleGenerateReport(agent)}
                  disabled={loadingAgentId === agent.id}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center shadow disabled:opacity-50"
                >
                  {loadingAgentId === agent.id ? <LoaderIcon className="animate-spin h-5 w-5 mr-2" /> : (agent.id === 'forensics' ? <FileTextIcon className="h-5 w-5 mr-2" /> : <MicroscopeIcon className="h-5 w-5 mr-2" />)}
                  {agent.id === 'forensics' ? 'Generate Forensics Report' : 'Analyze Anomaly (AI)'}
                </button>
              )}
            </div>
            {actionError && loadingAgentId === agent.id && (
              <div className="mt-2 text-red-400 text-sm">{actionError}</div>
            )}
          </div>
        ))}
      </div>
      {reportModalOpen && (
        <Modal title={reportTitle} onClose={() => setReportModalOpen(false)}>
          {loadingAgentId && !reportContent && (
            <div className="flex flex-col items-center justify-center p-8">
              <LoaderIcon className="animate-spin h-12 w-12 text-cyan-400 mb-4" />
              <p className="text-slate-300">Generating content with Gemini AI...</p>
            </div>
          )}
          {reportContent && (
            <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-slate-800 p-4 rounded-md max-h-96 overflow-y-auto">
              {reportContent}
            </pre>
          )}
          {!apiKeyExists && (
            <div className="mt-4 p-3 bg-yellow-600/30 text-yellow-200 border border-yellow-600 rounded-md text-sm">
              {MOCK_API_KEY_NOTE}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};