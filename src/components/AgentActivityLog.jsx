import React, { useState } from 'react';
import { 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Zap
} from 'lucide-react';

export default function AgentActivityLog({ logs }) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'DISPATCHED') return log.type === 'DISPATCHED';
    if (activeFilter === 'REDEEMED') return log.type === 'REDEEMED';
    if (activeFilter === 'WARNING') return log.type === 'WARNING_HANDLED';
    return true;
  });

  const getStatusPill = (type) => {
    switch (type) {
      case 'REDEEMED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Payment Recovered
          </span>
        );
      case 'DISPATCHED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Zap className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Auto-Dispatched
          </span>
        );
      case 'WARNING_HANDLED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Delivery Fallback (Handled)
          </span>
        );
      case 'GUARDRAIL_BLOCKED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Guardrail Suppressed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
            Info
          </span>
        );
    }
  };

  return (
    <div className="card-clean rounded-2xl overflow-hidden shadow-subtle">
      {/* Header & Filter */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-600" />
                Agent Activity & Decision Audit Trail
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Autonomous reasoning logs tracking pattern detection, action dispatch, and guardrail validations.
            </p>
          </div>

          {/* Filter options */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setActiveFilter('REDEEMED')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === 'REDEEMED' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Recoveries
            </button>
            <button
              onClick={() => setActiveFilter('DISPATCHED')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === 'DISPATCHED' ? 'bg-blue-100 text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Dispatches
            </button>
            <button
              onClick={() => setActiveFilter('WARNING')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === 'WARNING' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Fallbacks
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Audit Trail List */}
      <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto bg-white">
        {filteredLogs.map((log) => (
          <div 
            key={log.id} 
            className={`p-4 sm:p-5 hover:bg-slate-50/75 transition-colors ${
              log.type === 'WARNING_HANDLED' ? 'bg-amber-50/30' : ''
            }`}
          >
            {/* Top row with Bold Timestamp */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {log.timestamp}
                </span>
                <span className="text-xs text-slate-400 font-medium">({log.timeRelative})</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  {log.customer}
                </span>
                {getStatusPill(log.type)}
              </div>
            </div>

            {/* Middle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Pattern Detected:
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {log.detected}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Action Executed:
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {log.actionTaken}
                </p>
              </div>
            </div>

            {/* Plain Language "Why" */}
            <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-bold text-emerald-900 block mb-0.5">
                    Plain-Language Agent Reasoning ("Why"):
                  </span>
                  <p className="text-emerald-900 leading-relaxed font-medium">
                    {log.plainLanguageWhy}
                  </p>
                  {log.guardrailCheck && (
                    <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <span className="font-bold text-slate-700">Guardrail:</span>
                      <span>{log.guardrailCheck}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
