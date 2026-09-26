-- SiteForge Migration Chunk 3: Update existing tables RLS + add user_id + triggers for existing tables

-- Add missing columns to website_requests (if they don't exist)
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='website_requests' AND column_name='user_id') THEN
    ALTER TABLE public.website_requests ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='website_requests' AND column_name='country') THEN
    ALTER TABLE public.website_requests ADD COLUMN country TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='website_requests' AND column_name='business_category') THEN
    ALTER TABLE public.website_requests ADD COLUMN business_category TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='website_requests' AND column_name='existing_url') THEN
    ALTER TABLE public.website_requests ADD COLUMN existing_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='website_requests' AND column_name='reference_websites') THEN
    ALTER TABLE public.website_requests ADD COLUMN reference_websites TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='website_requests' AND column_name='logo_available') THEN
    ALTER TABLE public.website_requests ADD COLUMN logo_available BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='website_requests' AND column_name='content_available') THEN
    ALTER TABLE public.website_requests ADD COLUMN content_available BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='website_requests' AND column_name='domain_requirement') THEN
    ALTER TABLE public.website_requests ADD COLUMN domain_requirement TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='website_requests' AND column_name='hosting_requirement') THEN
    ALTER TABLE public.website_requests ADD COLUMN hosting_requirement TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='website_requests' AND column_name='budget') THEN
    ALTER TABLE public.website_requests ADD COLUMN budget TEXT;
  END IF;
END
$do$;

CREATE INDEX IF NOT EXISTS idx_wr_user_id ON public.website_requests(user_id);

-- Add trigger for updated_at on website_requests (if not exists)
DROP TRIGGER IF EXISTS trg_wr_updated_at ON public.website_requests;
CREATE TRIGGER trg_wr_updated_at
  BEFORE UPDATE ON public.website_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS on website_requests
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

-- RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_public_read" ON public.projects;
CREATE POLICY "projects_public_read" ON public.projects
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "projects_admin_all" ON public.projects;
CREATE POLICY "projects_admin_all" ON public.projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- trigger for projects updated_at
DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- trigger for pricing_config updated_at
DROP TRIGGER IF EXISTS trg_pricing_updated_at ON public.pricing_config;
CREATE TRIGGER trg_pricing_updated_at
  BEFORE UPDATE ON public.pricing_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- trigger for admin_settings updated_at
DROP TRIGGER IF EXISTS trg_settings_updated_at ON public.admin_settings;
CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Upgrade pricing_config with correct defaults if empty / wrong
UPDATE public.pricing_config SET
  standard_delivery_time = '10-14 business days',
  fast_delivery_time = '5-7 business days'
WHERE id = 1
  AND (standard_delivery_time = '6-7 Days' OR fast_delivery_time = 'Up to 3 Days');

-- Notification trigger on status change
CREATE OR REPLACE FUNCTION public.notify_request_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $body$
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
$body$;

DROP TRIGGER IF EXISTS trg_wr_notify_status ON public.website_requests;
CREATE TRIGGER trg_wr_notify_status
  AFTER UPDATE OF status ON public.website_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_request_status_change();
