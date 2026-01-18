-- Tabla para Logs de Actividad (Auditoría)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL, -- 'verify_user', 'delete_listing', 'update_role', etc
    details jsonb, -- { target_id, old_value, new_value }
    ip_address text,
    created_at timestamptz DEFAULT now()
);

-- RLS: Solo Admins pueden leer
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can see logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Función para insertar logs fácilmente
CREATE OR REPLACE FUNCTION public.log_action(
    p_user_id uuid,
    p_action text,
    p_details jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
    INSERT INTO public.audit_logs (user_id, action, details)
    VALUES (p_user_id, p_action, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
