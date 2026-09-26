import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Building, 
  Palette, 
  CheckSquare, 
  Clock, 
  Upload, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import type { WebsiteType, ServiceType, WebsiteRequest, PricingConfig } from '../types';
import { siteStore } from '../services/store';
import { RequestSuccess } from './RequestSuccess';

import { useAuth } from '../context/AuthContext';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWebsiteType?: WebsiteType;
  initialServiceType?: ServiceType;
  onSuccessSubmitted?: (reqId: string) => void;
}

const WEBSITE_TYPES: WebsiteType[] = [
  'Business',
  'Shop',
  'Restaurant',
  'Portfolio',
  'Personal',
  'Startup',
  'Creator',
  'Landing Page',
  'Custom'
];

const FEATURE_OPTIONS = [
  'WhatsApp button',
  'Contact form',
  'Google Maps',
  'Product catalog',
  'Online booking',
  'Blog',
  'Gallery',
  'Social media integration',
  'Payment integration',
  'Login / Signup',
  'Custom feature'
];

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  initialWebsiteType,
  initialServiceType = 'Standard',
  onSuccessSubmitted
}) => {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [businessName, setBusinessName] = useState('');
  const [websiteType, setWebsiteType] = useState<WebsiteType>(initialWebsiteType || 'Business');
  const [description, setDescription] = useState('');
  const [servicesInput, setServicesInput] = useState('');
  const [pagesInput, setPagesInput] = useState('');

  const [designPreferences, setDesignPreferences] = useState('');
  const [existingUrl, setExistingUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Contact form',
    'WhatsApp button',
    'Google Maps'
  ]);
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const [serviceType, setServiceType] = useState<ServiceType>(initialServiceType);
  const [submittedRequest, setSubmittedRequest] = useState<WebsiteRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const pric = await siteStore.getPricing();
        setPricing(pric);
      } catch (err) {
        console.error('Failed to load pricing:', err);
      }
    };
    loadPricing();
    if (initialWebsiteType) setWebsiteType(initialWebsiteType);
    if (initialServiceType) setServiceType(initialServiceType);

    // Prepopulate user info if logged in
    if (isOpen) {
      if (profile?.full_name && !customerName) setCustomerName(profile.full_name);
      if (user?.email && !email) setEmail(user.email);
      if (profile?.phone && !phone) setPhone(profile.phone);
    }
  }, [initialWebsiteType, initialServiceType, isOpen, user, profile]);

  if (!isOpen) return null;

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArr]);
      
      const newPreviews = filesArr.map(f => f.name);
      setFilePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFeature = (feat: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!customerName.trim()) errs.customerName = 'Full Name is required';
      if (!email.trim() || !email.includes('@')) errs.email = 'Valid Email is required';
      if (!phone.trim()) errs.phone = 'Phone / WhatsApp is required';
    }

    if (step === 2) {
      if (!businessName.trim()) errs.businessName = 'Business / Project Name is required';
      if (!description.trim()) errs.description = 'Please provide a short description';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit Request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricing) return;
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const reqId = siteStore.generateRequestId();

      // Upload any attached files to Supabase Storage
      const uploadedFileNames: string[] = [];
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          try {
            await siteStore.uploadProjectFile(reqId, file, user?.id);
            uploadedFileNames.push(file.name);
          } catch (uploadErr) {
            console.error('File upload error for:', file.name, uploadErr);
            uploadedFileNames.push(file.name);
          }
        }
      }

      const newRequest: WebsiteRequest = {
        requestId: reqId,
        customerName,
        email,
        phone,
        businessName,
        websiteType,
        description,
        services: servicesInput.split(',').map(s => s.trim()).filter(Boolean),
        pages: pagesInput.split(',').map(p => p.trim()).filter(Boolean),
        designPreferences: `${designPreferences} ${existingUrl ? `(Reference: ${existingUrl})` : ''}`.trim(),
        socialLinks,
        features: selectedFeatures,
        additionalRequirements,
        serviceType,
        fastServiceFee: serviceType === 'Fast' ? pricing.fastServiceFee : 0,
        deliveryTime: serviceType === 'Fast' ? pricing.fastDeliveryTime : pricing.standardDeliveryTime,
        status: 'New',
        fileNames: uploadedFileNames.length > 0 ? uploadedFileNames : filePreviews,
        userId: user?.id || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await siteStore.saveRequest(newRequest);
      setSubmittedRequest(newRequest);
      if (onSuccessSubmitted) onSuccessSubmitted(reqId);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedRequest) {
    return (
      <RequestSuccess
        request={submittedRequest}
        onClose={() => {
          setSubmittedRequest(null);
          onClose();
        }}
      />
    );
  }

  const stepsList = [
    { num: 1, title: 'Contact', icon: User },
    { num: 2, title: 'Project', icon: Building },
    { num: 3, title: 'Design', icon: Palette },
    { num: 4, title: 'Features', icon: CheckSquare },
    { num: 5, title: 'Delivery', icon: Clock },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-panel border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div>
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest">
              SiteForge Wizard
            </span>
            <h3 className="text-2xl font-extrabold text-white">
              Request Your Website
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-slate-950/80 px-6 py-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            {stepsList.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;
              return (
                <div key={step.num} className="flex flex-col items-center gap-1.5 flex-1 relative">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-orange-500 text-white'
                        : isActive
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] font-medium hidden sm:inline ${isActive ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                    0{step.num} {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* STEP 1: CONTACT */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-400" />
                <span>Step 1: Your Contact Information</span>
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Rahul Verma"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                />
                {errors.customerName && <p className="text-xs text-red-400 mt-1">{errors.customerName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                  />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Phone / WhatsApp Number <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98123 45678"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                  />
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROJECT */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-400" />
                <span>Step 2: Business & Project Details</span>
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Business / Brand Name <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Lumina Studio or Rahul's Tech"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                />
                {errors.businessName && <p className="text-xs text-red-400 mt-1">{errors.businessName}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Select Website Type <span className="text-orange-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {WEBSITE_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setWebsiteType(type)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                        websiteType === type
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500 shadow-md shadow-orange-500/10 font-bold'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Business / Project Description <span className="text-orange-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your business, main services, or goals for this website..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                />
                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Services / Products Offered
                  </label>
                  <input
                    type="text"
                    value={servicesInput}
                    onChange={e => setServicesInput(e.target.value)}
                    placeholder="e.g. Web Design, SEO, Consulting"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Required Pages
                  </label>
                  <input
                    type="text"
                    value={pagesInput}
                    onChange={e => setPagesInput(e.target.value)}
                    placeholder="e.g. Home, About Us, Menu, Contact"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DESIGN */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Palette className="w-5 h-5 text-cyan-400" />
                <span>Step 3: Design & Preferences</span>
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Preferred Colors & Design Style
                </label>
                <input
                  type="text"
                  value={designPreferences}
                  onChange={e => setDesignPreferences(e.target.value)}
                  placeholder="e.g. Dark obsidian with amber glow, clean minimalist"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Existing Website URL (if any)
                  </label>
                  <input
                    type="text"
                    value={existingUrl}
                    onChange={e => setExistingUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Social Media Handles
                  </label>
                  <input
                    type="text"
                    value={socialLinks}
                    onChange={e => setSocialLinks(e.target.value)}
                    placeholder="@instagram, linkedin.com/in/..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>
              </div>

              {/* Upload Section */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Upload Logo & Brand Assets / Content Files
                </label>
                <label className="border-2 border-dashed border-white/15 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 hover:bg-white/5 transition-all">
                  <Upload className="w-8 h-8 text-orange-400 mb-2" />
                  <span className="text-xs font-medium text-slate-300">
                    Click to select files (PNG, JPG, SVG, PDF, DOC)
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">Maximum 25MB total</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {filePreviews.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-slate-400 font-mono">Uploaded files ({filePreviews.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {filePreviews.map((fname, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 border border-white/10">
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span className="truncate max-w-[150px]">{fname}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-slate-400 hover:text-red-400 ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: FEATURES */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-purple-400" />
                <span>Step 4: Desired Features & Functional Requirements</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FEATURE_OPTIONS.map(feat => {
                  const isChecked = selectedFeatures.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      className={`p-3 rounded-xl text-xs font-medium text-left border flex items-center gap-2 transition-all ${
                        isChecked
                          ? 'bg-purple-500/20 border-purple-500 text-purple-200 font-semibold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${isChecked ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-500'}`}>
                        {isChecked && '✓'}
                      </span>
                      <span>{feat}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Additional Special Requirements
                </label>
                <textarea
                  rows={3}
                  value={additionalRequirements}
                  onChange={e => setAdditionalRequirements(e.target.value)}
                  placeholder="Any specific integrations, animations, or notes for our forging team..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 5: DELIVERY & SUMMARY */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <span>Step 5: Select Delivery Speed & Review Request</span>
              </h4>

              {/* Delivery Speed Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* STANDARD CARD */}
                <div
                  onClick={() => setServiceType('Standard')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    serviceType === 'Standard'
                      ? 'bg-slate-800/80 border-slate-300 text-white ring-2 ring-slate-400/40'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">STANDARD</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-200">Standard Timeline</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white mb-1">{pricing?.standardDeliveryTime ?? '6–7 Days'}</p>
                  <p className="text-xs text-slate-400 mb-3">Standard requirement review & development timeline.</p>
                  <div className="p-2 rounded bg-black/40 text-xs font-mono text-emerald-400 text-center">
                    Fast Service Fee: ₹0
                  </div>
                </div>

                {/* FAST CARD ⚡ */}
                <div
                  onClick={() => setServiceType('Fast')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                    serviceType === 'Fast'
                      ? 'bg-orange-500/20 border-orange-500 text-white ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/10'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-orange-400 flex items-center gap-1">
                      FAST ⚡
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-500/30 text-amber-300 font-semibold">
                      Priority Queue
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-white mb-1">{pricing?.fastDeliveryTime ?? 'Up to 3 Days'}</p>
                  <p className="text-xs text-slate-300 mb-3">Accelerated processing for urgent website launches.</p>
                  <div className="p-2 rounded bg-amber-500/20 border border-amber-500/30 text-xs font-mono text-amber-300 font-bold text-center">
                    Fast Service Fee: +₹{pricing?.fastServiceFee ?? 200}
                  </div>
                </div>

              </div>

              {/* Fast Service Explicit Notice */}
              {serviceType === 'Fast' && (
                <div className="p-3.5 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center gap-3 text-left">
                  <Zap className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <p className="text-xs text-amber-200">
                    <strong>Fast Service Selected:</strong> An additional fee of <strong>+₹{pricing?.fastServiceFee ?? 200}</strong> will be included in your priority website build request.
                  </p>
                </div>
              )}

              {/* REQUEST SUMMARY BOX */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/15 space-y-3 text-left text-xs">
                <h5 className="text-sm font-bold text-orange-400 border-b border-white/10 pb-2">
                  📋 Your Website Request Summary
                </h5>

                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div><span className="text-slate-500">Customer:</span> <strong className="text-white">{customerName || 'N/A'}</strong></div>
                  <div><span className="text-slate-500">Contact:</span> <strong className="text-white">{email} ({phone})</strong></div>
                  <div><span className="text-slate-500">Business Name:</span> <strong className="text-white">{businessName}</strong></div>
                  <div><span className="text-slate-500">Website Type:</span> <strong className="text-amber-400">{websiteType} Website</strong></div>
                  <div><span className="text-slate-500">Selected Service:</span> <strong className="text-white">{serviceType === 'Fast' ? '⚡ Fast Service (Priority)' : 'Standard Service'}</strong></div>
                  <div><span className="text-slate-500">Expected Delivery:</span> <strong className="text-white">{serviceType === 'Fast' ? (pricing?.fastDeliveryTime ?? 'Up to 3 Days') : (pricing?.standardDeliveryTime ?? '6–7 Days')}</strong></div>
                  <div><span className="text-slate-500">Fast Service Fee:</span> <strong className={serviceType === 'Fast' ? 'text-amber-400 font-extrabold' : 'text-slate-400'}>{serviceType === 'Fast' ? `+₹${pricing?.fastServiceFee ?? 200}` : '₹0'}</strong></div>
                  <div><span className="text-slate-500">Features Selected:</span> <strong className="text-white">{selectedFeatures.length} items</strong></div>
                </div>

                {description && (
                  <div className="pt-2 border-t border-white/10 text-slate-300">
                    <span className="text-slate-500">Requirements Preview:</span>
                    <p className="italic text-slate-400 mt-0.5 line-clamp-2">{description}</p>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

        </form>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-white/10 bg-slate-900/80 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={prevStep}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 glass-panel hover:bg-white/10 flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 flex items-center gap-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-8 py-3.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/30 flex items-center gap-2 transform hover:scale-105 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <span>Submit Website Request ⚒️</span>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
