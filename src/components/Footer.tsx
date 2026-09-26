import React, { useState } from 'react';
import { Hammer, Shield, Lock } from 'lucide-react';
import siteLogo from '../assets/logo.png';

interface FooterProps {
  onOpenRequest: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenRequest, onOpenAdmin }) => {
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Our Work', href: '#our-work' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Track Request', href: '#tracking' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-12 px-4 sm:px-6 lg:px-8 relative text-left">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {!logoFailed ? (
                <img
                  src={siteLogo}
                  alt="SiteForge Logo"
                  className="h-10 w-auto object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedPublic) {
                      target.dataset.triedPublic = 'true';
                      target.src = `${import.meta.env.BASE_URL}logo.png`;
                    } else {
                      setLogoFailed(true);
                    }
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-extrabold text-xl">
                  S
                </div>
              )}
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Site<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Forge</span>
              </span>
            </div>

            <p className="text-lg font-bold text-slate-200">
              Your Idea. Forged Into a Website.
            </p>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Professional websites for businesses, shops, portfolios, startups and ideas of every kind. Built with custom architecture and priority speed delivery options.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-4">
              Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-slate-300 hover:text-orange-400 transition-colors py-1"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Actions & Legal */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-4">
              Get Started
            </h4>

            <button
              onClick={onOpenRequest}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20"
            >
              Build My Website Now
            </button>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <button
                onClick={() => setActiveLegalModal('privacy')}
                className="hover:text-slate-200 underline"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveLegalModal('terms')}
                className="hover:text-slate-200 underline"
              >
                Terms & Conditions
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© SiteForge. All rights reserved.</p>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Fast Service Available (+₹200)</span>
            <button
              onClick={onOpenAdmin}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-orange-400 transition-colors border border-white/10 flex items-center gap-1 text-[11px]"
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legal Modals */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {activeLegalModal === 'privacy' ? 'SiteForge Privacy Policy' : 'SiteForge Terms & Conditions'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {activeLegalModal === 'privacy'
                ? 'At SiteForge, we prioritize data safety and customer confidentiality. Customer website requirements, file uploads, and contact details are stored securely for project delivery purposes only and are never exposed publicly.'
                : 'SiteForge offers Standard (6–7 days) and Fast Service (up to 3 days with an additional ₹200 fee). All website development projects are custom built based on submitted specifications.'}
            </p>
            <button
              onClick={() => setActiveLegalModal(null)}
              className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-orange-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
