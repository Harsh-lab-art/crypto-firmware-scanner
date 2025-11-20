-- Add blockchain transaction hash column to firmware_analyses
ALTER TABLE firmware_analyses 
ADD COLUMN blockchain_tx_hash text,
ADD COLUMN blockchain_block_number bigint,
ADD COLUMN blockchain_logged_at timestamp with time zone;

-- Create index for efficient blockchain queries
CREATE INDEX idx_firmware_analyses_blockchain_tx ON firmware_analyses(blockchain_tx_hash) WHERE blockchain_tx_hash IS NOT NULL;