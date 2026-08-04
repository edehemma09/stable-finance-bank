-- Stable Finance Bank — baseline rows
-- Run AFTER db/schema.sql. Safe to re-run.

insert into public.site_settings (id, brand_name, tagline, logo_url, primary_color, accent_color, contact_email, contact_phone, address)
values (
  1,
  'Stable Finance Bank',
  'Your trusted banking partner',
  'https://stf-b.com/images/brand.png',
  '#1B17FF',
  '#B98A2E',
  'support@stf-b.com',
  '+1 (800) 000-0000',
  '1 Market Street, Suite 100'
)
on conflict (id) do nothing;

insert into public.smtp_settings (id, host, port, secure, username, password, from_name, from_email, enabled)
values (1, 'smtp.example.com', 465, true, 'no-reply@stf-b.com', '', 'Stable Finance Bank', 'no-reply@stf-b.com', false)
on conflict (id) do nothing;
