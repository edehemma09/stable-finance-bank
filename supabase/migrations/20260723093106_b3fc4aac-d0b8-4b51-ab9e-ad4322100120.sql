
UPDATE public.site_settings SET tagline = 'Banking built around your day — checking, savings, cards, loans, and human support.';

UPDATE public.pages SET
  hero_title = 'Banking with clarity, care, and craft.',
  hero_subtitle = 'Everyday checking, high-yield savings, cards, home & auto loans, and investments — with real people when you need them.',
  blocks = '[
    {"type":"tiles","title":"How can we help?","items":[
      {"label":"Auto Loans","icon":"car","to":"/loans-mortgage"},
      {"label":"Credit Cards","icon":"card","to":"/cards"},
      {"label":"Mortgage","icon":"home","to":"/loans-mortgage"},
      {"label":"Checking","icon":"wallet","to":"/accounts"},
      {"label":"Savings","icon":"piggy","to":"/accounts"},
      {"label":"Investments","icon":"bank","to":"/investments"}
    ]},
    {"type":"promos","title":"Rates & offers","items":[
      {"title":"1.99% APR intro on Meridian Platinum","body":"Balance transfers for 12 months, then a low ongoing rate.","cta":"See card details","to":"/cards"},
      {"title":"4.10% APY High-Yield Savings","body":"No minimum. No monthly fees. Grow your cushion faster.","cta":"Open savings","to":"/accounts"},
      {"title":"Home loans, human guidance","body":"Purchase or refinance with a dedicated loan officer.","cta":"Explore mortgage","to":"/loans-mortgage"}
    ]},
    {"type":"billboard","kicker":"Membership","title":"Built for you, owned by you.","body":"Meridian is a member-first bank. Open an account online in minutes and get access to every product, no runaround.","cta":"Enroll now","to":"/auth"},
    {"type":"features","title":"Why members choose Meridian","items":[
      {"title":"Real people, real fast","body":"Message a banker in-app and get a response — not a queue."},
      {"title":"Fair fees, always","body":"No overdraft traps. No surprise charges. Clear pricing, everywhere."},
      {"title":"Security by design","body":"Card controls, alerts, and multi-factor sign-in built in from day one."}
    ]},
    {"type":"stats","items":[
      {"k":"$0","v":"Monthly fees on checking"},
      {"k":"4.10%","v":"APY high-yield savings"},
      {"k":"24/7","v":"Fraud monitoring & alerts"}
    ]},
    {"type":"cta","title":"Ready to bank with clarity?","body":"Open your Meridian account in minutes — from your phone or laptop.","button":"Enroll now"}
  ]'::jsonb
WHERE slug = 'home';
