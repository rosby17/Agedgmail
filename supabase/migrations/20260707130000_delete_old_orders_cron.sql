-- Schedule a monthly cron job to automatically delete orders older than 30 days
-- Runs on the 2nd of each month at 00:00 UTC for privacy protection.
select cron.schedule(
  'delete-old-orders-monthly',
  '0 0 2 * *',
  $$
  delete from public.orders
  where created_at < now() - interval '30 days';
  $$
);
