-- Stable Finance Bank — baseline rows
-- Run AFTER db/schema.sql. Safe to re-run.

insert into public.site_settings (id, brand_name, tagline, logo_url, primary_color, accent_color, contact_email, contact_phone, address)
values (
  1,
  'Stable Finance Bank',
  'Stable money. Modern banking.',
  '/mark.png',
  '#1B17FF',
  '#4B48FF',
  'support@stf-b.com',
  '+1 (800) 000-0000',
  '1 Market Street, Suite 100'
)
on conflict (id) do nothing;

insert into public.smtp_settings (id, host, port, secure, username, password, from_name, from_email, enabled)
values (1, 'smtp.example.com', 465, true, 'no-reply@stf-b.com', '', 'Stable Finance Bank', 'no-reply@stf-b.com', false)
on conflict (id) do nothing;
insert into public.pages (slug,title,meta_description,hero_title,hero_subtitle,hero_image,nav_label,nav_order,in_nav,published,blocks) values ('home','Stable Finance Bank','Everyday checking, high-yield savings, cards and loans from Stable Finance Bank — open an account online in minutes.','Stable money. Modern banking.','Checking, savings, cards and loans built for real life — with clear rates, no surprise fees, and support from real people.','/hero-home.jpg','Home',0,false,true,'[{"type": "tiles", "items": [{"to": "/checking", "icon": "wallet", "label": "Checking"}, {"to": "/savings", "icon": "piggy", "label": "Savings"}, {"to": "/credit-cards", "icon": "card", "label": "Credit Cards"}, {"to": "/home-loans", "icon": "home", "label": "Home Loans"}, {"to": "/auto-loans", "icon": "car", "label": "Auto Loans"}, {"to": "/investments", "icon": "bank", "label": "Investments"}], "title": "What can we help you with?"}, {"type": "promos", "items": [{"to": "/mortgage", "cta": "See mortgage rates", "body": "Lock a competitive fixed rate and close in as few as 21 days with a dedicated loan officer.", "image": "/promo-mortgage.jpg", "title": "Mortgages from 5.75% APR"}, {"to": "/credit-cards", "cta": "Compare cards", "body": "Earn 2% back on everyday spend, plus contactless tap-to-pay and instant card freeze.", "image": "/promo-card.jpg", "title": "Cash-back card, no annual fee"}, {"to": "/savings", "cta": "Start saving", "body": "No minimum balance, no monthly fee, and interest compounded daily on every dollar.", "image": "/promo-savings.jpg", "title": "High-yield savings at 4.30% APY"}], "title": "Rates & offers"}, {"type": "features", "items": [{"body": "Apply online with a photo ID and start moving money the same day.", "title": "Open in minutes"}, {"body": "No hidden maintenance fees, no surprise overdraft traps, no fine-print gotchas.", "title": "Clear, honest pricing"}, {"body": "Instant alerts, card freeze, and account-level verification on every sensitive change.", "title": "Security you can see"}], "title": "Banking that stays out of your way"}, {"type": "stats", "items": [{"k": "4.30%", "v": "APY on high-yield savings"}, {"k": "$0", "v": "Monthly maintenance fee on checking"}, {"k": "24/7", "v": "Support from real people"}]}, {"to": "/auth", "cta": "Open an account", "body": "Switch your direct deposit, bring your bills across, and we will help you close out the old account.", "type": "billboard", "title": "Move your everyday banking to Stable Finance", "kicker": "Members first"}, {"to": "/auth", "body": "Open a Stable Finance Bank account online in about five minutes.", "type": "cta", "title": "Ready when you are", "button": "Get started"}]'::jsonb) on conflict (slug) do nothing;
