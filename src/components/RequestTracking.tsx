import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import type { WebsiteRequest, RequestStatus } from '../types';
import { siteStore } from '../services/store';

import { useAuth } from '../context/AuthContext';

interface RequestTrackingProps {
  initialRequestId?: string;
}

const STAGES: { status: RequestStatus; label: string; description: string }[] = [
  { status: 'New', label: 'Request Received', description: 'Your request details have entered our system queue.' },
  { status: 'Requirements Reviewed', label: 'Requirements Reviewed', description: 'Our engineering lead has reviewed your specs and assets.' },
  { status: 'Design', label: 'Design & Wireframe', description: 'Crafting modern UI components and dark glass layouts.' },
  { status: 'Development', label: 'Development', description: 'Engineering frontend logic, responsive grids, and integrations.' },
  { status: 'Client Review', label: 'Client Review', description: 'Previewing live draft for your feedback and fine touches.' },
  { status: 'Completed', label: 'Completed & Delivered', description: 'Website finalized, optimized, and delivered for launch!' }
];

export const RequestTracking: React.FC<RequestTrackingProps> = ({ initialRequestId }) => {
  const { user } = useAuth();
  const [searchId, setSearchId] = useState<string>(initialRequestId || '');
  const [foundRequest, setFoundRequest] = useState<WebsiteRequest | null>(null);
  const [userRequests, setUserRequests] = useState<WebsiteRequest[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user?.id) {
      siteStore.getUserRequests(user.id).then(setUserRequests).catch(console.error);
    } else {
      setUserRequests([]);
    }
  }, [user]);

  useEffect(() => {
    // Sync with store updates (if status changed in Admin)
    const refresh = async () => {
      if (foundRequest) {
        const updated = await siteStore.getRequestById(foundRequest.requestId);
        if (updated) setFoundRequest({ ...updated });
      }
      if (user?.id) {
        siteStore.getUserRequests(user.id).then(setUserRequests).catch(console.error);
      }
    };
    const unsubscribe = siteStore.subscribe(refresh);
    return unsubscribe;
  }, [foundRequest, user]);

  useEffect(() => {
    if (initialRequestId) {
      handleSearchById(initialRequestId);
    }
  }, [initialRequestId]);

  const handleSearchById = async (idToSearch: string) => {
    setErrorMsg('');
    setHasSearched(true);
    const cleanId = idToSearch.trim();
    if (!cleanId) {
      setErrorMsg('Please enter a valid Request ID (e.g. SF-829143)');
      setFoundRequest(null);
      return;
    }
    setIsSearching(true);
    try {
      const req = await siteStore.getRequestById(cleanId);
      if (req) {
        setFoundRequest(req);
      } else {
        setFoundRequest(null);
        setErrorMsg(`No project found with ID "${cleanId}". Please check your Request ID.`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to look up request. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentStageIndex = (status: RequestStatus): number => {
    return STAGES.findIndex(s => s.status === status);
  };

  return (
    <section id="tracking" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/60 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2">
            Real-time Status Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Track My Website
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            Enter your unique Request ID to monitor live progress from requirement review to final launch.
          </p>
        </div>

        {/* Input Box */}
        <div className="max-w-xl mx-auto mb-12">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSearchById(searchId);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                placeholder="Enter Request ID e.g. SF-829143"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono text-sm uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{isSearching ? 'Searching...' : 'Track Progress'}</span>
            </button>
          </form>

          {/* Quick Tracking Selection */}
          {userRequests.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
              <span className="font-mono text-cyan-400">Your Projects:</span>
              {userRequests.map(req => (
                <button
                  key={req.requestId}
                  onClick={() => {
                    setSearchId(req.requestId);
                    handleSearchById(req.requestId);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5"
                >
                  <span className="font-mono font-bold">{req.requestId}</span>
                  <span className="text-slate-400">({req.businessName || req.websiteType})</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200">{req.status}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
              <span>Try sample IDs:</span>
              <button
                onClick={() => {
                  setSearchId('SF-829143');
                  handleSearchById('SF-829143');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-white/10"
              >
                SF-829143 (Priority ⚡)
              </button>
              <button
                onClick={() => {
                  setSearchId('SF-104928');
                  handleSearchById('SF-104928');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-white/10"
              >
                SF-104928 (Standard)
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* TRACKING TIMELINE DISPLAY */}
        {foundRequest && (
          <div className="glass-panel border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl animate-in fade-in duration-300">
            
            {/* Request Header Summary */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl font-extrabold text-white">
                    {foundRequest.businessName}
                  </span>
                  {foundRequest.serviceType === 'Fast' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-orange-400" />
                      ⚡ Priority Project
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      Standard Project
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 font-mono">
                  Type: <strong className="text-slate-200">{foundRequest.websiteType} Website</strong> | Customer: <strong className="text-slate-200">{foundRequest.customerName}</strong>
                </p>
              </div>

              <div className="text-left md:text-right bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400 block mb-0.5">Target Delivery Window</span>
                <span className="text-lg font-bold text-amber-400 font-mono">
                  {foundRequest.deliveryTime}
                </span>
                {foundRequest.serviceType === 'Fast' && (
                  <span className="text-[10px] text-orange-300 block">Fast Service Upgrade (+₹{foundRequest.fastServiceFee})</span>
                )}
              </div>
            </div>

            {/* Timeline Steps Grid */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10 sm:before:left-8">
              {STAGES.map((stg, idx) => {
                const currentIdx = getCurrentStageIndex(foundRequest.status);
                const isCompleted = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                const isUpcoming = idx > currentIdx;

                return (
                  <div key={stg.status} className="flex items-start gap-4 sm:gap-6 relative z-10">
                    
                    {/* Status Circle Indicator */}
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-mono font-bold text-sm transition-all flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                          : isCurrent
                          ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/40 ring-4 ring-orange-500/20 animate-pulse'
                          : 'bg-slate-900/80 border border-white/10 text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-5 h-5 sm:w-7 sm:h-7 animate-spin" />
                      ) : (
                        <span>0{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Card Content */}
                    <div
                      className={`flex-1 p-5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-slate-900/90 border-orange-500/40 shadow-xl'
                          : isCompleted
                          ? 'bg-slate-900/40 border-white/5 opacity-80'
                          : 'bg-slate-950/20 border-white/5 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-base sm:text-lg font-bold ${isCurrent ? 'text-orange-400' : isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                          {stg.label}
                        </h4>

                        {isCurrent && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 animate-pulse">
                            Current Stage
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] text-emerald-400 font-mono uppercase">Completed ✓</span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300">
                        {stg.description}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
