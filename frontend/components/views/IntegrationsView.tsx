
import React from 'react';
import { Integration } from '../../types';
import { CheckCircleIcon, XCircleIcon, BriefcaseIcon } from '../icons/StatusIcons'; // Re-use for status

interface IntegrationsViewProps {
  integrations: Integration[];
  toggleIntegration: (integrationId: string) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ integrations, toggleIntegration }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-100">SIEM & Tool Integrations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-slate-700 p-6 rounded-xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                {integration.logoUrl ? (
                  <img src={integration.logoUrl} alt={`${integration.name} logo`} className="w-10 h-10 rounded-full object-cover"/>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                    <BriefcaseIcon className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-cyan-400">{integration.name}</h3>
              </div>
              <p className="text-sm text-slate-300 mb-2">{integration.description}</p>
              {integration.fee && (
                <p className="text-xs text-slate-400 mb-1">Additional Fee: <span className="font-medium text-slate-200">${integration.fee}/mo</span></p>
              )}
              <div className={`flex items-center text-sm mt-2 ${integration.connected ? 'text-green-400' : 'text-yellow-400'}`}>
                {integration.connected ? <CheckCircleIcon className="w-5 h-5 mr-1" /> : <XCircleIcon className="w-5 h-5 mr-1" />}
                {integration.connected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            <button
              onClick={() => toggleIntegration(integration.id)}
              className={`w-full mt-6 py-2 px-4 rounded-lg font-medium transition-colors shadow
                          ${integration.connected 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              {integration.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
       <div className="mt-8 p-4 bg-slate-700/50 text-slate-300 border border-slate-600 rounded-md text-sm">
        <h4 className="font-semibold text-slate-100 mb-1">Note on Integration Fees:</h4>
        <p>Some integrations may incur additional monthly fees as listed. These will be added to your total subscription cost if the integration is active.</p>
      </div>
    </div>
  );
};
