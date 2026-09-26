import React from 'react';
import { MessageSquareText, FileText, Code2, Rocket, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onOpenRequest: () => void;
}

const STEPS = [
  {
    number: '01',
    title: 'Tell Us Your Idea',
    description: 'Tell us about your business, work or project idea through our structured request system.',
    icon: MessageSquareText,
    accent: 'from-orange-500 to-amber-500'
  },
  {
    number: '02',
    title: 'Share Your Details',
    description: 'Send your preferred content, images, logo, social links, and specific feature requirements.',
    icon: FileText,
    accent: 'from-amber-500 to-yellow-500'
  },
  {
    number: '03',
    title: 'We Build',
    description: 'SiteForge designs and develops your website using clean modern code and optimized layout.',
    icon: Code2,
    accent: 'from-cyan-500 to-blue-500'
  },
  {
    number: '04',
    title: 'Launch',
    description: 'Review your finished website, request any fine tweaks, and prepare for your digital launch.',
    icon: Rocket,
    accent: 'from-purple-500 to-pink-500'
  }
];

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenRequest }) => {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/40">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-3">
            Simple & Transparent Process
          </h2>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            How It Works
          </h3>
          <p className="mt-4 text-slate-300 text-lg">
            From concept to live deployment in four straightforward steps.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="relative">
          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-purple-500 -translate-y-8 z-0 opacity-30" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="glass-card rounded-2xl p-7 relative flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-300"
                >
                  {/* Step Number Glow Badge */}
                  <div className="flex items-center justify-between mb-8">
                    <span className={`text-4xl font-extrabold bg-gradient-to-r ${step.accent} -webkit-background-clip-text text-transparent font-mono`}>
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-3">
                      {step.title}
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                      {step.description}
                    </p>
                  </div>

                  {/* Step Indicator pill */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Phase {idx + 1}</span>
                    <span className="text-amber-400">Step {step.number}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={onOpenRequest}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <span>Start Step 01 — Request Website</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
