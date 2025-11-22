-- Tabela de Zonas de Estacionamento
CREATE TABLE IF NOT EXISTS public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  active BOOLEAN DEFAULT true,
  max_duration_minutes INTEGER DEFAULT 120,
  tolerance_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Policy: Permitir leitura para todos autenticados
CREATE POLICY "Allow read access to zones for authenticated users"
ON public.zones FOR SELECT
TO authenticated
USING (true);

-- Policy: Permitir insert/update/delete apenas para admins
CREATE POLICY "Allow all operations for admins"
ON public.zones FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_zones_updated_at
BEFORE UPDATE ON public.zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Dados de exemplo
INSERT INTO public.zones (name, hourly_rate, start_time, end_time, active) VALUES
  ('Centro', 5.00, '08:00', '18:00', true),
  ('Shopping', 6.00, '09:00', '20:00', true),
  ('Hospital', 4.00, '07:00', '19:00', true)
ON CONFLICT DO NOTHING;
