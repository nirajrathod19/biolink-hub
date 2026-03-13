
-- =============================================
-- PHASE 2: Community & Monetization Tables
-- =============================================

-- 1. Micro-Community Feed: Creator Posts
CREATE TABLE public.creator_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  content text NOT NULL,
  hearts_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view creator posts"
  ON public.creator_posts FOR SELECT USING (true);

CREATE POLICY "Creators can manage their own posts"
  ON public.creator_posts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_creator_posts_updated_at
  BEFORE UPDATE ON public.creator_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Post Reactions (hearts)
CREATE TABLE public.post_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.creator_posts(id) ON DELETE CASCADE,
  visitor_ip text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, visitor_ip)
);

ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON public.post_reactions FOR SELECT USING (true);

CREATE POLICY "Anyone can insert reactions"
  ON public.post_reactions FOR INSERT WITH CHECK (true);

-- 3. Post Comments
CREATE TABLE public.post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.creator_posts(id) ON DELETE CASCADE,
  visitor_name text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved comments"
  ON public.post_comments FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can submit comments"
  ON public.post_comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can manage comments on their posts"
  ON public.post_comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_posts
      WHERE creator_posts.id = post_comments.post_id
        AND creator_posts.user_id = auth.uid()
    )
  );

-- 4. Live Q&A Questions
CREATE TABLE public.qa_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_user_id uuid NOT NULL,
  question text NOT NULL,
  asker_name text NOT NULL DEFAULT 'Anonymous',
  asker_email text,
  is_paid boolean NOT NULL DEFAULT false,
  tip_amount numeric DEFAULT 0,
  answer_text text,
  answer_video_url text,
  is_public boolean NOT NULL DEFAULT false,
  is_answered boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  answered_at timestamp with time zone
);

ALTER TABLE public.qa_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view answered public questions"
  ON public.qa_questions FOR SELECT
  USING (is_public = true AND is_answered = true);

CREATE POLICY "Anyone can submit questions"
  ON public.qa_questions FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can manage their questions"
  ON public.qa_questions FOR ALL
  USING (auth.uid() = creator_user_id)
  WITH CHECK (auth.uid() = creator_user_id);

-- 5. Flash Sale / Limited Drop columns on digital_products
ALTER TABLE public.digital_products
  ADD COLUMN IF NOT EXISTS max_quantity integer,
  ADD COLUMN IF NOT EXISTS copies_sold integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_flash_sale boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS flash_sale_ends_at timestamp with time zone;

-- 6. Enable realtime for community feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.creator_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;
