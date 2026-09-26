import { supabase } from '../lib/supabase';
import type { WebsiteRequest, Project, PricingConfig, AdminSettings, RequestStatus } from '../types';

// ─── Row-level type helpers (snake_case DB ↔ camelCase app) ─────────────────

type DbRequest = {
  request_id: string;
  customer_name: string;
  email: string;
  phone: string;
  business_name: string;
  website_type: string;
  description: string;
  services: string[];
  pages: string[];
  design_preferences: string;
  social_links: string;
  features: string[];
  additional_requirements: string;
  service_type: string;
  fast_service_fee: number;
  delivery_time: string;
  status: string;
  file_names: string[];
  user_id?: string | null;
  created_at: string;
  updated_at: string;
};

type DbProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  features: string[];
  demo_url: string;
  is_featured: boolean;
};

type DbPricing = {
  id: number;
  base_package_price: number;
  fast_service_fee: number;
  standard_delivery_time: string;
  fast_delivery_time: string;
};

type DbSettings = {
  id: number;
  contact_email: string;
  whatsapp_number: string;
  admin_pin: string;
};

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapRequest(r: DbRequest): WebsiteRequest {
  return {
    requestId: r.request_id,
    customerName: r.customer_name,
    email: r.email,
    phone: r.phone,
    businessName: r.business_name,
    websiteType: r.website_type as WebsiteRequest['websiteType'],
    description: r.description,
    services: r.services ?? [],
    pages: r.pages ?? [],
    designPreferences: r.design_preferences,
    socialLinks: r.social_links,
    features: r.features ?? [],
    additionalRequirements: r.additional_requirements,
    serviceType: r.service_type as WebsiteRequest['serviceType'],
    fastServiceFee: Number(r.fast_service_fee),
    deliveryTime: r.delivery_time,
    status: r.status as RequestStatus,
    fileNames: r.file_names ?? [],
    userId: r.user_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapProject(p: DbProject): Project {
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    description: p.description,
    imageUrl: p.image_url,
    features: p.features ?? [],
    demoUrl: p.demo_url,
    isFeatured: p.is_featured,
  };
}

function mapPricing(p: DbPricing): PricingConfig {
  return {
    basePackagePrice: Number(p.base_package_price),
    fastServiceFee: Number(p.fast_service_fee),
    standardDeliveryTime: p.standard_delivery_time,
    fastDeliveryTime: p.fast_delivery_time,
  };
}

function mapSettings(s: DbSettings): AdminSettings {
  return {
    contactEmail: s.contact_email,
    whatsappNumber: s.whatsapp_number,
    adminPin: s.admin_pin,
  };
}

// Pre-seeded projects for "Our Work" section
// ─── Listener system (for reactive UI updates after mutations) ────────────────

type StoreListener = () => void;

class Store {
  private listeners: StoreListener[] = [];

  public subscribe(listener: StoreListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // ─── Requests ──────────────────────────────────────────────────────────────

  public async getRequests(): Promise<WebsiteRequest[]> {
    const { data, error } = await supabase
      .from('website_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as DbRequest[]).map(mapRequest);
  }

  public async getRequestById(requestId: string): Promise<WebsiteRequest | undefined> {
    const { data, error } = await supabase
      .from('website_requests')
      .select('*')
      .ilike('request_id', requestId.trim())
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRequest(data as DbRequest) : undefined;
  }

  public async saveRequest(request: WebsiteRequest): Promise<void> {
    const row = {
      request_id: request.requestId,
      customer_name: request.customerName,
      email: request.email,
      phone: request.phone,
      business_name: request.businessName,
      website_type: request.websiteType,
      description: request.description,
      services: request.services,
      pages: request.pages,
      design_preferences: request.designPreferences,
      social_links: request.socialLinks,
      features: request.features,
      additional_requirements: request.additionalRequirements,
      service_type: request.serviceType,
      fast_service_fee: request.fastServiceFee,
      delivery_time: request.deliveryTime,
      status: request.status,
      file_names: request.fileNames ?? [],
      user_id: request.userId ?? null,
      created_at: request.createdAt,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('website_requests')
      .upsert(row, { onConflict: 'request_id' });
    if (error) throw new Error(error.message);
    this.notify();
  }

  public async getUserRequests(userId: string): Promise<WebsiteRequest[]> {
    const { data, error } = await supabase
      .from('website_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as DbRequest[]).map(mapRequest);
  }

  public async uploadProjectFile(
    requestId: string,
    file: File,
    userId?: string
  ): Promise<{ publicUrl: string; path: string }> {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${requestId}/${Date.now()}_${cleanName}`;
    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(filePath);

    // Record in project_files table
    await supabase.from('project_files').insert({
      request_id: requestId,
      user_id: userId || null,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream',
      bucket: 'project-files',
      uploaded_by: userId ? 'customer' : 'guest'
    });

    return { publicUrl, path: filePath };
  }

  public async getProjectFiles(requestId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  public async sendMessage(params: {
    name: string;
    email: string;
    message: string;
    requestId?: string;
    senderId?: string;
  }): Promise<void> {
    const { error } = await supabase.from('messages').insert({
      request_id: params.requestId || null,
      sender_id: params.senderId || null,
      sender_name: params.name,
      sender_email: params.email,
      role: 'customer',
      content: params.message,
      is_read: false,
    });
    if (error) throw new Error(error.message);
  }

  public async getMessages(): Promise<any[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  public async markMessageAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  public async updateRequestStatus(requestId: string, newStatus: RequestStatus): Promise<boolean> {
    const { error } = await supabase
      .from('website_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('request_id', requestId);
    if (error) throw new Error(error.message);
    this.notify();
    return true;
  }

  public async deleteRequest(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('website_requests')
      .delete()
      .eq('request_id', requestId);
    if (error) throw new Error(error.message);
    this.notify();
  }

  // ─── Projects ──────────────────────────────────────────────────────────────

  public async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('is_featured', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as DbProject[]).map(mapProject);
  }

  public async saveProject(project: Project): Promise<void> {
    const row = {
      id: project.id,
      title: project.title,
      category: project.category,
      description: project.description,
      image_url: project.imageUrl,
      features: project.features,
      demo_url: project.demoUrl,
      is_featured: project.isFeatured,
    };
    const { error } = await supabase
      .from('projects')
      .upsert(row, { onConflict: 'id' });
    if (error) throw new Error(error.message);
    this.notify();
  }

  public async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    if (error) throw new Error(error.message);
    this.notify();
  }

  // ─── Pricing ───────────────────────────────────────────────────────────────

  public async getPricing(): Promise<PricingConfig> {
    const { data, error } = await supabase
      .from('pricing_config')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw new Error(error.message);
    return mapPricing(data as DbPricing);
  }

  public async updatePricing(config: PricingConfig): Promise<void> {
    const { error } = await supabase
      .from('pricing_config')
      .update({
        base_package_price: config.basePackagePrice,
        fast_service_fee: config.fastServiceFee,
        standard_delivery_time: config.standardDeliveryTime,
        fast_delivery_time: config.fastDeliveryTime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);
    if (error) throw new Error(error.message);
    this.notify();
  }

  // ─── Settings ──────────────────────────────────────────────────────────────

  public async getSettings(): Promise<AdminSettings> {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw new Error(error.message);
    return mapSettings(data as DbSettings);
  }

  public async updateSettings(settings: AdminSettings): Promise<void> {
    const { error } = await supabase
      .from('admin_settings')
      .update({
        contact_email: settings.contactEmail,
        whatsapp_number: settings.whatsappNumber,
        admin_pin: settings.adminPin,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);
    if (error) throw new Error(error.message);
    this.notify();
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  public generateRequestId(): string {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `SF-${num}`;
  }
}

export const siteStore = new Store();
