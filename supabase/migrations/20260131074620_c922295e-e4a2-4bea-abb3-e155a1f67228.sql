-- Create guide_pages table to store How to Use guide content
CREATE TABLE public.guide_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image', -- 'image', 'pdf', 'video'
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.guide_pages ENABLE ROW LEVEL SECURITY;

-- Everyone can view active guide pages
CREATE POLICY "Anyone can view active guide pages"
ON public.guide_pages
FOR SELECT
USING (is_active = true);

-- Only admins can manage guide pages
CREATE POLICY "Admins can manage guide pages"
ON public.guide_pages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_guide_pages_updated_at
BEFORE UPDATE ON public.guide_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for guide files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guide-files', 
  'guide-files', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm']
);

-- Storage policies for guide files
CREATE POLICY "Guide files are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'guide-files');

CREATE POLICY "Admins can upload guide files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'guide-files' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update guide files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'guide-files' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete guide files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'guide-files' 
  AND has_role(auth.uid(), 'admin'::app_role)
);