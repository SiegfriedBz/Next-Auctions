-- Call the close-auctions Edge Function every 5 minutes with pg_cron.
-- Same job as on the live project ("Cron => close auction", created in the dashboard),
-- but the URL and key come from Vault so no secret is committed.
--
-- Create the two Vault secrets once per project, before this migration runs:
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<service_role key>', 'service_role_key');
-- Without them the job is not scheduled (a warning is logged) and an existing job is left as is;
-- create the secrets, then run the DO block below by hand.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DO $$
BEGIN
  IF (
    SELECT count(*) FROM vault.decrypted_secrets
    WHERE name IN ('project_url', 'service_role_key')
  ) = 2 THEN
    -- Same name as the live job, so cron.schedule replaces it instead of adding a second one
    PERFORM cron.schedule(
      'Cron => close auction',
      '*/5 * * * *',
      $cmd$
      SELECT net.http_post(
        url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
          || '/functions/v1/close-auctions',
        -- verify_jwt = true for close-auctions, so the call needs a JWT
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
        ),
        body := '{}'::jsonb
      ) AS request_id;
      $cmd$
    );
  ELSE
    RAISE WARNING 'close-auctions not scheduled: create the Vault secrets project_url and service_role_key, then run this DO block by hand';
  END IF;
END $$;
