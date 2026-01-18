-- Tabla para Alertas de Búsqueda
CREATE TABLE IF NOT EXISTS public.search_alerts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    criteria jsonb NOT NULL, -- { city, type, maxPrice, area, etc }
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.search_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own alerts"
    ON public.search_alerts
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
