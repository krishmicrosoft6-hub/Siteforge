import React from 'react';
import { 
  Building2, 
  ShoppingBag, 
  UtensilsCrossed, 
  Briefcase, 
  User, 
  Rocket, 
  Video, 
  Layout, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import type { WebsiteType } from '../types';

interface ServicesProps {
  onRequestService: (type: WebsiteType) => void;
}

const SERVICES_DATA: {
  type: WebsiteType;
  icon: React.ElementType;
  description: string;
  badge?: string;
  glowColor: string;
}[] = [
  {
    type: 'Business',
    icon: Building2,
    description: 'Professional online presence designed to build authority, attract clients, and represent your company.',
    glowColor: 'hover:border-orange-500/40 hover:shadow-orange-500/10'
  },
  {
    type: 'Shop',
    icon: ShoppingBag,
    description: 'Showcase products and create a modern online shopping experience with catalog grids and order triggers.',
    glowColor: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10'
  },
  {
    type: 'Restaurant',
    icon: UtensilsCrossed,
    description: 'Interactive menus, Google Maps location, contact, photo gallery, and online reservation request features.',
    glowColor: 'hover:border-amber-500/40 hover:shadow-amber-500/10'
  },
  {
    type: 'Portfolio',
    icon: Briefcase,
    description: 'Showcase your skills, project case studies, and career achievements with high visual polish.',
    glowColor: 'hover:border-purple-500/40 hover:shadow-purple-500/10'
  },
  {
    type: 'Personal',
    icon: User,
    description: 'Build a strong digital identity, personal bio, press links, and professional resume webpage.',
    glowColor: 'hover:border-blue-500/40 hover:shadow-blue-500/10'
  },
  {
    type: 'Startup',
    icon: Rocket,
    description: 'Launch your startup with a modern digital presence, interactive product feature blocks, and lead capture.',
    badge: 'Popular',
    glowColor: 'hover:border-orange-500/50 hover:shadow-orange-500/20'
  },
  {
    type: 'Creator',
    icon: Video,
    description: 'Showcase videos, social media links, merchandise previews, and your personal digital creator brand.',
    glowColor: 'hover:border-pink-500/40 hover:shadow-pink-500/10'
  },
  {
    type: 'Landing Page',
    icon: Layout,
    description: 'High-converting, optimized landing pages for specific products, marketing campaigns, or launches.',
    glowColor: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10'
  },
  {
    type: 'Custom',
    icon: Sparkles,
    description: 'Have something unique or specialized in mind? Tell us what you need and we will forge custom code for it.',
    badge: 'Tailored',
    glowColor: 'hover:border-amber-500/50 hover:shadow-amber-500/20'
  }
];

export const Services: React.FC<ServicesProps> = ({ onRequestService }) => {
  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-3">
            What We Forge
          </h2>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Websites Built For Your Work
          </h3>
          <p className="mt-4 text-slate-300 text-lg">
            Choose the website type that fits your vision. Every build is customized around your goals.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_DATA.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.type}
                className={`glass-card rounded-2xl p-7 flex flex-col justify-between relative group ${service.glowColor}`}
              >
                {/* Optional Badge */}
                {service.badge && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    {service.badge}
                  </span>
                )}

                <div>
                  {/* Icon Box */}
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-all duration-300 mb-6">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                    {service.type} Website
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                {/* Request CTA */}
                <button
                  onClick={() => onRequestService(service.type)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-slate-200 glass-panel hover:bg-orange-500 hover:text-white border border-white/10 hover:border-orange-500 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  <span>Request This</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
