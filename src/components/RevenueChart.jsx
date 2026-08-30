import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export default function RevenueChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(data.length - 1);
  const [metricView, setMetricView] = useState('stacked'); // 'stacked' | 'compare'

  const maxTotal = Math.max(...data.map(d => d.totalRevenue));
  const activeDay = data[hoveredIdx] !== undefined ? data[hoveredIdx] : data[data.length - 1];

  const totalWeekly = data.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalRecovered = data.reduce((acc, curr) => acc + curr.recoveredRevenue, 0);
  const recoveryShare = ((totalRecovered / totalWeekly) * 100).toFixed(1);

  return (
    <div className="card-clean rounded-2xl p-5 sm:p-6 shadow-subtle">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              7-Day Revenue & AI Recovery Lift
            </h2>
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              Razorpay Webhook Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual breakdown comparing regular store sales vs. autonomous win-back revenue.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            <span className="font-semibold text-slate-700">Store Sales</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="font-bold text-emerald-800">Agent Recovered</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">7-Day Total Revenue</span>
          <span className="text-lg font-bold text-slate-900">
            ₹{totalWeekly.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Agent Recovered GMV
          </span>
          <span className="text-lg font-bold text-emerald-900">
            ₹{totalRecovered.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">AI Revenue Boost</span>
          <span className="text-lg font-bold text-blue-900 flex items-center gap-1">
            +{recoveryShare}% <span className="text-xs font-normal text-blue-700">incremental GMV</span>
          </span>
        </div>
      </div>

      {/* Graphical Bar & Lift Chart */}
      <div className="mt-6 pt-2">
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 sm:h-56 pb-2 border-b border-slate-200">
          {data.map((dayData, idx) => {
            const isHovered = hoveredIdx === idx;
            const baselineHeightPct = Math.round((dayData.baselineRevenue / maxTotal) * 100);
            const recoveredHeightPct = Math.round((dayData.recoveredRevenue / maxTotal) * 100);
            const totalHeightPct = baselineHeightPct + recoveredHeightPct;

            return (
              <div
                key={dayData.day}
                onMouseEnter={() => setHoveredIdx(idx)}
                className="flex flex-col items-center justify-end h-full group cursor-pointer"
              >
                {/* Value tooltip pill above column */}
                <div className={`mb-2 text-center transition-all ${
                  isHovered ? 'opacity-100 scale-105' : 'opacity-80'
                }`}>
                  <span className={`text-[10px] sm:text-xs font-bold block ${
                    isHovered ? 'text-emerald-700' : 'text-slate-600'
                  }`}>
                    ₹{Math.round(dayData.totalRevenue / 1000)}k
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded-full hidden sm:inline-block">
                    +₹{dayData.recoveredRevenue}
                  </span>
                </div>

                {/* Vertical Stacked Graphical Bar */}
                <div className={`w-full max-w-[48px] rounded-t-xl overflow-hidden transition-all duration-200 flex flex-col justify-end ${
                  isHovered ? 'ring-2 ring-emerald-500 shadow-md' : 'hover:opacity-90'
                }`}>
                  {/* Top Segment: Agent Recovered GMV */}
                  <div
                    style={{ height: `${Math.max(recoveredHeightPct * 1.8, 12)}px` }}
                    className="bg-emerald-500 w-full relative group-hover:bg-emerald-400 transition-colors flex items-center justify-center text-[9px] font-bold text-white shadow-inner"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>

                  {/* Bottom Segment: Baseline Store Sales */}
                  <div
                    style={{ height: `${baselineHeightPct * 1.4}px` }}
                    className="bg-blue-500/85 w-full group-hover:bg-blue-500 transition-colors"
                  ></div>
                </div>

                {/* Day Label with Bold font */}
                <div className="mt-2.5 text-center">
                  <span className={`text-xs font-bold block ${
                    isHovered ? 'text-emerald-700' : 'text-slate-800'
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

      {/* Selected Day Dynamic Inspector */}
      {activeDay && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-900 text-sm">{activeDay.day} ({activeDay.date}):</span>
            <span className="text-slate-600 font-medium">{activeDay.transactions} total store orders</span>
          </div>

          <div className="flex items-center space-x-5">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
              <span className="text-slate-500">Store Sales:</span>
              <span className="font-bold text-slate-900">₹{activeDay.baselineRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              <span className="text-slate-500">AI Recovered:</span>
              <span className="font-bold text-emerald-700">₹{activeDay.recoveredRevenue.toLocaleString('en-IN')}</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                {activeDay.recoveredOrders} win-back orders
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
