
-- Add whatsapp_number to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- RLS policies on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Creators can view their orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow creators to delete their own products
CREATE POLICY "Users can delete their own products" ON public.products FOR DELETE TO authenticated USING (auth.uid() = creator_id);

-- Enable realtime on orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage RLS policies for product-images
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Users can update their product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Users can delete their product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
