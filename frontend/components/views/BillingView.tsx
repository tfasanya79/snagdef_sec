
import React, { useState } from 'react';
import { SubscriptionPlan, Alert, AlertSeverity, Integration } from '../../types';
import { CheckCircleIcon, DollarSignIcon, BarChart2Icon } from '../icons/StatusIcons';

interface BillingViewProps {
  subscription: SubscriptionPlan;
  alerts: Alert[];
  updateSubscriptionPlan: (planName: string) => void;
  integrations: Integration[];
}

const PricingPlanCard: React.FC<{plan: SubscriptionPlan, currentPlanName: string, onSelectPlan: (planName: string) => void}> = ({ plan, currentPlanName, onSelectPlan }) => (
  <div className={`bg-slate-700 p-6 rounded-xl shadow-lg border-2 ${currentPlanName === plan.name ? 'border-cyan-500' : 'border-transparent'} flex flex-col`}>
    <h3 className="text-2xl font-semibold text-cyan-400 mb-2">{plan.name}</h3>
    <p className="text-4xl font-bold text-slate-100 mb-1">${plan.price}<span className="text-sm font-normal text-slate-400">/mo</span></p>
    <ul className="space-y-2 my-4 flex-grow">
      {plan.features.map(feature => (
        <li key={feature} className="flex items-center text-slate-300">
          <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
          {feature}
        </li>
      ))}
    </ul>
    <button 
      onClick={() => onSelectPlan(plan.name)}
      disabled={currentPlanName === plan.name}
      className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors
                  ${currentPlanName === plan.name 
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow'}`}
    >
      {currentPlanName === plan.name ? 'Current Plan' : 'Select Plan'}
    </button>
  </div>
);


export const BillingView: React.FC<BillingViewProps> = ({ subscription, alerts, updateSubscriptionPlan, integrations }) => {
  const criticalAlertsThisMonth = alerts.filter(a => a.severity === AlertSeverity.CRITICAL && new Date(a.timestamp).getMonth() === new Date().getMonth()).length;
  const costPerCriticalAlert = 50; // Example cost
  const payPerAlertCost = criticalAlertsThisMonth * costPerCriticalAlert;

  const activeIntegrationsFee = integrations.reduce((total, ig) => total + (ig.connected && ig.fee ? ig.fee : 0), 0);
  
  const totalMonthlyCost = subscription.price + payPerAlertCost + activeIntegrationsFee;

  const mockPlans: SubscriptionPlan[] = [
    { name: 'Basic', price: 49, features: ['Recon Agent', '100 Alerts/mo', 'Basic Reporting', 'Community Support'] },
    { name: 'Pro', price: 999, features: ['All Agents (Basic)', 'Threat Detection Agent', '500 Alerts/mo', 'AI Anomaly Detection', 'Standard Support'] },
    { name: 'Enterprise', price: 2999, features: ['All Agents Included', 'Unlimited Alerts', 'AI-Powered Forensics', 'SIEM Integration Pack', '24/7 Priority Support'] },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100 mb-6">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPlans.map(plan => (
            <PricingPlanCard key={plan.name} plan={plan} currentPlanName={subscription.name} onSelectPlan={updateSubscriptionPlan} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-700 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center">
            <DollarSignIcon className="w-6 h-6 text-yellow-400 mr-2" />
            Pay-Per-Alert Usage
          </h3>
          <p className="text-slate-300">Critical Alerts This Month: <span className="font-bold text-white">{criticalAlertsThisMonth}</span></p>
          <p className="text-slate-300">Cost Per Critical Alert: <span className="font-bold text-white">${costPerCriticalAlert}</span></p>
          <p className="text-slate-300 mt-2">Current Pay-Per-Alert Cost: <span className="font-bold text-yellow-400 text-lg">${payPerAlertCost.toFixed(2)}</span></p>
        </div>

        <div className="bg-slate-700 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center">
            <BarChart2Icon className="w-6 h-6 text-purple-400 mr-2" />
            Monthly Cost Summary
          </h3>
          <p className="text-slate-300">Current Plan ({subscription.name}): <span className="font-bold text-white">${subscription.price.toFixed(2)}</span></p>
          <p className="text-slate-300">Pay-Per-Alert Charges: <span className="font-bold text-white">${payPerAlertCost.toFixed(2)}</span></p>
          <p className="text-slate-300">Active Integration Fees: <span className="font-bold text-white">${activeIntegrationsFee.toFixed(2)}</span></p>
          <hr className="my-3 border-slate-600"/>
          <p className="text-slate-100 text-lg">Estimated Total Monthly Cost: <span className="font-bold text-green-400 text-2xl">${totalMonthlyCost.toFixed(2)}</span></p>
        </div>
      </div>
    </div>
  );
};
