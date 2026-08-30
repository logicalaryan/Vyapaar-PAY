import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Eye, 
  HelpCircle,
  ChevronRight,
  Send
} from 'lucide-react';

export default function FlaggedCustomersTable({ 
  customers, 
  onPreviewMessage, 
  onTriggerManualAction 
}) {
  const [filterSignal, setFilterSignal] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTooltipId, setActiveTooltipId] = useState(null);

  const filteredCustomers = customers.filter(c => {
    const matchesSignal = 
      filterSignal === 'ALL' || 
      (filterSignal === 'LAPSED' && c.signalType.toLowerCase().includes('lapsed')) ||
      (filterSignal === 'BASKET' && c.signalType.toLowerCase().includes('basket')) ||
      (filterSignal === 'SLOW_DAY' && c.signalType.toLowerCase().includes('slow'));

    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.suggestedAction.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSignal && matchesSearch;
  });

  const getSignalBadge = (signalType) => {
    if (signalType.toLowerCase().includes('lapsed')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
          <Clock className="w-3 h-3 mr-1 text-amber-600" />
          {signalType}
        </span>
      );
    } else if (signalType.toLowerCase().includes('basket')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 whitespace-nowrap">
          <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
          {signalType}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
          <ChevronRight className="w-3 h-3 mr-0.5 text-blue-600" />
          {signalType}
        </span>
      );
    }
  };

  const getStatusBadge = (customer) => {
    if (customer.statusCode === 'redeemed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          {customer.triggerStatus}
        </span>
      );
    } else if (customer.statusCode === 'dispatched') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
          <Send className="w-3 h-3 mr-1 text-blue-600" />
          {customer.triggerStatus}
        </span>
      );
    } else if (customer.statusCode === 'warning') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
          <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
          {customer.triggerStatus}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
          <Clock className="w-3 h-3 mr-1 text-slate-500" />
          {customer.triggerStatus}
        </span>
      );
    }
  };

  return (
    <div className="card-clean rounded-2xl overflow-hidden shadow-subtle">
      {/* Header & Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Flagged Customers & Win-Back Triggers
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full">
                {filteredCustomers.length} detected
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Autonomous agent matches velocity drops, basket shrinkage, and inactive intervals.
            </p>
          </div>

          {/* Search and Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterSignal('ALL')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterSignal === 'ALL' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterSignal('LAPSED')}
                className={`px-2 py-1 rounded-md transition-all ${
                  filterSignal === 'LAPSED' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Lapsed
              </button>
              <button
                onClick={() => setFilterSignal('BASKET')}
                className={`px-2 py-1 rounded-md transition-all ${
                  filterSignal === 'BASKET' ? 'bg-purple-100 text-purple-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Basket
              </button>
              <button
                onClick={() => setFilterSignal('SLOW_DAY')}
                className={`px-2 py-1 rounded-md transition-all ${
                  filterSignal === 'SLOW_DAY' ? 'bg-blue-100 text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Slow Day
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Full-Width Table with No Overflow */}
      <div className="w-full">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase tracking-wider font-bold">
              <th className="py-3 px-3 sm:px-4">Customer</th>
              <th className="py-3 px-3">Last Purchase</th>
              <th className="py-3 px-3">Days Lapsed</th>
              <th className="py-3 px-3">Signal</th>
              <th className="py-3 px-3">Suggested Action</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-2 text-center">Guardrail</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No customers found matching the filter.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Customer Column with Phone Number on single line */}
                  <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200 shrink-0">
                        {customer.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 whitespace-nowrap">
                          {customer.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                          {customer.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Last Purchase with Bold Date */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900">
                      {customer.lastPurchaseDate}
                    </div>
                    <div className="text-[10px] text-slate-400">Avg: {customer.frequencyAvg}</div>
                  </td>

                  {/* Days Lapsed */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`font-bold text-sm ${
                      customer.daysLapsed > 20 ? 'text-amber-700' : 'text-slate-800'
                    }`}>
                      {customer.daysLapsed}d
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">ago</span>
                  </td>

                  {/* Signal Badge */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getSignalBadge(customer.signalType)}
                  </td>

                  {/* Suggested Action */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900 leading-tight">
                      {customer.suggestedAction}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                      {customer.discountOffered}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getStatusBadge(customer)}
                  </td>

                  {/* Safety Guardrail Tooltip */}
                  <td className="py-3 px-2 text-center whitespace-nowrap">
                    <div className="relative inline-block">
                      <button
                        onMouseEnter={() => setActiveTooltipId(customer.id)}
                        onMouseLeave={() => setActiveTooltipId(null)}
                        onClick={() => setActiveTooltipId(activeTooltipId === customer.id ? null : customer.id)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 border border-slate-200 transition-colors"
                      >
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>1/30d</span>
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                      </button>

                      {activeTooltipId === customer.id && (
                        <div className="absolute z-40 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2.5 bg-slate-900 text-slate-100 text-xs rounded-xl shadow-xl text-left">
                          <div className="font-bold text-white mb-1 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-emerald-400" />
                            Safety Guardrail
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {customer.capRule}. Prevents customer coupon fatigue.
                          </p>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions Column: Eye icon only + Dispatch if pending */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => onPreviewMessage(customer)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-colors"
                        title="View Customer WhatsApp / SMS Message Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {customer.statusCode === 'pending' && (
                        <button
                          onClick={() => onTriggerManualAction(customer)}
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm flex items-center justify-center"
                          title="Dispatch Campaign Now"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
