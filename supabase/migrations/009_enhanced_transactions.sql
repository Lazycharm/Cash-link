-- Enhanced Transaction System with Dual Confirmation
-- Run this in Supabase SQL Editor

-- Add new columns to transactions table for dual confirmation and fee tracking
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS customer_confirmed BOOLEAN DEFAULT false;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS agent_confirmed BOOLEAN DEFAULT false;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(15,2) DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fee_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS network TEXT; -- e.g., 'mtn_money', 'mpesa'
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;

-- Update status automatically when both parties confirm
CREATE OR REPLACE FUNCTION update_transaction_status()
RETURNS TRIGGER AS $$
BEGIN
    -- When both customer and agent confirm, mark as completed
    IF NEW.customer_confirmed = true AND NEW.agent_confirmed = true AND OLD.status != 'completed' THEN
        NEW.status := 'completed';
        NEW.confirmed_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS transaction_dual_confirm ON transactions;
CREATE TRIGGER transaction_dual_confirm
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_transaction_status();

-- Add agent_settings column (JSONB for flexible settings storage)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_settings JSONB DEFAULT '{}'::jsonb;

-- Add other agent profile columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS supported_networks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fee_structure JSONB DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS amount_limits JSONB DEFAULT '{"min": 10, "max": 50000}'::jsonb;

-- Create index for faster transaction queries
CREATE INDEX IF NOT EXISTS idx_transactions_agent_status ON transactions(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_status ON transactions(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_date ON transactions(created_date DESC);
