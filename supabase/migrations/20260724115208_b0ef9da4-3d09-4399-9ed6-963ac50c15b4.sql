
-- Add hero_image column and seed images + sub-menu pages
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS hero_image TEXT;

-- Update existing pages with hero images (unsplash, unbranded stock)
UPDATE public.pages SET hero_image = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80' WHERE slug = 'home';
UPDATE public.pages SET hero_image = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80' WHERE slug = 'personal';
UPDATE public.pages SET hero_image = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80' WHERE slug = 'business';
UPDATE public.pages SET hero_image = 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=80' WHERE slug = 'accounts';
UPDATE public.pages SET hero_image = 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=1200&q=80' WHERE slug = 'cards';
UPDATE public.pages SET hero_image = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80' WHERE slug = 'loans-mortgage';
UPDATE public.pages SET hero_image = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80' WHERE slug = 'investments';
UPDATE public.pages SET hero_image = 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&q=80' WHERE slug = 'security';
UPDATE public.pages SET hero_image = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80' WHERE slug = 'about';
UPDATE public.pages SET hero_image = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80' WHERE slug = 'careers';
UPDATE public.pages SET hero_image = 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=1200&q=80' WHERE slug = 'contact';

-- Insert sub-menu pages
INSERT INTO public.pages (slug, title, hero_title, hero_subtitle, hero_image, in_nav, published, blocks, nav_order)
VALUES
  ('checking', 'Checking', 'Checking that fits every day.', 'No monthly fees, early direct deposit, and instant transfers between your accounts.',
    'https://images.unsplash.com/photo-1556742205-e10c9486e506?w=1200&q=80', false, true,
    '[{"type":"features","title":"Why Meridian Checking","items":[{"title":"No monthly fees","body":"Keep more of what you earn — zero maintenance fees, ever."},{"title":"Early direct deposit","body":"Get paid up to 2 days early with qualifying deposits."},{"title":"Nationwide ATMs","body":"Fee-free access at 30,000+ ATMs across the country."}]},{"type":"cta","title":"Open a Checking account","button":"Get started","to":"/auth"}]'::jsonb, 100),
  ('savings', 'Savings & Certificates', 'Grow what you save.', 'High-yield savings and certificates with rates that reward loyalty.',
    'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=1200&q=80', false, true,
    '[{"type":"features","title":"Ways to save","items":[{"title":"High-yield savings","body":"Competitive APY on every dollar, no minimum balance."},{"title":"Share certificates","body":"Lock in a rate for terms from 3 months to 5 years."},{"title":"Money market","body":"Higher rates with tiered balances and check access."}]},{"type":"cta","title":"Start saving today","button":"Open savings","to":"/auth"}]'::jsonb, 101),
  ('rewards-cards', 'Rewards Credit Cards', 'Cards that give back.', 'Earn cash back and points on every purchase, with no annual fee.',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80', false, true,
    '[{"type":"features","title":"Rewards you''ll actually use","items":[{"title":"Cash back","body":"1.5% back on everything, 3% on gas and groceries."},{"title":"Travel points","body":"2x points on travel, redeemable with no blackout dates."},{"title":"No annual fee","body":"Keep more of what you earn."}]},{"type":"cta","title":"Apply in minutes","button":"Apply now","to":"/auth"}]'::jsonb, 102),
  ('low-rate-cards', 'Low-Rate Credit Cards', 'Rates that make sense.', 'Simple, low-APR credit cards designed to help you pay less interest.',
    'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?w=1200&q=80', false, true,
    '[{"type":"features","title":"Simple, honest pricing","items":[{"title":"Low APR","body":"Rates as low as 8.99% for qualified borrowers."},{"title":"No hidden fees","body":"No annual, balance transfer, or foreign transaction fees."},{"title":"Flexible payments","body":"Pay on your terms with no penalties."}]},{"type":"cta","title":"Check your rate","button":"Get started","to":"/auth"}]'::jsonb, 103),
  ('home-loans', 'Home Loans', 'Home loans, human service.', 'Mortgages and home equity products with clear rates and dedicated advisors.',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80', false, true,
    '[{"type":"features","title":"Home financing","items":[{"title":"Fixed & adjustable","body":"15, 20, and 30-year terms with competitive rates."},{"title":"First-time buyers","body":"Low down payment programs and closing cost assistance."},{"title":"HELOC & refinance","body":"Tap into your equity or lower your monthly payment."}]},{"type":"cta","title":"Talk to a loan officer","button":"Start application","to":"/contact"}]'::jsonb, 104),
  ('auto-loans', 'Auto Loans', 'Drive off with confidence.', 'New, used, and refinance auto loans with pre-approval in minutes.',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80', false, true,
    '[{"type":"features","title":"Auto financing","items":[{"title":"New & used","body":"Competitive rates on any vehicle, dealer or private party."},{"title":"Refinance","body":"Lower your rate or monthly payment on an existing loan."},{"title":"Pre-approval","body":"Shop with confidence — get approved before you visit the lot."}]},{"type":"cta","title":"Get pre-approved","button":"Apply now","to":"/auth"}]'::jsonb, 105),
  ('personal-loans', 'Personal Loans', 'Flexible personal loans.', 'Fixed-rate loans for consolidation, big purchases, or unexpected expenses.',
    'https://images.unsplash.com/photo-1554224154-26032cdc0c1a?w=1200&q=80', false, true,
    '[{"type":"features","title":"Personal loans","items":[{"title":"Fixed rate","body":"Predictable monthly payments — no surprises."},{"title":"No collateral","body":"Unsecured loans up to $50,000 for qualified members."},{"title":"Fast funding","body":"Funds in your account as soon as the next business day."}]},{"type":"cta","title":"See your rate","button":"Apply now","to":"/auth"}]'::jsonb, 106),
  ('brokerage', 'Brokerage', 'Invest with clarity.', 'Self-directed brokerage accounts with commission-free stock and ETF trades.',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80', false, true,
    '[{"type":"features","title":"Invest your way","items":[{"title":"Commission-free","body":"No commissions on online stock and ETF trades."},{"title":"Research tools","body":"Real-time quotes, charts, and analyst reports."},{"title":"Advisor access","body":"Talk to a licensed advisor when you need guidance."}]},{"type":"cta","title":"Open a brokerage account","button":"Get started","to":"/auth"}]'::jsonb, 107),
  ('retirement', 'Retirement', 'Retire on your terms.', 'IRAs, rollovers, and retirement planning built around your goals.',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80', false, true,
    '[{"type":"features","title":"Retirement accounts","items":[{"title":"Traditional & Roth IRAs","body":"Tax-advantaged retirement savings with flexible contributions."},{"title":"401(k) rollovers","body":"Consolidate old retirement accounts into one."},{"title":"Planning tools","body":"Free retirement calculators and 1:1 planning sessions."}]},{"type":"cta","title":"Start planning","button":"Open an IRA","to":"/auth"}]'::jsonb, 108),
  ('business-checking', 'Business Checking', 'Checking that works for your business.', 'Business checking with no monthly fees and unlimited transactions.',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80', false, true,
    '[{"type":"features","title":"Business banking","items":[{"title":"No monthly fees","body":"Keep more of your revenue."},{"title":"Unlimited transactions","body":"No transaction limits on qualifying accounts."},{"title":"Integrations","body":"Connect with QuickBooks, Xero, and your favorite tools."}]},{"type":"cta","title":"Open a business account","button":"Get started","to":"/auth"}]'::jsonb, 109),
  ('business-cards', 'Business Cards', 'Cards for growing businesses.', 'Business credit and debit cards with employee controls and expense tracking.',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80', false, true,
    '[{"type":"features","title":"Business cards","items":[{"title":"Employee cards","body":"Issue cards with individual limits and controls."},{"title":"Expense tracking","body":"Automatic categorization and receipt capture."},{"title":"Rewards","body":"Earn cash back on business expenses."}]},{"type":"cta","title":"Apply for a business card","button":"Apply now","to":"/auth"}]'::jsonb, 110),
  ('merchant-services', 'Merchant Services', 'Take payments anywhere.', 'Card processing, POS terminals, and online payments for businesses of every size.',
    'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=1200&q=80', false, true,
    '[{"type":"features","title":"Merchant services","items":[{"title":"POS terminals","body":"Countertop, mobile, and tablet-based options."},{"title":"Online payments","body":"Accept payments on your website or in your app."},{"title":"Transparent pricing","body":"No hidden fees — you keep more of every sale."}]},{"type":"cta","title":"Talk to sales","button":"Contact us","to":"/contact"}]'::jsonb, 111)
ON CONFLICT (slug) DO NOTHING;
