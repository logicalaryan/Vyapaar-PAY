import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Store,
  CheckCircle
} from 'lucide-react';

export default function Header({ onSimulateWebhook, isSimulating }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Context */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Zap className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Vyapar<span className="text-emerald-600">Pulse</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  AI Autonomous Agent
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-500 space-x-2 mt-0.5">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  Sharma Organics & Retail
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-slate-500">MID: RZP_MERCH_9042</span>
              </div>
            </div>
          </div>

          {/* Right Status & Action */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety Guardrail: <strong className="text-slate-800">1 action / customer / 30d</strong></span>
            </div>

            <button
              id="simulate-webhook-btn"
              onClick={onSimulateWebhook}
              disabled={isSimulating}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm ${
                isSimulating 
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
              }`}
              title="Simulate incoming Razorpay transaction webhook to trigger autonomous agent"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                  <span>Evaluating Webhook...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Simulate Razorpay Event</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
