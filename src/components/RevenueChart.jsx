import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2,
  Users,
  Percent,
  X,
  Target,
  Zap,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function RevenueChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(data.length - 1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [aiImpactOnly, setAiImpactOnly] = useState(false);

  const totalWeekly = data.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalRecovered = data.reduce((acc, curr) => acc + curr.recoveredRevenue, 0);
  const totalBaseline = data.reduce((acc, curr) => acc + curr.baselineRevenue, 0);
  const recoveryShare = ((totalRecovered / totalWeekly) * 100).toFixed(1);

  const maxDailyRevenue = Math.max(...data.map(d => aiImpactOnly ? d.recoveredRevenue * 1.3 : d.totalRevenue));
  const maxCumulative = Math.max(...data.map(d => d.cumulativeRecovered || d.recoveredRevenue)) * 1.15;

  const chartHeight = 220;
  const chartWidth = 700;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const getX = (index) => paddingX + (index / (data.length - 1)) * innerWidth;
  const getCumY = (val) => chartHeight - paddingY - (val / maxCumulative) * innerHeight;

  // Cumulative line points
  const cumPoints = data.map((d, i) => `${getX(i)},${getCumY(d.cumulativeRecovered || 0)}`).join(' ');

  const activeDay = data[hoveredIdx] !== undefined ? data[hoveredIdx] : data[data.length - 1];
  const activeAiPct = ((activeDay.recoveredRevenue / activeDay.totalRevenue) * 100).toFixed(1);

  return (
    <div className="card-clean rounded-2xl p-5 sm:p-6 shadow-subtle relative">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                AI-Agent Revenue Analytics & Impact
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                  +₹{totalRecovered.toLocaleString('en-IN')} Lift
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                "How much additional revenue did the AI agent generate?" • Click any day for customer drill-down.
              </p>
            </div>
          </div>
        </div>

        {/* AI Impact Toggle */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs font-medium border border-slate-200">
            <button
              onClick={() => setAiImpactOnly(false)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                !aiImpactOnly
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Revenue
            </button>
            <button
              onClick={() => setAiImpactOnly(true)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                aiImpactOnly
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Impact Only
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">7-Day Store Baseline</span>
          <span className="text-lg font-bold text-slate-800">
            ₹{totalBaseline.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Organic store volume</span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            AI Agent Recovered Revenue
          </span>
          <span className="text-lg font-bold text-emerald-900">
            ₹{totalRecovered.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
            +₹3,800 today • 26 win-backs converted
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Total GMV (With AI Lift)</span>
          <span className="text-lg font-bold text-blue-950">
            ₹{totalWeekly.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-blue-700 font-bold block mt-0.5">
            +{recoveryShare}% incremental revenue
          </span>
        </div>
      </div>

      {/* Graphical Two-Layer Bar & Cumulative Line Visualization */}
      <div className="mt-6 pt-2 select-none relative">
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 sm:h-60 pb-3 border-b border-slate-200">
          {data.map((dayData, idx) => {
            const isHovered = hoveredIdx === idx;
            const isSelected = selectedDay?.day === dayData.day;
            const baselineHeightPct = Math.round((dayData.baselineRevenue / maxDailyRevenue) * 100);
            const recoveredHeightPct = Math.round((dayData.recoveredRevenue / maxDailyRevenue) * 100);

            return (
              <div
                key={dayData.day}
                onMouseEnter={() => setHoveredIdx(idx)}
                onClick={() => setSelectedDay(dayData)}
                className="flex flex-col items-center justify-end h-full group cursor-pointer relative"
                title="Click to view detailed agent customer actions for this day"
              >
                {/* Value tooltip pill above bar */}
                <div className={`mb-2 text-center transition-all ${
                  isHovered || isSelected ? 'opacity-100 scale-105' : 'opacity-85'
                }`}>
                  <span className={`text-[10px] sm:text-xs font-bold block ${
                    isHovered || isSelected ? 'text-emerald-700 font-extrabold' : 'text-slate-700'
                  }`}>
                    {aiImpactOnly ? `+₹${dayData.recoveredRevenue}` : `₹${Math.round(dayData.totalRevenue / 1000)}k`}
                  </span>
                  {!aiImpactOnly && (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded-full hidden sm:inline-block">
                      +₹{dayData.recoveredRevenue}
                    </span>
                  )}
                </div>

                {/* Vertical Stacked Graphical Bar */}
                <div className={`w-full max-w-[48px] rounded-t-xl overflow-hidden transition-all duration-150 flex flex-col justify-end ${
                  isSelected ? 'ring-2 ring-emerald-600 shadow-md' : isHovered ? 'ring-2 ring-emerald-400' : 'hover:opacity-95'
                }`}>
                  {/* Top Layer: AI Agent Recovered Revenue */}
                  <div
                    style={{ height: `${Math.max(recoveredHeightPct * 1.6, 14)}px` }}
                    className="bg-emerald-500 w-full relative group-hover:bg-emerald-400 transition-colors flex items-center justify-center text-[9px] font-bold text-white shadow-inner"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>

                  {/* Bottom Layer: Organic Store Sales */}
                  {!aiImpactOnly && (
                    <div
                      style={{ height: `${baselineHeightPct * 1.4}px` }}
                      className="bg-blue-500/85 w-full group-hover:bg-blue-500 transition-colors"
                    ></div>
                  )}
                </div>

                {/* Day Label with Bold Date */}
                <div className="mt-2 text-center">
                  <span className={`text-xs font-bold block ${
                    isHovered || isSelected ? 'text-emerald-700' : 'text-slate-800'
                  }`}>
                    {dayData.day.split(' ')[0]}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 block">
                    {dayData.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Information Box with All 6 Required Parameters */}
      {activeDay && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-900 text-sm">{activeDay.day} ({activeDay.date})</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-medium">{activeDay.transactions} Total Orders</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total GMV</span>
              <span className="font-bold text-slate-900 text-sm">₹{activeDay.totalRevenue.toLocaleString('en-IN')}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Organic Store Sales</span>
              <span className="font-bold text-blue-900 text-sm">₹{activeDay.baselineRevenue.toLocaleString('en-IN')}</span>
            </div>

            <div>
              <span className="text-emerald-700 block text-[10px] uppercase font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI-Recovered GMV
              </span>
              <span className="font-bold text-emerald-700 text-sm">₹{activeDay.recoveredRevenue.toLocaleString('en-IN')}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Win-Back Orders</span>
              <span className="font-bold text-slate-900 text-sm">{activeDay.recoveredOrders} orders</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">AI Contribution %</span>
              <span className="font-bold text-emerald-800 text-sm bg-emerald-100 px-1.5 py-0.5 rounded">
                +{activeAiPct}%
              </span>
            </div>

            <button
              onClick={() => setSelectedDay(activeDay)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
            >
              <span>Drill-down</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Day Click Detailed Panel (Drawer / Modal) */}
      {selectedDay && (
        <div className="mt-4 p-5 rounded-2xl bg-white border-2 border-emerald-500/40 shadow-lg animate-fade-in text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  AI Campaign Performance Drill-Down: <span className="text-emerald-700">{selectedDay.day} ({selectedDay.date})</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Direct breakdown of customers targeted and revenue converted by autonomous AI logic.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 6 Key Parameter Cards for Clicked Day */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block font-bold text-[10px] uppercase">Customers Targeted</span>
              <span className="text-base font-bold text-slate-900">{selectedDay.targetedCount} patrons</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 block font-bold text-[10px] uppercase">Customers Recovered</span>
              <span className="text-base font-bold text-emerald-900">{selectedDay.recoveredOrders} win-backs</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 block font-bold text-[10px] uppercase">Revenue Recovered</span>
              <span className="text-base font-bold text-emerald-900">₹{selectedDay.recoveredRevenue.toLocaleString('en-IN')}</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-blue-800 block font-bold text-[10px] uppercase">Conversion Rate</span>
              <span className="text-base font-bold text-blue-950">{selectedDay.conversionRate}</span>
            </div>
          </div>

          {/* Trigger Used & Agent Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Trigger Used:
              </span>
              <p className="font-bold text-slate-800">
                {selectedDay.triggersUsed}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Agent Action:
              </span>
              <p className="font-bold text-slate-800">
                {selectedDay.agentActionSummary}
              </p>
            </div>
          </div>

          {/* Targeted Customers List */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Patrons Engaged by Autonomous Agent:
            </span>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
              {selectedDay.targetedCustomers.map((cust, idx) => (
                <div key={idx} className="p-3 bg-white hover:bg-slate-50/80 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {cust.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{cust.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{cust.phone} • {cust.time}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      cust.status.includes('Recovered') 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {cust.status} {cust.amount !== '-' ? `(${cust.amount})` : ''}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">{cust.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
