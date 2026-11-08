-- users_public returned every user's email to anyone with the public anon key.
-- Same columns, but an email is now only returned to its owner,
-- and a seller's to the winner of their closed auction.
create or replace view "public"."users_public" as
select
  u.id,
  u.first_name,
  u.last_name,
  case
    when u.id = auth.uid() then u.email
    when exists (
      select 1
      from public.auctions a
      where a.owner_id = u.id
        and a.highest_bidder_id = auth.uid()
        and a.status = 'CLOSED'
    ) then u.email
  end as email,
  u.avatar_url
from public.users u;
