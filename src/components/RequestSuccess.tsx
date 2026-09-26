import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Hammer, CheckCircle2, ArrowRight, Home } from 'lucide-react';
import type { WebsiteRequest } from '../types';

interface RequestSuccessProps {
  request: WebsiteRequest;
  onClose: () => void;
}

export const RequestSuccess: React.FC<RequestSuccessProps> = ({ request, onClose }) => {
  useEffect(() => {
    // Fire festive celebration sparks/confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b2b', '#f59e0b', '#06b6d4', '#ffffff']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const handleTrackClick = () => {
    onClose();
    const trackingElement = document.getElementById('tracking');
    if (trackingElement) {
      trackingElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg overflow-y-auto animate-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-xl glass-panel border border-amber-500/30 rounded-3xl p-8 sm:p-10 text-center shadow-2xl overflow-hidden my-8">
        
        {/* Glow ambient circle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-orange-500/30 to-transparent blur-3xl pointer-events-none" />

        {/* Forge Animated Icon Badge */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-orange-500/40 mb-6 transform hover:rotate-12 transition-transform">
          <Hammer className="w-10 h-10 text-slate-950 font-black animate-pulse" />
        </div>

        {/* Main Heading */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Your Project Has Been Forged! ⚒️
        </h2>

        {/* Body Text */}
        <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed mb-8">
          We've received your website requirements. We'll review your information and contact you shortly.
        </p>

        {/* Unique Request ID Box */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-orange-500/40 shadow-inner mb-8 text-left space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-mono text-slate-400">Request Identifier</span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {request.requestId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
            <div>
              <span className="text-slate-500 block">Website Type</span>
              <strong className="text-white text-sm">{request.websiteType} Website</strong>
            </div>

            <div>
              <span className="text-slate-500 block">Selected Service</span>
              <strong className="text-white text-sm">
                {request.serviceType === 'Fast' ? '⚡ Priority Fast Service' : 'Standard Service'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block">Expected Delivery</span>
              <strong className="text-amber-400 text-sm">{request.deliveryTime}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">Fast Service Fee</span>
              <strong className="text-white text-sm">
                {request.serviceType === 'Fast' ? `+₹${request.fastServiceFee}` : '₹0'}
              </strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleTrackClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Track My Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm text-slate-300 glass-panel hover:bg-white/10 border border-white/15 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

      </div>
    </div>
  );
};
