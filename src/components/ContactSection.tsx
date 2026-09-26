import React, { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import type { AdminSettings } from '../types';
import { siteStore } from '../services/store';
import { useAuth } from '../context/AuthContext';

export const ContactSection: React.FC = () => {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (profile?.full_name && !name) setName(profile.full_name);
    if (user?.email && !email) setEmail(user.email);
  }, [user, profile]);

  const loadSettings = async () => {
    try {
      const data = await siteStore.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    loadSettings();
    const unsubscribe = siteStore.subscribe(loadSettings);
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    setErrorMsg('');
    try {
      await siteStore.sendMessage({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        senderId: user?.id,
      });
      setSentSuccess(true);
      if (!user) {
        setName('');
        setEmail('');
      }
      setMessage('');
      setTimeout(() => setSentSuccess(false), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!settings) return null;

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/70 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Info */}
          <div className="lg:col-span-5 text-left">
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest block mb-2">
              Direct Contact
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
              Let's Build Something Great
            </h2>
            <p className="text-slate-300 text-base leading-relaxed mb-8">
              Have questions about website packages, custom features, or priority Fast Service? Drop us a message or connect directly.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Email Us</span>
                  <a href={`mailto:${settings.contactEmail}`} className="text-sm font-bold text-white hover:text-orange-400 font-mono">
                    {settings.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">WhatsApp Quick Chat</span>
                  <a 
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm font-bold text-emerald-400 hover:underline font-mono"
                  >
                    {settings.whatsappNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">
                Send a Quick Inquiry
              </h3>

              {sentSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2 animate-in fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Message Sent Successfully!</h4>
                  <p className="text-xs text-emerald-200">Thank you for reaching out. We will respond to your email shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Rahul"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="rahul@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Message / Question</label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Tell us about your project timeline or questions..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
