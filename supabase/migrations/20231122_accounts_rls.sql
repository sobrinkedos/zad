-- Enable RLS on accounts table
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for authenticated users (development)
CREATE POLICY "allow select for all" ON public.accounts FOR SELECT USING (true);

-- Optionally allow UPDATE for role changes (authenticated)
CREATE POLICY "allow update role" ON public.accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
