DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('NEW_BID', 'NEW_AUCTION_WON', 'NEW_PAYMENT');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    read BOOLEAN DEFAULT false,
    type notification_type DEFAULT 'NEW_BID' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id
    ON public.notifications (recipient_id);

CREATE INDEX IF NOT EXISTS idx_notifications_auction_id
    ON public.notifications (auction_id);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON public.notifications (created_at DESC);

-- 
-- TRIGGER FUNCTION TO UPDATE updated_at
CREATE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER BEFORE UPDATE
CREATE TRIGGER trigger_update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notifications_updated_at();

-- 
-- TRIGGER FUNCTION to notify auction owner & previous bidders of a new bid => NEW_BID
CREATE OR REPLACE FUNCTION handle_new_bid()
RETURNS TRIGGER AS $$
DECLARE
    auction_owner UUID;
    bidder UUID;
    previous_bidders UUID[];
BEGIN
    -- Who placed the bid
    bidder := NEW.bidder_id;

    -- Find the auction owner
    SELECT owner_id INTO auction_owner
    FROM public.auctions
    WHERE id = NEW.auction_id;

    -- Find all previous bidders (excluding the current bidder)
    SELECT ARRAY_AGG(DISTINCT bidder_id)
    INTO previous_bidders
    FROM public.bids
    WHERE auction_id = NEW.auction_id
        AND bidder_id <> bidder;

    -- Notify the auction owner if not the bidder
    IF auction_owner <> bidder THEN
        INSERT INTO public.notifications (auction_id, recipient_id, type)
        VALUES (NEW.auction_id, auction_owner, 'NEW_BID');
    END IF;

    -- Notify all previous bidders
    IF previous_bidders IS NOT NULL THEN
        INSERT INTO public.notifications (auction_id, recipient_id, type)
        SELECT NEW.auction_id, UNNEST(previous_bidders), 'NEW_BID';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for AFTER INSERT on bids
DROP TRIGGER IF EXISTS on_bid_insert ON public.bids;

CREATE TRIGGER on_bid_insert
AFTER INSERT ON public.bids
FOR EACH ROW
EXECUTE FUNCTION handle_new_bid();

-- 
-- TRIGGER FUNCTION to notify auction owner & highest bidder of a new auction won => NEW_AUCTION_WON
CREATE OR REPLACE FUNCTION handle_close_auction_with_bid()
RETURNS TRIGGER AS $$
DECLARE
    auction_owner UUID;
    highest_bidder UUID;
    previous_bidders UUID[];
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status)
        AND NEW.status = 'CLOSED'
        AND NEW.highest_bidder_id IS NOT NULL
    THEN
        -- Who is the auction owner
        auction_owner := NEW.owner_id;

        -- Who placed the highest bidder
        highest_bidder := NEW.highest_bidder_id;

        -- Notify the auction owner 
        INSERT INTO public.notifications (auction_id, recipient_id, type)
        VALUES (NEW.id, auction_owner, 'NEW_AUCTION_WON');

        -- Notify the highest bidder
        INSERT INTO public.notifications (auction_id, recipient_id, type)
        VALUES (NEW.id, highest_bidder, 'NEW_AUCTION_WON');

        -- OPTION - IF WE HAD A 'AUCTION_CLOSED' - LATER
        -- Find all previous bidders (excluding the highest_bidder)
        -- SELECT ARRAY_AGG(DISTINCT bidder_id)
        -- INTO previous_bidders
        -- FROM public.bids
        -- WHERE auction_id = NEW.id
        --     AND bidder_id <> highest_bidder;
        -- Notify all previous bidders
        -- IF previous_bidders IS NOT NULL THEN
        --     INSERT INTO public.notifications (auction_id, recipient_id, type)
        --     SELECT NEW.id, UNNEST(previous_bidders), 'AUCTION_CLOSED';
        -- END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for AFTER UPDATE on auctions
DROP TRIGGER IF EXISTS on_close_auction_with_bid ON public.auctions;

CREATE TRIGGER on_close_auction_with_bid
AFTER UPDATE ON public.auctions
FOR EACH ROW
EXECUTE FUNCTION handle_close_auction_with_bid();

-- 
-- TRIGGER FUNCTION to notify auction owner of a new payment => NEW_PAYMENT
CREATE OR REPLACE FUNCTION handle_auction_paid()
RETURNS TRIGGER AS $$
DECLARE
    auction_owner UUID;
BEGIN
    IF  OLD.paid_at IS NULL
        AND NEW.paid_at IS NOT NULL
    THEN
        auction_owner := NEW.owner_id;

        INSERT INTO public.notifications (auction_id, recipient_id, type)
        VALUES (NEW.id, auction_owner, 'NEW_PAYMENT');

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for AFTER UPDATE on auctions
DROP TRIGGER IF EXISTS on_auction_is_paid ON public.auctions;

CREATE TRIGGER on_auction_is_paid
AFTER UPDATE ON public.auctions
FOR EACH ROW
EXECUTE FUNCTION handle_auction_paid();

-- 
-- TRIGGER FUNCTION to broadcast notification changes on user:<id>:notifications (Realtime)
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

-- Create trigger for AFTER INSERT, UPDATE or DELETE on notifications
DROP TRIGGER IF EXISTS notifications_broadcast_trigger ON public.notifications;

CREATE TRIGGER notifications_broadcast_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.broadcast_notifications_changes();
