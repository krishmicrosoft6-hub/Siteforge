import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Shield, LogIn, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import siteLogo from '../assets/logo.png';

interface NavbarProps {
  onOpenRequest: () => void;
  onOpenAdmin: () => void;
  onOpenLogin: () => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRequest, onOpenAdmin, onOpenLogin }) => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home',          href: '#home' },
    { name: 'Services',      href: '#services' },
    { name: 'How It Works',  href: '#how-it-works' },
    { name: 'Our Work',      href: '#our-work' },
    { name: 'Pricing',       href: '#pricing' },
    { name: 'Track Request', href: '#tracking' },
    { name: 'Contact',       href: '#contact' },
  ];

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  const [logoError, setLogoError] = useState(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#07080f]/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40 py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* Brand Logo */}
        <a href="#home" className="flex items-center gap-2 group">
          {logoError ? (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white font-extrabold text-xl">
                S
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Site<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Forge</span>
              </span>
            </div>
          ) : (
            <img
              src={siteLogo}
              alt="SiteForge Logo"
              className="h-10 sm:h-11 w-auto object-contain rounded-lg group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.triedPublic) {
                  target.dataset.triedPublic = 'true';
                  target.src = `${import.meta.env.BASE_URL}logo.png`;
                } else {
                  setLogoError(true);
                }
              }}
            />
          )}
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors py-1 relative group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 glass-panel border border-white/10">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="max-w-[110px] truncate">{displayName}</span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ADMIN
                  </span>
                )}
              </div>

              <button
                onClick={() => signOut()}
                title="Sign Out"
                className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 glass-panel hover:bg-red-500/10 transition-colors border border-white/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-300 glass-panel hover:bg-blue-500/10 border border-blue-500/25 hover:border-blue-400/50 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}

          <button
            onClick={onOpenAdmin}
            title={isAdmin ? "Admin Dashboard (Direct Access)" : "Admin Portal"}
            className={`p-2.5 rounded-xl transition-all border ${
              isAdmin
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                : 'text-slate-400 hover:text-white glass-panel hover:bg-white/10 border-white/10'
            }`}
          >
            <Shield className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRequest}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:via-blue-500 hover:to-violet-500 shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span>Build My Website</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          {user ? (
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 glass-panel border border-white/10"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onOpenLogin} className="p-2 rounded-lg text-blue-400 glass-panel border border-blue-500/20">
              <LogIn className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={onOpenAdmin}
            className={`p-2 rounded-lg border ${
              isAdmin ? 'bg-amber-500/15 text-amber-400 border-amber-500/40' : 'text-slate-400 glass-panel border-white/10'
            }`}
          >
            <Shield className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-slate-200 glass-panel border border-white/10"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-blue-400" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-[65px] bg-[#09091a]/96 backdrop-blur-xl border-b border-white/10 p-6 shadow-2xl animate-slide-up">
          <nav className="flex flex-col gap-4">
            {user && (
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-sm text-slate-300">
                <span>Signed in as <strong className="text-white">{displayName}</strong></span>
                {isAdmin && <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Admin</span>}
              </div>
            )}

            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-200 hover:text-blue-400 transition-colors py-2 border-b border-white/5"
              >
                {link.name}
              </a>
            ))}
            
            {user ? (
              <button
                onClick={() => { setMobileMenuOpen(false); signOut(); }}
                className="mt-2 w-full py-3 rounded-xl font-semibold text-red-400 glass-panel border border-red-500/30 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
                className="mt-2 w-full py-3 rounded-xl font-semibold text-blue-300 glass-panel border border-blue-500/30 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Sign Up</span>
              </button>
            )}

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenRequest(); }}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <span>Build My Website</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};