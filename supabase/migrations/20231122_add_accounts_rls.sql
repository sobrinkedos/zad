-- Enable RLS on accounts table
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for any authenticated user
CREATE POLICY allow_select ON public.accounts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow UPDATE of role only by the owner of the row
CREATE POLICY allow_update_role ON public.accounts
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
