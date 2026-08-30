import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCheck 
} from 'lucide-react';

export default function MessagePreviewModal({ customer, onClose }) {
  if (!customer) return null;

  const [channel, setChannel] = useState(customer.statusCode === 'warning' ? 'sms' : 'whatsapp');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customer.paymentLinkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Dispatched Customer Message Preview
              </h3>
              <p className="text-xs text-slate-500">
                To: <span className="text-slate-800 font-semibold">{customer.name}</span> ({customer.phone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center border border-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Switcher */}
        <div className="px-5 pt-3.5 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Channel:</span>
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setChannel('whatsapp')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                channel === 'whatsapp'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setChannel('sms')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                channel === 'sms'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              SMS (Fallback)
            </button>
          </div>
        </div>

        {/* Mobile Preview Body */}
        <div className="p-5 overflow-y-auto">
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4">
            {/* Phone Screen Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center">
                  VP
                </div>
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1">
                    Sharma Organics
                    <span className="text-[10px] text-emerald-600">✔</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Verified Merchant</div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Today, 10:28 AM</span>
            </div>

            {/* Chat Bubble Message */}
            <div className="my-4 max-w-[92%] bg-white border border-slate-200 text-slate-800 p-3.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed shadow-sm">
              <p className="whitespace-pre-line">
                {channel === 'whatsapp' ? customer.messagePreview : `[SMS Alert] ${customer.messagePreview}`}
              </p>

              {/* Razorpay Card Preview */}
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-semibold font-mono">Razorpay Payment Link</span>
                  <span className="text-slate-400 text-[10px]">Test Mode</span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  {customer.discountOffered}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
                    {customer.paymentLinkUrl}
                  </span>
                  <a
                    href={customer.paymentLinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition-colors"
                  >
                    <span>Pay Now</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Read receipt */}
              <div className="mt-2 flex items-center justify-end text-[10px] text-slate-400 space-x-1">
                <span>Delivered</span>
                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span>Strategy:</span>
              <span className="font-semibold text-slate-900">{customer.signalType}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Safety Cap Policy:</span>
              <span className="font-medium text-slate-800">{customer.capRule}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Razorpay URL:</span>
              <button
                onClick={handleCopyLink}
                className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy URL'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-800 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
