import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { HowItWorks } from './components/HowItWorks';

import { Portfolio } from './components/Portfolio';
import { Pricing } from './components/Pricing';
import { RequestTracking } from './components/RequestTracking';
import { WhyUs } from './components/WhyUs';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { RequestModal } from './components/RequestModal';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import type { WebsiteType, ServiceType } from './types';
import { siteStore } from './services/store';

import { useAuth } from './context/AuthContext';

export function App() {
  const { isAdmin } = useAuth();
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedWebsiteType, setSelectedWebsiteType] = useState<WebsiteType | undefined>();
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>('Standard');

  const [adminAuthOpen, setAdminAuthOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [trackedRequestId, setTrackedRequestId] = useState<string>('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleOpenRequest = (type?: WebsiteType, service: ServiceType = 'Standard') => {
    setSelectedWebsiteType(type);
    setSelectedServiceType(service);
    setRequestModalOpen(true);
  };

  const handleSelectDeliveryOption = (service: ServiceType) => {
    setSelectedServiceType(service);
    setRequestModalOpen(true);
  };

  const handleExploreWork = () => {
    const el = document.getElementById('our-work');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      setAdminDashboardOpen(true);
    } else {
      setAdminAuthOpen(true);
    }
  };

  const handleAdminAuthenticated = () => {
    setAdminAuthOpen(false);
    setAdminDashboardOpen(true);
  };

  const handleRequestSubmitted = (reqId: string) => {
    setTrackedRequestId(reqId);
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 relative selection:bg-orange-500 selection:text-white font-sans">
      
      {/* Sticky Header Navigation */}
      <Navbar
        onOpenRequest={() => handleOpenRequest()}
        onOpenAdmin={handleAdminClick}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main id="home">
        {/* Hero Section with Interactive 3D Canvas */}
        <Hero
          onOpenRequest={() => handleOpenRequest()}
          onExploreWork={handleExploreWork}
        />

        {/* Services Showcase */}
        <Services
          onRequestService={(type) => handleOpenRequest(type)}
        />

        {/* 4-Step Process Timeline */}
        <HowItWorks
          onOpenRequest={() => handleOpenRequest()}
        />


        {/* Our Work Portfolio Showcase */}
        <Portfolio />

        {/* Configurable Package Pricing */}
        <Pricing
          onOpenRequest={(service) => handleOpenRequest(undefined, service)}
        />

        {/* Real-time Project Tracking by Request ID */}
        <RequestTracking
          initialRequestId={trackedRequestId}
        />

        {/* Why SiteForge & Standards */}
        <WhyUs />

        {/* Contact Form & Direct Support */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenRequest={() => handleOpenRequest()}
        onOpenAdmin={handleAdminClick}
      />

      {/* Multi-Step Website Request Wizard Modal */}
      <RequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        initialWebsiteType={selectedWebsiteType}
        initialServiceType={selectedServiceType}
        onSuccessSubmitted={handleRequestSubmitted}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* Admin Authentication PIN Modal */}
      <AdminAuthModal
        isOpen={adminAuthOpen}
        onClose={() => setAdminAuthOpen(false)}
        onAuthenticated={handleAdminAuthenticated}
      />

      {/* Full Admin Management Dashboard */}
      <AdminDashboard
        isOpen={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
      />

    </div>
  );
}

export default App;
