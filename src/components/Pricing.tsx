import React, { useState, useEffect } from 'react';
import { Check, Zap, Clock, ArrowRight, ChevronRight } from 'lucide-react';
import type { PricingConfig } from '../types';
import { siteStore } from '../services/store';

interface PricingProps {
  onOpenRequest: (serviceType?: 'Standard' | 'Fast') => void;
}

// Website type pricing — starts at ₹4,999 and increases with complexity
const WEBSITE_TIERS = [
  { type: 'Landing Page', price: 4999,  desc: 'Single-page high-converting site' },
  { type: 'Portfolio',    price: 5999,  desc: 'Showcase your work & creative skills' },
  { type: 'Personal',     price: 6499,  desc: 'Personal brand / blog / resume site' },
  { type: 'Creator',      price: 6999,  desc: 'Content creator hub with media grid' },
  { type: 'Restaurant',   price: 7999,  desc: 'Menu, reservations & location page' },
  { type: 'Business',     price: 8999,  desc: 'Multi-page corporate / agency site' },
  { type: 'Startup',      price: 9999,  desc: 'SaaS / product launch with features' },
  { type: 'Shop',         price: 11999, desc: 'Product catalog with WhatsApp orders' },
  { type: 'Custom',       price: null,  desc: 'Fully bespoke — price on request' },
];

export const Pricing: React.FC<PricingProps> = ({ onOpenRequest }) => {
  const [pricing, setPricing] = useState<PricingConfig | null>(null);

  const loadPricing = async () => {
    try {
      const data = await siteStore.getPricing();
      setPricing(data);
    } catch (err) {
      console.error('Failed to load pricing:', err);
    }
  };

  useEffect(() => {
    loadPricing();
    const unsubscribe = siteStore.subscribe(loadPricing);
    return unsubscribe;
  }, []);

  if (!pricing) return null;

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-orange-400 uppercase tracking-widest block mb-2">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Clear, Predictable Pricing
          </h2>
          <p className="mt-4 text-slate-300 text-lg">
            Pricing starts at <span className="text-orange-400 font-bold">₹4,999</span> and scales with your website's complexity. No hidden fees.
          </p>
        </div>

        {/* Website Type Pricing Table */}
        <div className="max-w-5xl mx-auto mb-14">
          <div className="glass-card rounded-3xl border border-white/10 overflow-hidden">

            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-3 bg-white/5 border-b border-white/10 text-xs font-mono text-slate-400 uppercase tracking-widest">
              <div className="col-span-5 sm:col-span-4">Website Type</div>
              <div className="col-span-5 hidden sm:block">What's Included</div>
              <div className="col-span-7 sm:col-span-3 text-right">Starting Price</div>
            </div>

            {/* Tier Rows */}
            {WEBSITE_TIERS.map((tier, i) => {
              const isLast = i === WEBSITE_TIERS.length - 1;
              const isPopular = tier.type === 'Business';
              return (
                <div
                  key={tier.type}
                  className={`grid grid-cols-12 px-6 py-4 items-center transition-colors hover:bg-white/5
                    ${!isLast ? 'border-b border-white/5' : ''}
                    ${isPopular ? 'bg-orange-500/5' : ''}
                  `}
                >
                  {/* Type */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-2">
                    {isPopular && (
                      <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                    <span className={`font-bold text-sm ${isPopular ? 'text-orange-300' : 'text-white'}`}>
                      {tier.type}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="col-span-5 hidden sm:block text-xs text-slate-400">
                    {tier.desc}
                  </div>

                  {/* Price + arrow */}
                  <div className="col-span-7 sm:col-span-3 flex items-center justify-end gap-3">
                    {tier.price ? (
                      <span className={`text-base font-extrabold ${isPopular ? 'text-orange-300' : 'text-white'}`}>
                        ₹{tier.price.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-amber-400 italic">On Request</span>
                    )}
                    <button
                      onClick={() => onOpenRequest('Standard')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title={`Request ${tier.type} site`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-slate-500 mt-3 font-mono">
            * All prices include mobile-responsive design, custom graphics & contact form integration.
          </p>
        </div>

        {/* Delivery Option Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* STANDARD DELIVERY CARD */}
          <div className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between border-white/10 hover:border-slate-400/30 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Standard Delivery
                </span>
                <Clock className="w-5 h-5 text-slate-400" />
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold text-white">₹4,999+</span>
                <span className="text-xs text-slate-400">/ project</span>
              </div>
              <p className="text-xs text-slate-400 mb-6 font-mono">
                Delivery Timeline: <strong className="text-slate-200">{pricing.standardDeliveryTime}</strong>
              </p>

              <ul className="space-y-3.5 mb-8 text-xs sm:text-sm text-slate-300">
                {[
                  'Complete Website Development',
                  '100% Mobile & Tablet Responsive',
                  'Custom Graphic & Layout Design',
                  'Requirement & Asset Review',
                  'Contact Form & Social Integration',
                  'Standard Delivery Timeline'
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="p-3 rounded-xl bg-slate-900/80 text-center text-xs text-slate-400 mb-6 border border-white/5">
                Fast Service Upgrade: <strong className="text-white">+₹{pricing.fastServiceFee.toLocaleString('en-IN')}</strong>
              </div>
              <button
                onClick={() => onOpenRequest('Standard')}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-slate-200 glass-panel hover:bg-white/10 border border-white/15 transition-all flex items-center justify-center gap-2"
              >
                <span>Request Standard Build</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* FAST SERVICE PRIORITY CARD */}
          <div className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between border-orange-500/50 shadow-2xl shadow-orange-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-5 rounded-bl-xl">
              ⚡ Priority Fast Build
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                  Fast Service ⚡
                </span>
                <Zap className="w-5 h-5 text-orange-400" />
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold text-white">₹4,999+</span>
                <span className="text-xl font-bold text-amber-400">+₹{pricing.fastServiceFee.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-amber-300 font-mono mb-6">
                Delivery Timeline: <strong className="text-white font-extrabold">{pricing.fastDeliveryTime}</strong>
              </p>

              <ul className="space-y-3.5 mb-8 text-xs sm:text-sm text-slate-200">
                {[
                  'Everything in Standard Package',
                  'Priority Queue Development Slot',
                  `Expedited turnaround (${pricing.fastDeliveryTime})`,
                  'Rapid Content & File Processing',
                  'Direct Progress Updates',
                  'Priority Launch Verification'
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="p-3.5 rounded-xl bg-orange-500/20 text-center text-xs border border-orange-500/40 mb-6">
                <span className="text-orange-300 block mb-0.5 font-medium">Fast Service Upgrade Fee</span>
                <span className="text-xl font-extrabold text-amber-400">+₹{pricing.fastServiceFee.toLocaleString('en-IN')}</span>
              </div>
              <button
                onClick={() => onOpenRequest('Fast')}
                className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Request Fast Build ⚡ (+₹{pricing.fastServiceFee.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
