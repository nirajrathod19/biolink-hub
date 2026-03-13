-- Enable realtime for click_logs and links tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.click_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.links;