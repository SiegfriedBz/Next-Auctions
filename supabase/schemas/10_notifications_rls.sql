-- Enable Row-Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: allow users to SELECT their own notifications
CREATE POLICY select_own_notifications
ON public.notifications
FOR SELECT
USING (recipient_id = auth.uid());

-- Policy: allow users to UPDATE their own notifications (mark as read)
CREATE POLICY update_own_notifications
ON public.notifications
FOR UPDATE
USING (recipient_id = auth.uid());
-- Policy: allow users to receive broadcasts on their own private channel (Realtime)
CREATE POLICY receive_own_notifications_broadcast
ON realtime.messages
FOR SELECT
TO authenticated
USING (
    realtime.topic() = 'user:' || auth.uid()::text || ':notifications'
    AND realtime.messages.extension = 'broadcast'
);
