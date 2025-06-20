import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { AgentsView } from './components/views/AgentsView';
import { BillingView } from './components/views/BillingView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { DocumentationView } from './components/views/DocumentationView';
import { Header } from './components/Header';
import { View, Alert, Agent, initialAgents, initialAlerts, initialSubscription, initialIntegrations, SubscriptionPlan, Integration } from './types';
import { BellIcon, ShieldCheckIcon, DollarSignIcon, BriefcaseIcon, CpuChipIcon, BookOpenIcon } from './components/icons/NavIcons';
import { register, login, getToken, removeToken } from './services/geminiService';
import { register, login, getToken, removeToken } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [subscription, setSubscription] = useState<SubscriptionPlan>(initialSubscription);
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [apiKeyExists, setApiKeyExists] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState(false);

  // --- Auth state ---
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getToken());

  useEffect(() => {
    if (process.env.API_KEY || "mock_api_key_for_dev") {
      setApiKeyExists(true);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authMode === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }
      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
  };

  const addAlert = useCallback((newAlert: Omit<Alert, 'id' | 'timestamp'>) => {
    setAlerts(prevAlerts => [
      { ...newAlert, id: Date.now().toString(), timestamp: new Date().toISOString() },
      ...prevAlerts
    ].slice(0, 50));
  }, []);

  const updateAgentStatus = useCallback((agentId: string, status: string, lastActivity?: string) => {
    setAgents(prevAgents =>
      prevAgents.map(agent =>
        agent.id === agentId ? { ...agent, status, lastActivity: lastActivity || agent.lastActivity } : agent
      )
    );
  }, []);

  const updateSubscriptionPlan = useCallback((planName: string) => {
    setSubscription(prevSub => ({...prevSub, name: planName, price: planName === 'Enterprise' ? 2999 : planName === 'Pro' ? 999 : 49}));
  }, []);
  
  const toggleIntegration = useCallback((integrationId: string) => {
    setIntegrations(prevIntegrations => 
      prevIntegrations.map(int => 
        int.id === integrationId ? {...int, connected: !int.connected} : int
      )
    );
  }, []);

  const navigationItems = [
    { name: View.DASHBOARD, icon: BellIcon },
    { name: View.AGENTS, icon: CpuChipIcon },
    { name: View.BILLING, icon: DollarSignIcon },
    { name: View.INTEGRATIONS, icon: BriefcaseIcon },
    { name: View.DOCUMENTATION, icon: BookOpenIcon },
  ];

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <DashboardView alerts={alerts} agents={agents} />;
      case View.AGENTS:
        return <AgentsView agents={agents} updateAgentStatus={updateAgentStatus} addAlert={addAlert} apiKeyExists={apiKeyExists} />;
      case View.BILLING:
        return <BillingView subscription={subscription} alerts={alerts} updateSubscriptionPlan={updateSubscriptionPlan} integrations={integrations} />;
      case View.INTEGRATIONS:
        return <IntegrationsView integrations={integrations} toggleIntegration={toggleIntegration} />;
      case View.DOCUMENTATION:
        return <DocumentationView />;
      default:
        return <DashboardView alerts={alerts} agents={agents}/>;
    }
  };

    // --- Landing Page UI ---
  if (!isAuthenticated && !showAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-100">
        <div className="bg-slate-800 p-10 rounded shadow-md w-full max-w-lg flex flex-col items-center">
          {/* Logo or Icon */}
          <div className="mb-6">
            <img src="/logo192.png" alt="SnagDef Logo" className="w-20 h-20" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-cyan-400">SnagDef</h1>
          <h2 className="text-xl font-semibold mb-4 text-slate-200">Autonomous Threat Detection & Response</h2>
          <p className="text-slate-400 mb-6 text-center">
            SnagDef is an AI-powered cybersecurity platform that detects, analyzes, and responds to threats in real time. 
            Protect your infrastructure with autonomous agents and actionable insights.
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded text-lg"
            onClick={() => setShowAuth(true)}
          >
            Get Started
          </button>
        </div>
      </div>
    );
  };


  // --- Auth UI ---
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-100">
        <form onSubmit={handleAuth} className="bg-slate-800 p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4">{authMode === 'login' ? 'Login' : 'Register'}</h2>
          <input
            className="w-full mb-3 p-2 rounded bg-slate-700 text-slate-100"
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full mb-3 p-2 rounded bg-slate-700 text-slate-100"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {authError && <div className="mb-3 text-red-400">{authError}</div>}
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
            type="submit"
          >
            {authMode === 'login' ? 'Login' : 'Register'}
          </button>
          <button
            type="button"
            className="w-full text-blue-400 hover:underline"
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          >
            {authMode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </form>
      </div>
    );
  }

  // --- Main App UI ---
  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} navigationItems={navigationItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={currentView} />
        <div className="flex justify-end p-2">
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-800 p-6">
          {renderView()}
          {!apiKeyExists && (currentView === View.AGENTS) && (
            <div className="mt-4 p-4 bg-yellow-500/20 text-yellow-300 border border-yellow-500 rounded-md">
              <strong>Warning:</strong> API_KEY for Gemini is not configured. AI-powered features like report generation will be unavailable. Please refer to the 'Help & Documentation' section for more details on API key setup for these features.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;