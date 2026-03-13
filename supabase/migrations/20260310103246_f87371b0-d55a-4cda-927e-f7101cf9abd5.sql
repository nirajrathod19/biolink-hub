
CREATE TABLE public.link_display_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  condition_type TEXT NOT NULL DEFAULT 'source',
  condition_value TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL DEFAULT 'show',
  link_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.link_display_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own rules"
  ON public.link_display_rules
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view active rules"
  ON public.link_display_rules
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE INDEX idx_link_display_rules_user_id ON public.link_display_rules (user_id);
CREATE INDEX idx_link_display_rules_priority ON public.link_display_rules (user_id, priority);
