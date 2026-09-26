-- ============================================================
--  SiteForge - Complete Supabase Schema Migration
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Shared helper: auto-set updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ================================================================
-- 1. PROFILES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  phone       TEXT,
  country     TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role  ON public.profiles(role);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;
CREATE POLICY "profiles_admin_update_all" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ================================================================
-- 2. SERVICES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  price        NUMERIC(12,2),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_public_read" ON public.services;
CREATE POLICY "services_public_read" ON public.services
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "services_admin_all" ON public.services;
CREATE POLICY "services_admin_all" ON public.services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ================================================================
-- 3. WEBSITE_REQUESTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.website_requests (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id              TEXT NOT NULL UNIQUE,
  user_id                 UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name           TEXT NOT NULL,
  email                   TEXT NOT NULL,
  phone                   TEXT,
  country                 TEXT,
  business_name           TEXT NOT NULL,
  website_type            TEXT NOT NULL,
  business_category       TEXT,
  description             TEXT NOT NULL,
  pages                   TEXT[] DEFAULT '{}',
  features                TEXT[] DEFAULT '{}',
  services                TEXT[] DEFAULT '{}',
  design_preferences      TEXT,
  existing_url            TEXT,
  social_links            TEXT,
  reference_websites      TEXT,
  logo_available          BOOLEAN,
  content_available       BOOLEAN,
  domain_requirement      TEXT,
  hosting_requirement     TEXT,
  budget                  TEXT,
  additional_requirements TEXT,
  service_type            TEXT NOT NULL DEFAULT 'Standard' CHECK (service_type IN ('Standard', 'Fast')),
  fast_service_fee        NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_time           TEXT,
  status                  TEXT NOT NULL DEFAULT 'New'
    CHECK (status IN ('New','Contacted','Requirements Reviewed','Design','Development','Client Review','Completed','Cancelled')),
  file_names              TEXT[] DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wr_request_id   ON public.website_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_wr_email        ON public.website_requests(email);
CREATE INDEX IF NOT EXISTS idx_wr_user_id      ON public.website_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_wr_status       ON public.website_requests(status);
CREATE INDEX IF NOT EXISTS idx_wr_created_at   ON public.website_requests(created_at DESC);

CREATE TRIGGER trg_wr_updated_at
  BEFORE UPDATE ON public.website_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.website_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wr_insert_anyone" ON public.website_requests;
CREATE POLICY "wr_insert_anyone" ON public.website_requests
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "wr_select_public_tracking" ON public.website_requests;
CREATE POLICY "wr_select_public_tracking" ON public.website_requests
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "wr_update_admin" ON public.website_requests;
CREATE POLICY "wr_update_admin" ON public.website_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "wr_delete_admin" ON public.website_requests;
CREATE POLICY "wr_delete_admin" ON public.website_requests
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ================================================================
-- 4. PROJECTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  category     TEXT NOT NULL,
  description  TEXT,
  image_url    TEXT,
  features     TEXT[] DEFAULT '{}',
  demo_url     TEXT,
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(is_featured DESC);

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_public_read" ON public.projects;
CREATE POLICY "projects_public_read" ON public.projects
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "projects_admin_all" ON public.projects;
CREATE POLICY "projects_admin_all" ON public.projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ================================================================
-- 5. ORDERS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    UUID NOT NULL REFERENCES public.website_requests(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_number  TEXT NOT NULL UNIQUE,
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'INR',
  status        TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','refunded','cancelled')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_request_id ON public.orders(request_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON public.orders(user_id);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;
CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ================================================================
-- 6. PAYMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount              NUMERIC(12,2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'INR',
  gateway             TEXT,
  gateway_payment_id  TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','success','failed','refunded')),
  paid_at             TIMESTAMPTZ,
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "payments_admin_all" ON public.payments;
CREATE POLICY "payments_admin_all" ON public.payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ================================================================
-- 7. PROJECT_FILES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.project_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID REFERENCES public.website_requests(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_name   TEXT NOT NULL,
  file_path   TEXT NOT NULL,
  file_size   BIGINT,
  mime_type   TEXT,
  bucket      TEXT NOT NULL DEFAULT 'project-files',
  uploaded_by TEXT DEFAULT 'customer' CHECK (uploaded_by IN ('customer','admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pf_request_id ON public.project_files(request_id);

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pf_insert_authenticated" ON public.project_files;
CREATE POLICY "pf_insert_authenticated" ON public.project_files
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "pf_select_own" ON public.project_files;
CREATE POLICY "pf_select_own" ON public.project_files
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pf_admin_all" ON public.project_files;
CREATE POLICY "pf_admin_all" ON public.project_files
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ================================================================
-- 8. MESSAGES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   UUID REFERENCES public.website_requests(id) ON DELETE CASCADE,
  sender_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_name  TEXT,
  sender_email TEXT,
  role         TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin','system')),
  content      TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_request_id ON public.messages(request_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_insert_all" ON public.messages;
CREATE POLICY "messages_insert_all" ON public.messages
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "messages_select_all" ON public.messages;
CREATE POLICY "messages_select_all" ON public.messages
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "messages_admin_all" ON public.messages;
CREATE POLICY "messages_admin_all" ON public.messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ================================================================
-- 9. NOTIFICATIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT,
  type       TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  link       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user_id ON public.notifications(user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_select_own" ON public.notifications;
CREATE POLICY "notif_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_update_own" ON public.notifications;
CREATE POLICY "notif_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_admin_all" ON public.notifications;
CREATE POLICY "notif_admin_all" ON public.notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ================================================================
-- 10. ADMIN_ACTIVITY_LOGS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  table_name TEXT,
  record_id  TEXT,
  old_data   JSONB,
  new_data   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aal_admin_id   ON public.admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_aal_created_at ON public.admin_activity_logs(created_at DESC);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aal_admin_all" ON public.admin_activity_logs;
CREATE POLICY "aal_admin_all" ON public.admin_activity_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ================================================================
-- 11. PRICING_CONFIG
-- ================================================================
CREATE TABLE IF NOT EXISTS public.pricing_config (
  id                     INTEGER PRIMARY KEY DEFAULT 1,
  base_package_price     NUMERIC(12,2) NOT NULL DEFAULT 14999,
  fast_service_fee       NUMERIC(12,2) NOT NULL DEFAULT 3000,
  standard_delivery_time TEXT NOT NULL DEFAULT '10-14 business days',
  fast_delivery_time     TEXT NOT NULL DEFAULT '5-7 business days',
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pricing_config_singleton CHECK (id = 1)
);

ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pricing_public_read" ON public.pricing_config;
CREATE POLICY "pricing_public_read" ON public.pricing_config
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "pricing_admin_write" ON public.pricing_config;
CREATE POLICY "pricing_admin_write" ON public.pricing_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

INSERT INTO public.pricing_config (id, base_package_price, fast_service_fee, standard_delivery_time, fast_delivery_time)
VALUES (1, 14999, 3000, '10-14 business days', '5-7 business days')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 12. ADMIN_SETTINGS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id               INTEGER PRIMARY KEY DEFAULT 1,
  contact_email    TEXT NOT NULL DEFAULT 'hello@siteforge.in',
  whatsapp_number  TEXT NOT NULL DEFAULT '+919876543210',
  admin_pin        TEXT NOT NULL DEFAULT 'admin123',
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_settings_singleton CHECK (id = 1)
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_settings_public_read" ON public.admin_settings;
CREATE POLICY "admin_settings_public_read" ON public.admin_settings
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "admin_settings_admin_write" ON public.admin_settings;
CREATE POLICY "admin_settings_admin_write" ON public.admin_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

INSERT INTO public.admin_settings (id, contact_email, whatsapp_number, admin_pin)
VALUES (1, 'hello@siteforge.in', '+919876543210', 'admin123')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- Status change notification trigger
-- ================================================================
CREATE OR REPLACE FUNCTION public.notify_request_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (
      NEW.user_id,
      'Project Status Updated',
      'Your project "' || NEW.business_name || '" is now: ' || NEW.status,
      'info',
      '#tracking'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wr_notify_status ON public.website_requests;
CREATE TRIGGER trg_wr_notify_status
  AFTER UPDATE OF status ON public.website_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_request_status_change();
