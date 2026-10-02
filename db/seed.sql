-- Stable Finance Bank — baseline rows for a new database.
-- Secrets are intentionally omitted; configure SMTP and set a new email_hook_secret in app_config.

insert into public.site_settings (id, brand_name, tagline, logo_url, primary_color, accent_color, contact_email, contact_phone, address, routing_number, public_url)
values (1, 'Stable Finance Bank', 'Stable money. Modern banking.', '/mark.png', '#1B17FF', '#4B48FF', 'support@stf-b.com', '+1 (800) 555-0110', '100 Harbor St, Boston, MA', '011000138', 'https://www.stf-b.com')
on conflict (id) do nothing;

insert into public.smtp_settings (id, host, port, secure, username, password, from_name, from_email, enabled, provider, api_key, reply_to)
values (1, '', 465, true, '', '', 'Stable Finance Bank', '', false, 'smtp', '', '')
on conflict (id) do nothing;

insert into public.app_config (key, value) values
  ('app_url', 'https://www.stf-b.com'),
  ('email_hook_url', 'https://www.stf-b.com/api/public/email-hook')
on conflict (key) do nothing;

-- Insert a newly generated email_hook_secret separately before enabling email hooks.
