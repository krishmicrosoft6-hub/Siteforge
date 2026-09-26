import React, { useState, useEffect } from 'react';
import { 
  X, 
  LayoutDashboard, 
  Inbox, 
  DollarSign, 
  Briefcase, 
  Settings as SettingsIcon, 
  Zap, 
  Clock, 
  CheckCircle, 
  Search, 
  Trash2, 
  Plus, 
  Edit3, 
  Save, 
  Eye,
  LogOut,
  FileText,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import type { WebsiteRequest, Project, PricingConfig, AdminSettings, RequestStatus } from '../../types';
import { siteStore } from '../../services/store';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'requests' | 'messages' | 'pricing' | 'projects' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const [requests, setRequests] = useState<WebsiteRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Request Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedRequest, setSelectedRequest] = useState<WebsiteRequest | null>(null);

  // New Project Form State
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState('Business Website');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectImage, setProjectImage] = useState('');
  const [projectFeatures, setProjectFeatures] = useState('');

  // Editable Pricing Form
  const [editBasePrice, setEditBasePrice] = useState(0);
  const [editFastFee, setEditFastFee] = useState(0);
  const [editStandardDelivery, setEditStandardDelivery] = useState('');
  const [editFastDelivery, setEditFastDelivery] = useState('');
  const [pricingSaveSuccess, setPricingSaveSuccess] = useState(false);

  // Editable Settings Form
  const [editEmail, setEditEmail] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editPin, setEditPin] = useState('');
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  const loadAll = async () => {
    try {
      const [reqs, projs, pric, sett, msgs] = await Promise.all([
        siteStore.getRequests(),
        siteStore.getProjects(),
        siteStore.getPricing(),
        siteStore.getSettings(),
        siteStore.getMessages(),
      ]);
      setRequests(reqs);
      setProjects(projs);
      setPricing(pric);
      setSettings(sett);
      setMessages(msgs);
      setEditBasePrice(pric.basePackagePrice);
      setEditFastFee(pric.fastServiceFee);
      setEditStandardDelivery(pric.standardDeliveryTime);
      setEditFastDelivery(pric.fastDeliveryTime);
      setEditEmail(sett.contactEmail);
      setEditWhatsapp(sett.whatsappNumber);
      setEditPin(sett.adminPin);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const unsubscribe = siteStore.subscribe(loadAll);
    return unsubscribe;
  }, []);

  if (!isOpen) return null;
  if (isLoading || !pricing || !settings) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="text-slate-400 animate-pulse text-sm font-mono">Loading admin data...</div>
    </div>
  );

  // Real DB Stats calculation (No fake numbers!)
  const totalRequestsCount = requests.length;
  const fastRequestsCount = requests.filter(r => r.serviceType === 'Fast').length;
  const activeRequestsCount = requests.filter(r => r.status !== 'Completed').length;
  const completedRequestsCount = requests.filter(r => r.status === 'Completed').length;

  const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    await siteStore.updateRequestStatus(requestId, newStatus);
    if (selectedRequest && selectedRequest.requestId === requestId) {
      setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm(`Are you sure you want to delete request ${requestId}?`)) {
      await siteStore.deleteRequest(requestId);
      if (selectedRequest?.requestId === requestId) setSelectedRequest(null);
    }
  };

  const handleMarkMessageRead = async (id: string) => {
    try {
      await siteStore.markMessageAsRead(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    await siteStore.updatePricing({
      basePackagePrice: Number(editBasePrice),
      fastServiceFee: Number(editFastFee),
      standardDeliveryTime: editStandardDelivery,
      fastDeliveryTime: editFastDelivery
    });
    setPricingSaveSuccess(true);
    setTimeout(() => setPricingSaveSuccess(false), 3000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await siteStore.updateSettings({
      contactEmail: editEmail,
      whatsappNumber: editWhatsapp,
      adminPin: editPin
    });
    setSettingsSaveSuccess(true);
    setTimeout(() => setSettingsSaveSuccess(false), 3000);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !projectDesc) return;
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: projectTitle,
      category: projectCategory,
      description: projectDesc,
      imageUrl: projectImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      features: projectFeatures.split(',').map(f => f.trim()).filter(Boolean),
      demoUrl: '#',
      isFeatured: true
    };
    await siteStore.saveProject(newProj);
    setIsAddingProject(false);
    setProjectTitle('');
    setProjectDesc('');
    setProjectImage('');
    setProjectFeatures('');
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Delete this portfolio project?')) {
      await siteStore.deleteProject(id);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-xl overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[92vh] glass-panel border border-orange-500/30 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Admin Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold">
              ⚡
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                SiteForge Management Console
              </h2>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Authenticated Admin System
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white glass-panel hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-400" />
          </button>
        </div>

        {/* Main Body with Sidebar Tabs */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/60 p-4 space-y-2 flex-shrink-0">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'requests', label: 'Customer Requests', icon: Inbox, count: totalRequestsCount },
              { id: 'messages', label: 'Client Inquiries', icon: MessageSquare, count: messages.filter(m => !m.is_read).length },
              { id: 'pricing', label: 'Pricing & Fees', icon: DollarSign },
              { id: 'projects', label: 'Our Work Projects', icon: Briefcase, count: projects.length },
              { id: 'settings', label: 'Settings & Security', icon: SettingsIcon },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isActive ? 'bg-black/40 text-white' : 'bg-slate-800 text-slate-300'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-900/40">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-xl font-bold text-white mb-4">System Analytics & Real Database Stats</h3>

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
                    <span className="text-xs text-slate-400 block mb-1">Total Customer Requests</span>
                    <span className="text-3xl font-extrabold text-white font-mono">{totalRequestsCount}</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                    <span className="text-xs text-orange-300 block mb-1 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-orange-400" /> Fast Service ⚡ Requests
                    </span>
                    <span className="text-3xl font-extrabold text-amber-400 font-mono">{fastRequestsCount}</span>
                    <span className="text-[10px] text-orange-300/80 block mt-1">+₹{pricing.fastServiceFee} Add-on tier</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                    <span className="text-xs text-cyan-300 block mb-1">Active Pipeline Projects</span>
                    <span className="text-3xl font-extrabold text-cyan-400 font-mono">{activeRequestsCount}</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-xs text-emerald-300 block mb-1">Completed Builds</span>
                    <span className="text-3xl font-extrabold text-emerald-400 font-mono">{completedRequestsCount}</span>
                  </div>
                </div>

                {/* Recent Submissions Table Preview */}
                <div className="mt-8 p-6 rounded-2xl bg-slate-900/80 border border-white/10">
                  <h4 className="text-base font-bold text-white mb-4">Recent Inbound Submissions</h4>
                  <div className="space-y-3">
                    {requests.slice(0, 4).map(req => (
                      <div key={req.requestId} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-amber-400 mr-2">{req.requestId}</span>
                          <strong className="text-white">{req.businessName}</strong> ({req.customerName})
                        </div>
                        <div className="flex items-center gap-3">
                          {req.serviceType === 'Fast' && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-300 font-bold">
                              ⚡ FAST (+₹{req.fastServiceFee})
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-white">Manage Website Requests ({filteredRequests.length})</h3>

                  {/* Filters */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search Name or ID..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Requirements Reviewed">Requirements Reviewed</option>
                      <option value="Design">Design</option>
                      <option value="Development">Development</option>
                      <option value="Client Review">Client Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Requests Grid / Table */}
                <div className="space-y-4">
                  {filteredRequests.map(req => (
                    <div
                      key={req.requestId}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-orange-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-sm font-extrabold text-amber-400">{req.requestId}</span>
                          <span className="text-base font-bold text-white">{req.businessName}</span>
                          {req.serviceType === 'Fast' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-orange-400" /> ⚡ FAST (+₹{req.fastServiceFee})
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 font-mono">
                          Customer: <strong>{req.customerName}</strong> ({req.email} | {req.phone})
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Type: <strong className="text-slate-200">{req.websiteType}</strong> | Delivery: <strong className="text-amber-300">{req.deliveryTime}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Select Box */}
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] text-slate-400 block mb-1">Update Status:</span>
                          <select
                            value={req.status}
                            onChange={e => handleStatusChange(req.requestId, e.target.value as RequestStatus)}
                            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-xs text-amber-300 font-semibold focus:outline-none"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Requirements Reviewed">Requirements Reviewed</option>
                            <option value="Design">Design</option>
                            <option value="Development">Development</option>
                            <option value="Client Review">Client Review</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>

                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                          title="View Full Request"
                        >
                          <Eye className="w-4 h-4 text-cyan-400" />
                        </button>

                        <button
                          onClick={() => handleDeleteRequest(req.requestId)}
                          className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View Request Modal */}
                {selectedRequest && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative w-full max-w-2xl glass-panel border border-white/20 rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                        <div>
                          <span className="text-xs font-mono text-amber-400">{selectedRequest.requestId}</span>
                          <h3 className="text-xl font-bold text-white">{selectedRequest.businessName} Details</h3>
                        </div>
                        <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-white">✕</button>
                      </div>

                      <div className="space-y-4 text-xs text-slate-300">
                        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900 border border-white/10">
                          <div><span className="text-slate-500 block">Customer Name:</span> <strong className="text-white">{selectedRequest.customerName}</strong></div>
                          <div><span className="text-slate-500 block">Contact Email:</span> <strong className="text-white">{selectedRequest.email}</strong></div>
                          <div><span className="text-slate-500 block">Phone / WhatsApp:</span> <strong className="text-white">{selectedRequest.phone}</strong></div>
                          <div><span className="text-slate-500 block">Website Type:</span> <strong className="text-amber-400">{selectedRequest.websiteType}</strong></div>
                          <div><span className="text-slate-500 block">Service Option:</span> <strong className="text-white">{selectedRequest.serviceType === 'Fast' ? '⚡ Priority Fast (+₹200)' : 'Standard'}</strong></div>
                          <div><span className="text-slate-500 block">Delivery Time:</span> <strong className="text-white">{selectedRequest.deliveryTime}</strong></div>
                        </div>

                        <div>
                          <h5 className="font-bold text-white mb-1">Project Description & Requirements:</h5>
                          <p className="p-3 rounded-xl bg-slate-900 border border-white/10 leading-relaxed">{selectedRequest.description}</p>
                        </div>

                        {selectedRequest.features && selectedRequest.features.length > 0 && (
                          <div>
                            <h5 className="font-bold text-white mb-1">Selected Features:</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedRequest.features.map((f, i) => (
                                <span key={i} className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-medium">
                                  ✓ {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedRequest.fileNames && selectedRequest.fileNames.length > 0 && (
                          <div>
                            <h5 className="font-bold text-white mb-2">Attached Project Files ({selectedRequest.fileNames.length}):</h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedRequest.fileNames.map((fn, i) => {
                                const fileUrl = fn.startsWith('http')
                                  ? fn
                                  : `https://zwyefyxhgxqryvyzoojk.supabase.co/storage/v1/object/public/project-files/${fn}`;
                                return (
                                  <a
                                    key={i}
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-white/10 flex items-center gap-1.5 font-mono text-xs transition-colors"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="truncate max-w-[200px]">{fn.split('/').pop()}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MESSAGES / INQUIRIES TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Client Inquiries & Contact Messages ({messages.length})</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {messages.filter(m => !m.is_read).length} unread
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 glass-panel rounded-2xl border border-white/5">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
                    <p className="text-sm">No client messages received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          msg.is_read
                            ? 'bg-slate-900/60 border-white/5'
                            : 'bg-blue-950/20 border-blue-500/30 shadow-lg shadow-blue-500/5'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{msg.sender_name}</span>
                            <span className="text-xs text-slate-400 font-mono">({msg.sender_email})</span>
                            {!msg.is_read && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-slate-500 font-mono">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                            {!msg.is_read && (
                              <button
                                onClick={() => handleMarkMessageRead(msg.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 transition-colors"
                              >
                                Mark as Read
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-3.5 rounded-xl border border-white/5 font-sans">
                          {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PRICING TAB */}
            {activeTab === 'pricing' && (
              <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
                <h3 className="text-xl font-bold text-white">Pricing & Delivery Configuration</h3>
                <p className="text-xs text-slate-400">
                  Updates made here immediately modify package pricing and Fast Service add-on fees across the website.
                </p>

                <form onSubmit={handleSavePricing} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Website Package Base Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editBasePrice}
                      onChange={e => setEditBasePrice(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Fast Service Upgrade Fee (₹) [Default: 200]
                    </label>
                    <input
                      type="number"
                      value={editFastFee}
                      onChange={e => setEditFastFee(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-mono text-sm font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Standard Delivery Timeline</label>
                      <input
                        type="text"
                        value={editStandardDelivery}
                        onChange={e => setEditStandardDelivery(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Fast Service Delivery Timeline</label>
                      <input
                        type="text"
                        value={editFastDelivery}
                        onChange={e => setEditFastDelivery(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-orange-500/40 text-orange-300 text-sm font-bold"
                      />
                    </div>
                  </div>

                  {pricingSaveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center">
                      Pricing Configuration Updated Successfully!
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Pricing Changes</span>
                  </button>
                </form>
              </div>
            )}

            {/* PROJECTS TAB */}
            {activeTab === 'projects' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Portfolio Project Manager</h3>
                  <button
                    onClick={() => setIsAddingProject(!isAddingProject)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAddingProject ? 'Cancel' : 'Add New Project'}</span>
                  </button>
                </div>

                {/* Add New Project Form */}
                {isAddingProject && (
                  <form onSubmit={handleAddProject} className="glass-panel p-6 rounded-2xl border border-orange-500/30 space-y-4">
                    <h4 className="text-sm font-bold text-orange-400">Add New Portfolio Build</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Project Title</label>
                        <input
                          type="text"
                          required
                          value={projectTitle}
                          onChange={e => setProjectTitle(e.target.value)}
                          placeholder="e.g. Apex Dynamics"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Category</label>
                        <select
                          value={projectCategory}
                          onChange={e => setProjectCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                        >
                          <option value="Business Website">Business Website</option>
                          <option value="Online Shop">Online Shop</option>
                          <option value="Restaurant Website">Restaurant Website</option>
                          <option value="Portfolio">Portfolio</option>
                          <option value="Startup Website">Startup Website</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Description</label>
                      <textarea
                        rows={2}
                        required
                        value={projectDesc}
                        onChange={e => setProjectDesc(e.target.value)}
                        placeholder="Brief summary of the build..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Image URL</label>
                        <input
                          type="text"
                          value={projectImage}
                          onChange={e => setProjectImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Features (comma separated)</label>
                        <input
                          type="text"
                          value={projectFeatures}
                          onChange={e => setProjectFeatures(e.target.value)}
                          placeholder="Mobile Responsive, Booking, SEO"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500"
                    >
                      Save Project to Public "Our Work" Section
                    </button>
                  </form>
                )}

                {/* Existing Projects List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map(proj => (
                    <div key={proj.id} className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={proj.imageUrl} alt={proj.title} className="w-16 h-12 rounded-lg object-cover" />
                        <div>
                          <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                          <span className="text-[10px] text-orange-400 font-mono">{proj.category}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-500/20"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
                <h3 className="text-xl font-bold text-white">Business Information & Security PIN</h3>

                <form onSubmit={handleSaveSettings} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Contact Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">WhatsApp Business Number</label>
                    <input
                      type="text"
                      value={editWhatsapp}
                      onChange={e => setEditWhatsapp(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Admin Security Access PIN</label>
                    <input
                      type="text"
                      value={editPin}
                      onChange={e => setEditPin(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-orange-500/40 text-amber-300 font-mono text-sm font-bold"
                    />
                  </div>

                  {settingsSaveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center">
                      Admin Settings Updated Successfully!
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Security Settings</span>
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
