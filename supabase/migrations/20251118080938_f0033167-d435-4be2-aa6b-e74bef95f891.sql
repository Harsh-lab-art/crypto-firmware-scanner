-- Create enum for ISA types
CREATE TYPE public.isa_type AS ENUM (
  'arm',
  'arm64',
  'x86',
  'x86_64',
  'mips',
  'riscv',
  'avr',
  'unknown'
);

-- Create enum for crypto algorithm types
CREATE TYPE public.crypto_type AS ENUM (
  'aes',
  'rsa',
  'ecc',
  'sha',
  'md5',
  'hmac',
  'prng',
  'xor',
  'des',
  'rc4',
  'non_crypto',
  'unknown'
);

-- Create firmware analysis table
CREATE TABLE public.firmware_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  isa isa_type NOT NULL DEFAULT 'unknown',
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analysis_status TEXT NOT NULL DEFAULT 'pending',
  total_functions INTEGER DEFAULT 0,
  crypto_functions INTEGER DEFAULT 0,
  analysis_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create detected functions table
CREATE TABLE public.detected_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.firmware_analyses(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  function_name TEXT NOT NULL,
  classification crypto_type NOT NULL,
  confidence DECIMAL(5, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  is_crypto BOOLEAN NOT NULL DEFAULT false,
  instruction_count INTEGER,
  basic_blocks INTEGER,
  cfg_complexity INTEGER,
  similar_library TEXT,
  similarity_score DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create protocol flows table
CREATE TABLE public.protocol_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.firmware_analyses(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  description TEXT NOT NULL,
  functions TEXT[] NOT NULL,
  confidence DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for firmware files
INSERT INTO storage.buckets (id, name, public)
VALUES ('firmware', 'firmware', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.firmware_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_flows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for firmware_analyses
CREATE POLICY "Users can view their own analyses"
ON public.firmware_analyses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses"
ON public.firmware_analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
ON public.firmware_analyses
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for detected_functions
CREATE POLICY "Users can view functions from their analyses"
ON public.detected_functions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.firmware_analyses
    WHERE id = detected_functions.analysis_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create functions for their analyses"
ON public.detected_functions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.firmware_analyses
    WHERE id = detected_functions.analysis_id
    AND user_id = auth.uid()
  )
);

-- RLS Policies for protocol_flows
CREATE POLICY "Users can view protocol flows from their analyses"
ON public.protocol_flows
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.firmware_analyses
    WHERE id = protocol_flows.analysis_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create protocol flows for their analyses"
ON public.protocol_flows
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.firmware_analyses
    WHERE id = protocol_flows.analysis_id
    AND user_id = auth.uid()
  )
);

-- Storage policies for firmware bucket
CREATE POLICY "Users can upload their own firmware"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'firmware' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own firmware"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'firmware' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for firmware_analyses
CREATE TRIGGER update_firmware_analyses_updated_at
BEFORE UPDATE ON public.firmware_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.firmware_analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.detected_functions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.protocol_flows;