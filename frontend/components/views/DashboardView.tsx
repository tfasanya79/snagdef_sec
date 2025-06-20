import React, { useEffect, useRef } from 'react';
import { Alert, Agent, AlertSeverity } from '../../types';
import { AlertTriangleIcon, CheckCircleIcon, ShieldAlertIcon, ActivityIcon } from '../icons/StatusIcons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColorClass?: string;
  textColorClass?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, bgColorClass = 'bg-slate-700', textColorClass = 'text-cyan-400' }) => (
  <div className={`${bgColorClass} p-6 rounded-xl shadow-lg flex items-center space-x-4`}>
    <div className={`p-3 rounded-full ${textColorClass} bg-opacity-20 ${bgColorClass === 'bg-slate-700' ? 'bg-slate-600' : 'bg-white/20'}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`text-3xl font-bold ${textColorClass}`}>{value}</p>
    </div>
  </div>
);

// Mock data for the chart
const threatTrendData = [
  { name: 'Mon', threats: 4, vulnerabilities: 2 },
  { name: 'Tue', threats: 3, vulnerabilities: 5 },
  { name: 'Wed', threats: 5, vulnerabilities: 3 },
  { name: 'Thu', threats: 7, vulnerabilities: 6 },
  { name: 'Fri', threats: 6, vulnerabilities: 4 },
  { name: 'Sat', threats: 9, vulnerabilities: 7 },
  { name: 'Sun', threats: 5, vulnerabilities: 5 },
];

interface DashboardViewProps {
  alerts: Alert[];
  agents: Agent[];
  addAlert?: (newAlert: Omit<Alert, 'id' | 'timestamp'>) => void; // Optional, for real-time
}

export const DashboardView: React.FC<DashboardViewProps> = ({ alerts, agents, addAlert }) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!addAlert) return; // Only set up WebSocket if addAlert is provided

    const ws = new WebSocket("ws://localhost:8000/ws/alerts");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      // You can customize this to parse JSON if you send structured alerts
      addAlert({
        description: event.data,
        severity: AlertSeverity.INFO,
        sourceAgent: "System",
        status: "New"
      });
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [addAlert]);

  const criticalAlerts = alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length;
  const highAlerts = alerts.filter(a => a.severity === AlertSeverity.HIGH).length;
  const activeAgents = agents.filter(a => a.status.toLowerCase().includes('active') || a.status.toLowerCase().includes('monitoring') || a.status.toLowerCase().includes('scanning')).length;
  const incidentsResolved = alerts.filter(a => a.status === 'Resolved' || a.status === 'Contained').length;

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'text-red-400';
      case AlertSeverity.HIGH: return 'text-orange-400';
      case AlertSeverity.MEDIUM: return 'text-yellow-400';
      case AlertSeverity.LOW: return 'text-blue-400';
      case AlertSeverity.INFO: return 'text-sky-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Critical Alerts" value={criticalAlerts} icon={<AlertTriangleIcon className="w-8 h-8" />} textColorClass="text-red-400" />
        <DashboardCard title="High Priority Alerts" value={highAlerts} icon={<ShieldAlertIcon className="w-8 h-8" />} textColorClass="text-orange-400" />
        <DashboardCard title="Incidents Resolved" value={incidentsResolved} icon={<CheckCircleIcon className="w-8 h-8" />} textColorClass="text-green-400" />
        <DashboardCard title="Active Agents" value={activeAgents} icon={<ActivityIcon className="w-8 h-8" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-700 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Threat Trends (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={threatTrendData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }} itemStyle={{ color: '#e2e8f0' }}/>
              <Legend wrapperStyle={{ color: '#e2e8f0' }}/>
              <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} name="Detected Threats" />
              <Line type="monotone" dataKey="vulnerabilities" stroke="#3b82f6" strokeWidth={2} name="Found Vulnerabilities" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-1 bg-slate-700 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Recent Alerts</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="p-3 bg-slate-800 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <p className={`font-medium ${getSeverityColor(alert.severity)}`}>{alert.severity}</p>
                  <p className="text-xs text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                </div>
                <p className="text-sm text-slate-300 mt-1">{alert.description}</p>
                <p className="text-xs text-slate-500 mt-1">Source: {alert.sourceAgent}</p>
              </div>
            ))}
            {alerts.length === 0 && <p className="text-slate-400">No recent alerts.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};