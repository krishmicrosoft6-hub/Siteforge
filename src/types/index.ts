export type WebsiteType = 
  | 'Business'
  | 'Shop'
  | 'Restaurant'
  | 'Portfolio'
  | 'Personal'
  | 'Startup'
  | 'Creator'
  | 'Landing Page'
  | 'Custom';

export type ServiceType = 'Standard' | 'Fast';

export type RequestStatus = 
  | 'New'
  | 'Contacted'
  | 'Requirements Reviewed'
  | 'Design'
  | 'Development'
  | 'Client Review'
  | 'Completed';

export interface WebsiteRequest {
  requestId: string;
  customerName: string;
  email: string;
  phone: string;
  businessName: string;
  websiteType: WebsiteType;
  description: string;
  services: string[];
  pages: string[];
  designPreferences: string;
  socialLinks: string;
  features: string[];
  additionalRequirements: string;
  serviceType: ServiceType;
  fastServiceFee: number;
  deliveryTime: string;
  status: RequestStatus;
  fileNames?: string[];
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  features: string[];
  demoUrl: string;
  isFeatured: boolean;
}

export interface PricingConfig {
  basePackagePrice: number;
  fastServiceFee: number;
  standardDeliveryTime: string;
  fastDeliveryTime: string;
}

export interface AdminSettings {
  contactEmail: string;
  whatsappNumber: string;
  adminPin: string;
}

export interface ProjectFile {
  id: string;
  requestId: string;
  userId?: string | null;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  bucket: string;
  uploadedBy: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  requestId?: string | null;
  senderId?: string | null;
  senderName: string;
  senderEmail: string;
  role: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
