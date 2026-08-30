import React, { useState } from 'react';
import Header from './components/Header';
import StatCards from './components/StatCards';
import RevenueChart from './components/RevenueChart';
import FlaggedCustomersTable from './components/FlaggedCustomersTable';
import AgentActivityLog from './components/AgentActivityLog';
import MessagePreviewModal from './components/MessagePreviewModal';

import { 
  INITIAL_STATS, 
  REVENUE_TREND_7D, 
  FLAGGED_CUSTOMERS, 
  AGENT_ACTIVITY_LOGS, 
  SIMULATION_EVENTS 
} from './data/mockData';

import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Info
} from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [revenueTrend, setRevenueTrend] = useState(REVENUE_TREND_7D);
  const [customers, setCustomers] = useState(FLAGGED_CUSTOMERS);
  const [activityLogs, setActivityLogs] = useState(AGENT_ACTIVITY_LOGS);

  const [previewCustomer, setPreviewCustomer] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [simIndex, setSimIndex] = useState(0);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSimulateWebhook = () => {
    setIsSimulating(true);

    setTimeout(() => {
      const simEvent = SIMULATION_EVENTS[simIndex % SIMULATION_EVENTS.length];
      setSimIndex(prev => prev + 1);

      const newId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
      const newCustomer = {
        ...simEvent,
        id: newId
      };

      setCustomers(prev => [newCustomer, ...prev]);

      const newLog = {
        id: `LOG-${Math.floor(8800 + Math.random() * 1000)}`,
        timestamp: 'Just Now',
        timeRelative: 'Just now',
        type: newCustomer.statusCode === 'redeemed' ? 'REDEEMED' : 'DISPATCHED',
        statusVariant: newCustomer.statusCode === 'redeemed' ? 'gold' : 'emerald',
        customer: newCustomer.name,
        customerId: newId,
        detected: `Razorpay webhook event: ${newCustomer.signalType} detected for ${newCustomer.name}.`,
        actionTaken: `Generated Razorpay Dynamic Payment Link (${newCustomer.discountOffered}) + queued message.`,
        plainLanguageWhy: `Autonomous trigger executed based on frequency baseline drop. Expected recovery value +₹1,200.`,
        guardrailCheck: 'PASSED (1 action / 30-day cap satisfied).'
      };

      setActivityLogs(prev => [newLog, ...prev]);

      setStats(prev => ({
        ...prev,
        revenueToday: prev.revenueToday + (newCustomer.statusCode === 'redeemed' ? 2100 : 0),
        transactionsToday: prev.transactionsToday + 1,
        revenueRecoveredWeek: prev.revenueRecoveredWeek + (newCustomer.statusCode === 'redeemed' ? 2100 : 450),
        recoveredCountWeek: prev.recoveredCountWeek + 1
      }));

      setIsSimulating(false);
      triggerToast(`⚡ Webhook received: Autonomous campaign dispatched to ${newCustomer.name}`);
    }, 700);
  };

  const handleTriggerManualAction = (customer) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customer.id) {
        return {
          ...c,
          statusCode: 'dispatched',
          triggerStatus: 'Auto-Dispatched'
        };
      }
      return c;
    }));

    const newLog = {
      id: `LOG-${Math.floor(8800 + Math.random() * 1000)}`,
      timestamp: 'Just Now',
      timeRelative: 'Just now',
      type: 'DISPATCHED',
      statusVariant: 'emerald',
      customer: customer.name,
      customerId: customer.id,
      detected: `Merchant manually triggered action for ${customer.name}.`,
      actionTaken: `Dispatched Razorpay dynamic payment link: ${customer.suggestedAction}.`,
      plainLanguageWhy: `Manual override executed. Preserves customer safety guardrail until 30-day window resets.`,
      guardrailCheck: 'CONFIRMED (Next trigger locked for 30 days).'
    };

    setActivityLogs(prev => [newLog, ...prev]);
    triggerToast(`Dispatched Razorpay campaign to ${customer.name}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header 
        onSimulateWebhook={handleSimulateWebhook}
        isSimulating={isSimulating}
      />

      {/* Main Content Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Alert: What the AI Agent Does */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900">Autonomous Churn & Upsell Agent:</span>
              <span className="text-slate-600 ml-1">
                Monitors small merchant Razorpay transactions, detects lapsed customer patterns, and generates single-use payment link offers.
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Guardrail: Max 1 Offer / 30 Days
            </span>
          </div>
        </div>

        {/* SECTION 1: TOP STAT CARDS */}
        <section aria-label="Summary Statistics">
          <StatCards stats={stats} />
        </section>

        {/* SECTION 1.5: 7-DAY REVENUE & AI RECOVERY TREND */}
        <section aria-label="Revenue Trend">
          <RevenueChart data={revenueTrend} />
        </section>

        {/* SECTION 2: MIDDLE - FLAGGED CUSTOMERS TABLE */}
        <section aria-label="Flagged Customers">
          <FlaggedCustomersTable 
            customers={customers}
            onPreviewMessage={(cust) => setPreviewCustomer(cust)}
            onTriggerManualAction={handleTriggerManualAction}
          />
        </section>

        {/* SECTION 3: BOTTOM - AGENT ACTIVITY LOG (AUDIT TRAIL) */}
        <section aria-label="Agent Activity Log">
          <AgentActivityLog logs={activityLogs} />
        </section>

      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Vyapar Pulse</span>
            <span>•</span>
            <span>Razorpay Autonomous Retention Agent</span>
          </div>
          <div className="text-slate-500">
            Hackathon Live Demo • Test Mode Connected
          </div>
        </div>
      </footer>

      {/* Message Preview Modal */}
      {previewCustomer && (
        <MessagePreviewModal
          customer={previewCustomer}
          onClose={() => setPreviewCustomer(null)}
        />
      )}
    </div>
  );
}
