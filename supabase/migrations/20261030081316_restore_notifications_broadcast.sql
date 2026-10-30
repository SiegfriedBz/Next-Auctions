-- Restore the notifications broadcast dropped by 20251013200741_update_auctions_rls
-- (the trigger was not in supabase/schemas, so the generated diff removed it).
-- Each user listens on the private channel user:<id>:notifications.

-- Function to broadcast notification changes for realtime
CREATE OR REPLACE FUNCTION public.broadcast_notifications_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    -- NEW is NULL on DELETE
    'user:' || COALESCE(NEW.recipient_id, OLD.recipient_id) || ':notifications',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS notifications_broadcast_trigger ON public.notifications;

-- Create trigger on notifications table
CREATE TRIGGER notifications_broadcast_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.broadcast_notifications_changes();

-- Policy: private channels need read access on realtime.messages,
-- each user only on their own notifications channel.
-- Also drop the hand-made policy that let any authenticated user join any channel.
DROP POLICY IF EXISTS "Allow listening for broadcasts for authenticated users only" ON realtime.messages;
DROP POLICY IF EXISTS receive_own_notifications_broadcast ON realtime.messages;

CREATE POLICY receive_own_notifications_broadcast
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'user:' || auth.uid()::text || ':notifications'
  AND realtime.messages.extension = 'broadcast'
);
