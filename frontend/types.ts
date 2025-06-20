export enum View {
  DASHBOARD = 'Dashboard',
  AGENTS = 'Agents',
  BILLING = 'Billing & Monetization',
  INTEGRATIONS = 'Integrations',
  DOCUMENTATION = 'Help & Documentation',
}

export enum AlertSeverity {
  INFO = 'Info',
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export interface Alert {
  id: string;
  timestamp: string;
  description: string;
  severity: AlertSeverity;
  sourceAgent: string;
  status: 'New' | 'Investigating' | 'Contained' | 'Resolved';
  details?: string; 
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: string; // e.g., 'Idle', 'Scanning', 'Monitoring', 'Logging'
  lastActivity: string; // Timestamp or description
  capabilityDemo?: () => React.ReactNode; // For agent-specific demo UI
}

export interface SubscriptionPlan {
  name: string;
  price: number; // USD per month
  features: string[];
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  logoUrl?: string; // Placeholder for actual logos
  connected: boolean;
  fee?: number; // Optional monthly fee
}

export const initialAlerts: Alert[] = [
  { id: '1', timestamp: new Date(Date.now() - 3600000).toISOString(), description: 'Unusual login attempt from IP 192.168.1.100', severity: AlertSeverity.MEDIUM, sourceAgent: 'Threat Detection Agent', status: 'Investigating' },
  { id: '2', timestamp: new Date(Date.now() - 7200000).toISOString(), description: 'Port scan detected on Server Alpha', severity: AlertSeverity.HIGH, sourceAgent: 'Recon Agent', status: 'Contained' },
  { id: '3', timestamp: new Date(Date.now() - 10800000).toISOString(), description: 'Malware signature XYZ found on Workstation Beta', severity: AlertSeverity.CRITICAL, sourceAgent: 'Threat Detection Agent', status: 'Resolved' },
];

export const initialAgents: Agent[] = [
  { id: 'recon', name: 'Recon Agent', description: 'Scans networks for vulnerabilities and maps attack surfaces.', status: 'Idle', lastActivity: 'Scan completed 2 hours ago' },
  { id: 'threat', name: 'Threat Detection Agent', description: 'Uses ML to identify anomalies, malware, and intrusions.', status: 'Monitoring', lastActivity: 'Real-time analysis active' },
  { id: 'response', name: 'Incident Response Agent', description: 'Automates containment actions like isolating devices.', status: 'Standby', lastActivity: 'Awaiting critical alerts' },
  { id: 'forensics', name: 'Forensics Agent', description: 'Logs attack details for post-mortem analysis and reporting.', status: 'Logging', lastActivity: 'Continuously archiving events' },
];

export const initialSubscription: SubscriptionPlan = {
  name: 'Enterprise',
  price: 2999,
  features: [
    'All Agents Included',
    'Unlimited Alerts',
    'AI-Powered Forensics',
    'SIEM Integration Pack',
    '24/7 Priority Support',
  ],
};

export const initialIntegrations: Integration[] = [
  { id: 'splunk', name: 'Splunk', description: 'Integrate with Splunk for advanced log management and correlation.', logoUrl: 'https://picsum.photos/seed/splunk/40/40', connected: true, fee: 150 },
  { id: 'qradar', name: 'IBM QRadar', description: 'Connect to IBM QRadar for comprehensive security intelligence.', logoUrl: 'https://picsum.photos/seed/qradar/40/40', connected: false, fee: 200 },
  { id: 'sentinel', name: 'Microsoft Sentinel', description: 'Link with Microsoft Sentinel for cloud-native SIEM capabilities.', logoUrl: 'https://picsum.photos/seed/sentinel/40/40', connected: false, fee: 180 },
];

// Part type for Gemini multi-turn or multi-modal requests
export interface Part {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // Base64 encoded string
  };
}