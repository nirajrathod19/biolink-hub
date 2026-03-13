
-- Drop the restrictive "Anyone can submit questions" policy and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can submit questions" ON public.qa_questions;

CREATE POLICY "Anyone can submit questions"
ON public.qa_questions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
