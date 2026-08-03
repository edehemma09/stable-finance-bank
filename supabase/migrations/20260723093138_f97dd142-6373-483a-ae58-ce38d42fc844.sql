
UPDATE public.pages SET blocks = '[
  {"type":"tiles","title":"Everyday personal banking","items":[
    {"label":"Checking","icon":"wallet","to":"/accounts"},
    {"label":"Savings","icon":"piggy","to":"/accounts"},
    {"label":"Credit Cards","icon":"card","to":"/cards"},
    {"label":"Auto","icon":"car","to":"/loans-mortgage"},
    {"label":"Mortgage","icon":"home","to":"/loans-mortgage"},
    {"label":"Investments","icon":"bank","to":"/investments"}
  ]},
  {"type":"features","title":"Built around your day","items":[
    {"title":"One clean app","body":"Move money, freeze cards, pay bills, deposit checks — no menu maze."},
    {"title":"Alerts you actually want","body":"Balance thresholds, large transactions, and card usage — configured your way."},
    {"title":"Human support","body":"Ticket a banker in-app. Answers, not scripts."}
  ]},
  {"type":"cta","title":"Open a Meridian account today","button":"Enroll now"}
]'::jsonb WHERE slug = 'personal';

UPDATE public.pages SET blocks = '[
  {"type":"tiles","title":"Business banking essentials","items":[
    {"label":"Checking","icon":"wallet","to":"/business"},
    {"label":"Cards","icon":"card","to":"/business"},
    {"label":"Payroll","icon":"briefcase","to":"/business"},
    {"label":"Loans","icon":"bank","to":"/loans-mortgage"},
    {"label":"Merchant","icon":"award","to":"/business"},
    {"label":"Advisor","icon":"heart","to":"/contact"}
  ]},
  {"type":"promos","title":"Tools that scale with you","items":[
    {"title":"Business Checking","body":"Zero monthly fees for the first year. Unlimited transactions.","cta":"Get started","to":"/auth"},
    {"title":"Business Credit","body":"Cash-back and travel cards designed for growing teams.","cta":"Compare cards","to":"/cards"},
    {"title":"Financing","body":"Working capital, equipment loans, and commercial mortgages.","cta":"Talk to us","to":"/contact"}
  ]},
  {"type":"cta","title":"Grow with Meridian for Business","button":"Open a business account"}
]'::jsonb WHERE slug = 'business';

UPDATE public.pages SET blocks = '[
  {"type":"tiles","title":"Cards for every budget","items":[
    {"label":"Rewards","icon":"award","to":"/cards"},
    {"label":"Cash Back","icon":"wallet","to":"/cards"},
    {"label":"Travel","icon":"sparkle","to":"/cards"},
    {"label":"Low Rate","icon":"card","to":"/cards"},
    {"label":"Secured","icon":"shield","to":"/cards"},
    {"label":"Business","icon":"briefcase","to":"/business"}
  ]},
  {"type":"promos","title":"Featured cards","items":[
    {"title":"Meridian Platinum","body":"1.99% intro APR on balance transfers for 12 months.","cta":"Apply","to":"/auth"},
    {"title":"Meridian Cash Rewards","body":"1.75% cash back on everything — no categories to track.","cta":"Apply","to":"/auth"},
    {"title":"Meridian Travel","body":"3x points on travel & dining. No foreign transaction fees.","cta":"Apply","to":"/auth"}
  ]}
]'::jsonb WHERE slug = 'cards';

UPDATE public.pages SET blocks = '[
  {"type":"tiles","title":"Ways to bank & save","items":[
    {"label":"Free Checking","icon":"wallet","to":"/accounts"},
    {"label":"High-Yield Savings","icon":"piggy","to":"/accounts"},
    {"label":"Certificates","icon":"award","to":"/accounts"},
    {"label":"Money Market","icon":"bank","to":"/accounts"},
    {"label":"Student","icon":"grad","to":"/accounts"},
    {"label":"Youth","icon":"heart","to":"/accounts"}
  ]},
  {"type":"features","title":"All the essentials, none of the friction","items":[
    {"title":"$0 monthly fees","body":"Simple pricing. No minimums to keep or maintenance charges."},
    {"title":"Early paycheck access","body":"Get paid up to two days early with direct deposit."},
    {"title":"Round-ups to savings","body":"Automatically stash spare change from everyday spending."}
  ]}
]'::jsonb WHERE slug = 'accounts';

UPDATE public.pages SET blocks = '[
  {"type":"tiles","title":"Borrow with confidence","items":[
    {"label":"Home Purchase","icon":"home","to":"/loans-mortgage"},
    {"label":"Refinance","icon":"home","to":"/loans-mortgage"},
    {"label":"Auto","icon":"car","to":"/loans-mortgage"},
    {"label":"Personal","icon":"wallet","to":"/loans-mortgage"},
    {"label":"Student","icon":"grad","to":"/loans-mortgage"},
    {"label":"HELOC","icon":"bank","to":"/loans-mortgage"}
  ]},
  {"type":"promos","title":"Today’s rates","items":[
    {"title":"30-year Fixed Mortgage","body":"Competitive rates with dedicated loan officers.","cta":"Get pre-qualified","to":"/auth"},
    {"title":"Auto Loan","body":"Refinance and save — most members lower their monthly payment.","cta":"Apply","to":"/auth"},
    {"title":"Personal Loan","body":"Consolidate debt into a single, fixed monthly payment.","cta":"Check your rate","to":"/auth"}
  ]}
]'::jsonb WHERE slug = 'loans-mortgage';

UPDATE public.pages SET blocks = '[
  {"type":"tiles","title":"Grow your money","items":[
    {"label":"Brokerage","icon":"bank","to":"/investments"},
    {"label":"Retirement","icon":"piggy","to":"/investments"},
    {"label":"Advisor","icon":"heart","to":"/investments"},
    {"label":"IRA","icon":"award","to":"/investments"},
    {"label":"Education","icon":"grad","to":"/investments"},
    {"label":"Trusts","icon":"shield","to":"/investments"}
  ]},
  {"type":"features","title":"Investing without the jargon","items":[
    {"title":"Low fees","body":"Transparent pricing. No sneaky account minimums."},
    {"title":"Long-term thinking","body":"Portfolios built for decades, not quarters."},
    {"title":"Real guidance","body":"Chat with a fiduciary advisor — no hard sell."}
  ]}
]'::jsonb WHERE slug = 'investments';
