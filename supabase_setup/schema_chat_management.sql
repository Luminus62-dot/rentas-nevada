-- Add status and deletion flags to conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'finished'));
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_by_tenant BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_by_landlord BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN conversations.status IS 'Status of the chat: active or finished (by landlord)';
COMMENT ON COLUMN conversations.deleted_by_tenant IS 'Flag to hide chat for tenant';
COMMENT ON COLUMN conversations.deleted_by_landlord IS 'Flag to hide chat for landlord';
