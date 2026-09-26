-- SiteForge Migration Chunk 2: New Tables (services, messages, notifications, admin_activity_logs, project_files, orders, payments)

-- SERVICES
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
CREATE OR REPLACE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "services_public_read" ON public.services;
CREATE POLICY "services_public_read" ON public.services FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "services_admin_all" ON public.services;
CREATE POLICY "services_admin_all" ON public.services FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   TEXT,
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
CREATE POLICY "messages_insert_all" ON public.messages FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "messages_select_all" ON public.messages;
CREATE POLICY "messages_select_all" ON public.messages FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "messages_admin_all" ON public.messages;
CREATE POLICY "messages_admin_all" ON public.messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- NOTIFICATIONS
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
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif_update_own" ON public.notifications;
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif_admin_all" ON public.notifications;
CREATE POLICY "notif_admin_all" ON public.notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ADMIN_ACTIVITY_LOGS
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
CREATE POLICY "aal_admin_all" ON public.admin_activity_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- PROJECT_FILES
CREATE TABLE IF NOT EXISTS public.project_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  TEXT,
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
CREATE POLICY "pf_insert_authenticated" ON public.project_files FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "pf_select_own" ON public.project_files;
CREATE POLICY "pf_select_own" ON public.project_files FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "pf_admin_all" ON public.project_files;
CREATE POLICY "pf_admin_all" ON public.project_files FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
