import React from 'react';
import { Clock, Zap, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import type { PricingConfig } from '../types';

interface DeliveryOptionsProps {
  pricing: PricingConfig;
  onSelectOption: (serviceType: 'Standard' | 'Fast') => void;
}

export const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({ pricing, onSelectOption }) => {
  return (
    <section id="delivery" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-orange-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 mb-4">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold text-orange-300 uppercase tracking-wider">
              Speed & Timeline
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Choose Your Delivery Speed
          </h2>
          <p className="mt-4 text-slate-300 text-lg">
            We offer standard turnarounds or priority fast development depending on your launch urgency.
          </p>
        </div>

        {/* 2 Cards Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* STANDARD SERVICE CARD */}
          <div className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between border-white/10 hover:border-slate-400/30 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  Standard Service
                </span>
                <Clock className="w-6 h-6 text-slate-400" />
              </div>

              <h3 className="text-4xl font-extrabold text-white mb-2">
                {pricing.standardDeliveryTime}
              </h3>

              <p className="text-sm text-slate-300 mb-8 leading-relaxed">
                A professional website prepared within our standard development timeline.
              </p>

              {/* Checklist */}
              <ul className="space-y-4 mb-8">
                {[
                  'Website development & custom coding',
                  'Responsive design across mobile & desktop',
                  'Comprehensive requirement review',
                  'Standard delivery timeline'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 mb-6 text-center">
                <span className="text-xs text-slate-400 block mb-1">Add-on Fee</span>
                <span className="text-xl font-bold text-white">₹0 Additional</span>
              </div>

              <button
                onClick={() => onSelectOption('Standard')}
                className="w-full py-4 rounded-xl font-semibold text-slate-200 glass-panel hover:bg-white/10 border border-white/15 transition-all flex items-center justify-center gap-2"
              >
                <span>Select Standard ({pricing.standardDeliveryTime})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* FAST SERVICE CARD ⚡ */}
          <div className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between border-orange-500/40 shadow-2xl shadow-orange-500/10 relative overflow-hidden group">
            {/* Top Accent Ribbon */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider py-1.5 px-6 rounded-bl-xl shadow-md">
              ⚡ Priority Fast
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/40">
                  Fast Service ⚡
                </span>
                <Zap className="w-6 h-6 text-orange-400 animate-bounce" />
              </div>

              <h3 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-2">
                <span>{pricing.fastDeliveryTime}</span>
                <span className="text-2xl text-orange-400 font-normal">⚡</span>
              </h3>

              <p className="text-sm text-slate-300 mb-8 leading-relaxed">
                Need your website sooner? Upgrade to priority development for rapid processing.
              </p>

              {/* Checklist */}
              <ul className="space-y-4 mb-8">
                {[
                  'Priority queue development slot',
                  'Faster processing & rapid turnaround',
                  `Up to ${pricing.fastDeliveryTime} expedited delivery`,
                  'Dedicated project tracking'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              {/* Highlight Additional Charge Box */}
              <div className="p-4 rounded-xl bg-orange-500/15 border border-orange-500/40 mb-6 text-center">
                <span className="text-xs text-orange-300 font-medium block mb-0.5">Additional Fast Service Charge</span>
                <span className="text-3xl font-extrabold text-amber-400">+₹{pricing.fastServiceFee}</span>
              </div>

              <button
                onClick={() => onSelectOption('Fast')}
                className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.01]"
              >
                <span>Select Fast Service ⚡ (+₹{pricing.fastServiceFee})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Mandatory Explicit Disclaimer */}
        <div className="mt-12 max-w-3xl mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300">Important Note:</strong> Fast Service costs <strong>+₹{pricing.fastServiceFee} extra</strong> on top of the selected website package requirements. The ₹{pricing.fastServiceFee} is NOT the complete website price; it is strictly the priority fast delivery upgrade fee.
          </p>
        </div>

      </div>
    </section>
  );
};
