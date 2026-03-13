
-- Profile layout elements table for drag-and-drop canvas editing
CREATE TABLE public.profile_layout_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  element_type text NOT NULL DEFAULT 'link',
  element_id text,
  position_x numeric DEFAULT 0,
  position_y numeric DEFAULT 0,
  z_index integer DEFAULT 1,
  opacity numeric DEFAULT 100,
  width numeric DEFAULT 100,
  height numeric DEFAULT 100,
  is_absolute boolean DEFAULT false,
  custom_asset_url text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add layout_config JSONB to profiles for global layout settings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS layout_config jsonb DEFAULT '{}'::jsonb;

-- Enable RLS
ALTER TABLE public.profile_layout_elements ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own layout elements"
  ON public.profile_layout_elements FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view layout elements"
  ON public.profile_layout_elements FOR SELECT
  TO anon, authenticated
  USING (true);