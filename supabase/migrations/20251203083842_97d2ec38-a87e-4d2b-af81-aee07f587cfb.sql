-- Add enhanced protocol detection columns to protocol_flows
ALTER TABLE public.protocol_flows
ADD COLUMN IF NOT EXISTS protocol_type text DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS is_crypto boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS handshake_method text,
ADD COLUMN IF NOT EXISTS key_exchange text,
ADD COLUMN IF NOT EXISTS encryption_algorithm text,
ADD COLUMN IF NOT EXISTS authentication_method text,
ADD COLUMN IF NOT EXISTS security_level text DEFAULT 'unknown';

-- Add comment for clarity
COMMENT ON COLUMN public.protocol_flows.protocol_type IS 'Type of protocol: tls, dtls, ssh, ipsec, custom, non_crypto, unknown';
COMMENT ON COLUMN public.protocol_flows.is_crypto IS 'Whether this protocol step involves cryptographic operations';
COMMENT ON COLUMN public.protocol_flows.handshake_method IS 'Handshake method used: client_hello, server_hello, key_share, etc';
COMMENT ON COLUMN public.protocol_flows.key_exchange IS 'Key exchange algorithm: ECDHE, DHE, RSA, X25519, etc';
COMMENT ON COLUMN public.protocol_flows.encryption_algorithm IS 'Encryption algorithm: AES-128-GCM, AES-256-CBC, ChaCha20, etc';
COMMENT ON COLUMN public.protocol_flows.authentication_method IS 'Authentication method: RSA, ECDSA, HMAC, PSK, etc';
COMMENT ON COLUMN public.protocol_flows.security_level IS 'Security assessment: high, medium, low, deprecated';