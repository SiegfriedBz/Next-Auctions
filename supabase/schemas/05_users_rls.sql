-- ENABLE RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ROLE USER POLICIES
-- 1. USERS CAN CREATE AN ACCOUNT
CREATE POLICY "users_can_create_account"
ON users
FOR INSERT
WITH CHECK (
  id = auth.uid()
);

-- 2. USERS CAN VIEW THEIR OWN ACCOUNT
CREATE POLICY "users_can_view_own_account"
ON users
FOR SELECT
USING (
  id = auth.uid()
);

-- 3. USERS CAN UPDATE THEIR OWN ACCOUNT
CREATE POLICY "users_can_update_own_account"
ON users
FOR UPDATE
USING (
  id = auth.uid()
)
WITH CHECK (
  id = auth.uid()
);

-- 4. USERS CAN DELETE THEIR OWN ACCOUNT
CREATE POLICY "users_can_delete_own_account"
ON users
FOR DELETE
USING (
  id = auth.uid()
);

-- VIEWS 
-- 1. Create a view that only exposes partial user data.
-- An email is only returned to its owner, and a seller's to the winner of their closed auction.
CREATE VIEW public.users_public AS
SELECT
  u.id,
  u.first_name,
  u.last_name,
  CASE
    WHEN u.id = auth.uid() THEN u.email
    WHEN EXISTS (
      SELECT 1
      FROM public.auctions a
      WHERE a.owner_id = u.id
        AND a.highest_bidder_id = auth.uid()
        AND a.status = 'CLOSED'
    ) THEN u.email
  END AS email,
  u.avatar_url
FROM public.users u;

-- 2. Create a view that only exposes a safe count
CREATE VIEW public.users_stats AS
SELECT COUNT(*) AS total_users
FROM public.users;

-- ROLE ADMIN POLICIES
-- 1. ADMINS CAN VIEW ALL ACCOUNTS
CREATE POLICY "admins_can_view_all_accounts"
ON users
FOR SELECT
USING (is_admin(auth.uid()));

-- 2. ADMINS CAN UPDATE ANY ACCOUNT
CREATE POLICY "admins_can_update_any_account"
ON users
FOR UPDATE
USING (is_admin(auth.uid()));

-- 3. ADMINS CAN DELETE ANY ACCOUNT
CREATE POLICY "admins_can_delete_any_account"
ON users
FOR DELETE
USING (is_admin(auth.uid()));


-- ENFORCE THAT ONLY ADMIN CAN CHANGE ROLES
CREATE FUNCTION enforce_user_role_update()
RETURNS TRIGGER AS $$
DECLARE
  caller_is_admin boolean;
BEGIN
  -- only check if role is changing
  IF NEW.role <> OLD.role THEN
    -- check if the user performing the update is admin
    SELECT is_admin(auth.uid()) INTO caller_is_admin;
    IF NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only admin can change user roles';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_user_role_update
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION enforce_user_role_update();

-- Note: Some cross-table policies affecting users (e.g., preventing deletion if they have active bids)
-- are defined in cross_policies.sql