-- Fix relationships for Messaging Center metadata joins
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_tenant_id_fkey;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_landlord_id_fkey;

ALTER TABLE public.conversations 
  ADD CONSTRAINT conversations_tenant_id_fkey 
  FOREIGN KEY (tenant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.conversations 
  ADD CONSTRAINT conversations_landlord_id_fkey 
  FOREIGN KEY (landlord_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ensure RLS is still solid
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' AND policyname = 'Users can see their own conversations'
    ) THEN
        CREATE POLICY "Users can see their own conversations"
        ON public.conversations FOR SELECT
        USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);
    END IF;
END $$;
