import React from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { ForgeCanvas3D } from './ForgeCanvas3D';

interface HeroProps {
  onOpenRequest: () => void;
  onExploreWork: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenRequest, onExploreWork }) => {
  return (
    <section className="relative min-h-[90vh] pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col justify-center">
      {/* Background ambient glow shapes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-orange-600/10 to-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column - Content */}
        <div className="lg:col-span-6 text-center lg:text-left z-10">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 backdrop-blur-md mb-6 animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-medium text-amber-300">
              Professional Websites Built For Your Business
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Your Idea.{' '}
            <span className="forge-text-gradient block mt-1">
              Forged Into a Website.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed mb-8">
            Tell us about your business, project, shop or idea. We'll turn your requirements into a professional, modern website.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
            <button
              onClick={onOpenRequest}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
            >
              <span>Build My Website</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreWork}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-slate-200 glass-panel hover:bg-white/10 border border-white/15 hover:border-white/30 transition-all flex items-center justify-center gap-2"
            >
              Explore Our Work
            </button>
          </div>

          {/* Key Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Delivery Speed</p>
                <p className="text-sm font-semibold text-slate-200">Standard or Fast ⚡</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Quality</p>
                <p className="text-sm font-semibold text-slate-200">Custom Built</p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Priority Upgrade</p>
                <p className="text-sm font-semibold text-amber-400">+₹200 (Up to 3 Days)</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - 3D Interactive Hero */}
        <div className="lg:col-span-6 relative">
          <ForgeCanvas3D />
        </div>

      </div>
    </section>
  );
};
