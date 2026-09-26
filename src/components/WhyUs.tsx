import React from 'react';
import { Palette, Smartphone, Code, Zap, MessageCircle } from 'lucide-react';

const FEATURES = [
  {
    title: 'Modern Design',
    description: 'Professional, visually attractive dark-mode and glassmorphism designs tailored for high visual impact.',
    icon: Palette,
    color: 'text-orange-400'
  },
  {
    title: 'Responsive',
    description: 'Flawlessly optimized performance and layout adaptivity across desktop, tablet, and mobile displays.',
    icon: Smartphone,
    color: 'text-cyan-400'
  },
  {
    title: 'Custom Built',
    description: 'Designed and coded directly around each customer’s unique brand identity and functional specs.',
    icon: Code,
    color: 'text-amber-400'
  },
  {
    title: 'Fast Delivery',
    description: 'Standard 6–7 days turnaround or Priority Fast Service ⚡ (up to 3 days) available for urgent launches.',
    icon: Zap,
    color: 'text-purple-400'
  },
  {
    title: 'Direct Communication',
    description: 'Direct project correspondence regarding your site requirements, assets, and design preferences.',
    icon: MessageCircle,
    color: 'text-emerald-400'
  }
];

export const WhyUs: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-orange-400 uppercase tracking-widest block mb-2">
            The SiteForge Standard
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Why Work With SiteForge
          </h2>
          <p className="mt-4 text-slate-300 text-lg">
            Engineering excellence, modern aesthetics, and customer-first focus for every project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl p-7 flex flex-col justify-between group hover:border-orange-500/30 transition-all duration-300"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${feat.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
