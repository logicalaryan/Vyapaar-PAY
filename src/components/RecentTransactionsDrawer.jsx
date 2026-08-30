import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function RecentTransactionsDrawer({ transactions }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedTxns = isExpanded ? transactions : transactions.slice(0, 5);

  return (
    <div className="glass-panel rounded-2xl border border-navy-700/70 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-navy-750 bg-navy-900/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            Live Razorpay Stream ({transactions.length} Transactions)
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>{isExpanded ? 'Show Less' : `View All (${transactions.length})`}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="divide-y divide-navy-750/60">
        {displayedTxns.map((txn) => (
          <div key={txn.id} className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-navy-800/40 transition-colors text-xs">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold ${
                txn.badge === 'Recovered' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-glow-emerald' 
                  : txn.badge === 'AI Agent'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'bg-navy-800 text-slate-400 border border-navy-700'
              }`}>
                {txn.badge === 'Recovered' ? 'AI $' : 'RZP'}
              </div>
              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>{txn.customer}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    txn.badge === 'Recovered' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : txn.badge === 'AI Agent'
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-navy-700 text-slate-400'
                  }`}>
                    {txn.badge}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {txn.id} • {txn.method}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-white font-mono text-sm">{txn.amount}</div>
              <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{txn.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
