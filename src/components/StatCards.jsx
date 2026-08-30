import React from 'react';
import { 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle,
  Coins,
  ShoppingBag,
  Users
} from 'lucide-react';

export default function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Card 1: Revenue Today */}
      <div className="card-clean rounded-2xl p-5 sm:p-6 transition-all hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Revenue Today
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            ₹{stats.revenueToday.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs space-x-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            +{stats.revenueTodayDelta}%
          </span>
          <span className="text-slate-500">vs yesterday</span>
        </div>
      </div>

      {/* Card 2: Transactions */}
      <div className="card-clean rounded-2xl p-5 sm:p-6 transition-all hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Transactions
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.transactionsToday} <span className="text-sm font-normal text-slate-500">orders</span>
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs space-x-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            +{stats.transactionsTodayDelta}%
          </span>
          <span className="text-slate-500">Avg ticket: ₹340</span>
        </div>
      </div>

      {/* Card 3: Active Customers */}
      <div className="card-clean rounded-2xl p-5 sm:p-6 transition-all hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Customers
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.activeCustomers.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs space-x-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            +{stats.activeCustomersDelta}%
          </span>
          <span className="text-slate-500">Retention: 84%</span>
        </div>
      </div>

      {/* Card 4: Revenue Recovered by Agent (Hero Card) */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-subtle transition-all hover:border-emerald-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Recovered by Agent
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            {stats.agentRoiMultiplier}x ROI
          </span>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-900 tracking-tight">
            ₹{stats.revenueRecoveredWeek.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            {stats.recoveredCountWeek} win-backs this week
          </span>
          <span className="text-emerald-600 font-semibold">Autonomous</span>
        </div>
      </div>
    </div>
  );
}
