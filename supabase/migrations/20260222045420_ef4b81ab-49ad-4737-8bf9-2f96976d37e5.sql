
-- Allow public visitors to view active store integrations (only non-sensitive columns will be selected by the app)
CREATE POLICY "Public can view active store integrations"
ON public.store_integrations
FOR SELECT
USING (is_active = true);

-- Allow public visitors to view enabled tip jars
CREATE POLICY "Public can view enabled tip jars"
ON public.tip_jar
FOR SELECT
USING (is_enabled = true);
