# SnagDef: Autonomous Threat Detection & Response System

SnagDef is an open-source, AI-powered cybersecurity platform for real-time threat detection, incident response, and forensics. It features modular agents, JWT authentication, and a modern React frontend.

## Features

- **JWT Authentication** (FastAPI backend)
- **Agent-based Architecture**: Recon, Threat Detection, Incident Response, Forensics
- **Real-time Alerts** via WebSockets
- **AI-powered Reports** (Gemini/Google GenAI integration)
- **Extensible**: Billing, Integrations, and more
- **Modern Frontend**: React + TypeScript

## Getting Started

### Backend

1. **Install dependencies:**
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

2. **Run the backend:**
    ```bash
    uvicorn backend.main:app --reload
    ```

3. **Environment variables:**  
   Create a `.env` file for secrets (see `.env.example`).

### Frontend

1. **Install dependencies:**
    ```bash
    cd frontend
    npm install
    ```

2. **Run the frontend:**
    ```bash
    npm run dev
    ```

3. **Configure Gemini API Key:**  
   See `frontend/constants.ts` and `frontend/services/geminiService.ts`.

### Testing

- **Backend:**  
  ```bash
  pytest backend/tests
  ```

- **Frontend:**  
  Use your preferred React testing tools.

### CI/CD

- Automated tests run on every push via GitHub Actions (see `.github/workflows/ci.yml`).

## Project Structure

```
backend/    # FastAPI backend
frontend/   # React frontend
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

**SnagDef** is built with ❤️ by the community..