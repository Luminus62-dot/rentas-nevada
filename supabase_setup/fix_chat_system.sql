-- Fix RLS for Conversations and Messages
-- This ensures users can update deletion flags and status, and that messages are un-hidden on new activity.

-- 1. Enable UPDATE for Conversations (Crucial for triggers and deletion flags)
CREATE POLICY "Users can update their own conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

-- 2. Enable UPDATE for Messages (Mark as read)
CREATE POLICY "Users can update messages in their conversations"
ON public.messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM conversations
        WHERE id = messages.conversation_id
        AND (tenant_id = auth.uid() OR landlord_id = auth.uid())
    )
);

-- 3. Automatically Un-hide Conversations on New Message
-- This improves UX: if someone sends a message, the chat should reappear for everyone.
CREATE OR REPLACE FUNCTION handle_new_message_sync()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET 
        updated_at = now(),
        deleted_by_tenant = false,
        deleted_by_landlord = false
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace existing trigger or create if missing
DROP TRIGGER IF EXISTS tr_update_conversation_timestamp ON public.messages;
CREATE TRIGGER tr_handle_new_message_sync
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION handle_new_message_sync();
