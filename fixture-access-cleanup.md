```sql
-- Function to remove expired fixture access grants
CREATE OR REPLACE FUNCTION public.cleanup_expired_fixture_access()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_fixture_access
  WHERE granted_at < NOW() - INTERVAL '2 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule the cleanup function to run daily
-- This uses pg_cron, which needs to be enabled on your Supabase instance.
-- Go to Database -> Extensions and enable pg_cron.
-- Then run this from the SQL editor.
SELECT cron.schedule(
    'daily-fixture-cleanup', -- name of the cron job
    '0 0 * * *', -- cron syntax for every day at midnight
    'SELECT public.cleanup_expired_fixture_access()'
);
```

---

### Manual Cleanup

To manually clean up existing entries that are older than 2 days, you can run the following command directly in your SQL editor. This is useful for the initial cleanup before the cron job takes over.

```sql
DELETE FROM public.user_fixture_access
WHERE granted_at < NOW() - INTERVAL '2 days';
```
