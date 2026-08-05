import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Menu, X, MapPin, Search, Lock, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { BrandMark } from "./brand";
import { siteSettingsQuery, sessionQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";

type NavGroup = { label: string; items: { label: string; to: string }[] };

const SEGMENTS: { key: "personal" | "business" | "membership"; label: string; groups: NavGroup[] }[] = [
  {
    key: "personal",
    label: "Personal",
    groups: [
      { label: "Checking & Savings", items: [
        { label: "Checking", to: "/checking" },
        { label: "Savings & Certificates", to: "/savings" },
        { label: "Money Market", to: "/money-market" },
        { label: "Certificates", to: "/certificates" },
      ]},
      { label: "Loans & Credit Cards", items: [
        { label: "Auto Loans", to: "/auto-loans" },
        { label: "Credit Cards", to: "/credit-cards" },
        { label: "Personal Loans", to: "/personal-loans" },
        { label: "Student Loans", to: "/student-loans" },
        { label: "Rewards Cards", to: "/rewards-cards" },
        { label: "Low-Rate Cards", to: "/low-rate-cards" },
      ]},
      { label: "Mortgage", items: [
        { label: "Home Loans", to: "/home-loans" },
        { label: "Mortgage Overview", to: "/mortgage" },
        { label: "Refinance", to: "/refinance" },
        { label: "HELOC", to: "/heloc" },
        { label: "First-Time Homebuyer", to: "/first-time-homebuyer" },
      ]},
      { label: "Investments & Insurance", items: [
        { label: "Brokerage", to: "/brokerage" },
        { label: "Retirement", to: "/retirement" },
        { label: "Insurance", to: "/insurance" },
      ]},
    ],
  },
  {
    key: "business",
    label: "Business",
    groups: [
      { label: "Business Banking", items: [
        { label: "Business Checking", to: "/business-checking" },
        { label: "Business Cards", to: "/business-cards" },
        { label: "Merchant Services", to: "/merchant-services" },
        { label: "Business Loans", to: "/business-loans" },
      ]},
    ],
  },
  {
    key: "membership",
    label: "Membership",
    groups: [
      { label: "About", items: [
        { label: "About us", to: "/about" },
        { label: "Eligibility", to: "/eligibility" },
        { label: "Member Benefits", to: "/benefits" },
        { label: "Careers", to: "/careers" },
      ]},
      { label: "Resources", items: [
        { label: "MakingCents", to: "/making-cents" },
        { label: "Security Center", to: "/security" },
        { label: "Contact", to: "/contact" },
      ]},
    ],
  },
];

export function MarketingShell({ children }: { children: ReactNode }) {
  const { data: settings } = useQuery(siteSettingsQuery);
  const { data: user } = useQuery(sessionQuery);
  const [open, setOpen] = useState(false);
  const [openSeg, setOpenSeg] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [activeSeg, setActiveSeg] = useState<"personal" | "business" | "membership">("personal");
  const segment = SEGMENTS.find((s) => s.key === activeSeg)!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50">
        <div className="bg-primary text-primary-foreground">
          <div className="container-page flex h-16 items-center justify-between gap-4">
            <BrandMark className="text-primary-foreground [&_span]:text-primary-foreground" />

            <nav className="hidden items-end gap-1 self-end md:flex">
              {SEGMENTS.map((s) => {
                const active = s.key === activeSeg;
                return (
                  <button
                    key={s.key}
                    onMouseEnter={() => setActiveSeg(s.key)}
                    onFocus={() => setActiveSeg(s.key)}
                    onClick={() => setActiveSeg(s.key)}
                    className={`px-5 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-background text-foreground rounded-t-md"
                        : "text-primary-foreground/85 hover:text-primary-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <a href="/contact" className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/85 hover:text-primary-foreground">
                <MapPin className="h-4 w-4" /> Branches & ATMs
              </a>
              {user ? (
                <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/app"><Lock className="mr-1.5 h-4 w-4" />Open Account</Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/auth"><Lock className="mr-1.5 h-4 w-4" />Sign In</Link>
                </Button>
              )}
              <button aria-label="Search" className="text-primary-foreground/85 hover:text-primary-foreground">
                <Search className="h-5 w-5" />
              </button>
            </div>

            <button className="md:hidden text-primary-foreground" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className="relative z-50 hidden border-b border-border/70 bg-background shadow-sm md:block">
          <div className="container-page flex h-12 items-center gap-7">
            {segment.groups.map((g) => (
              <div key={g.label} className="group relative">
                <button className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-brand-blue hover:text-primary">
                  {g.label} <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <div className="pointer-events-none absolute left-0 top-full z-[100] mt-0 hidden min-w-[240px] rounded-b-md border border-border/70 bg-card p-2 shadow-lg group-hover:pointer-events-auto group-hover:block">
                  {g.items.map((it) => (
                    <Link key={it.label} to={it.to} className="block rounded px-3 py-2 text-sm text-foreground hover:bg-surface">
                      {it.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {activeSeg === "membership" && (
              <Link to="/auth" search={{ mode: "signup" } as never} className="ml-auto whitespace-nowrap text-sm font-semibold text-accent hover:underline">
                Become a Member →
              </Link>
            )}
          </div>
        </div>

        {/* Mobile drawer — nested accordion */}
        {open && (
          <div className="border-t border-border/70 bg-background md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="container-page flex flex-col py-3">
              {SEGMENTS.map((s) => {
                const segOpen = openSeg === s.key;
                return (
                  <div key={s.key} className="border-b border-border/60">
                    <button
                      onClick={() => { setOpenSeg(segOpen ? null : s.key); setOpenGroup(null); }}
                      className="flex w-full items-center justify-between py-3 text-left text-sm font-bold uppercase tracking-wider text-primary"
                    >
                      {s.label}
                      <ChevronDown className={`h-4 w-4 transition-transform ${segOpen ? "rotate-180" : ""}`} />
                    </button>
                    {segOpen && (
                      <div className="pb-2">
                        {s.groups.map((g) => {
                          const gKey = s.key + "|" + g.label;
                          const gOpen = openGroup === gKey;
                          return (
                            <div key={g.label} className="border-t border-border/40">
                              <button
                                onClick={() => setOpenGroup(gOpen ? null : gKey)}
                                className="flex w-full items-center justify-between py-2.5 pl-3 pr-2 text-left text-sm font-semibold text-brand-blue"
                              >
                                {g.label}
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${gOpen ? "rotate-180" : ""}`} />
                              </button>
                              {gOpen && (
                                <div className="pb-2 pl-6">
                                  {g.items.map((it) => (
                                    <Link key={it.label} to={it.to} onClick={() => setOpen(false)} className="block rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted">
                                      {it.label}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="mt-4 flex gap-2 pb-2">
                {user ? (
                  <Button asChild size="sm" className="flex-1 bg-accent text-accent-foreground"><Link to="/app" onClick={() => setOpen(false)}>Open Account</Link></Button>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm" className="flex-1"><Link to="/auth" onClick={() => setOpen(false)}>Sign In</Link></Button>
                    <Button asChild size="sm" className="flex-1 bg-accent text-accent-foreground"><Link to="/auth" search={{ mode: "signup" } as never} onClick={() => setOpen(false)}>Enroll</Link></Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="bg-primary-dark text-primary-foreground">
        <div className="container-page grid gap-10 py-14 md:grid-cols-5">
          <div className="md:col-span-2">
            <BrandMark className="text-primary-foreground [&_span]:text-primary-foreground" />
            <p className="mt-4 max-w-sm text-sm text-primary-foreground/75">{settings?.tagline ?? "Banking built around your day."}</p>
            <p className="mt-4 text-xs text-primary-foreground/60">Routing #{settings?.routing_number ?? "000000000"} · Federally insured (illustrative)</p>
          </div>
          <FooterCol title="Personal" links={[
            { label: "Checking & Savings", to: "/accounts" },
            { label: "Credit Cards", to: "/credit-cards" },
            { label: "Loans & Mortgage", to: "/loans-mortgage" },
            { label: "Investments", to: "/investments" },
          ]} />
          <FooterCol title="Company" links={[
            { label: "About", to: "/about" },
            { label: "Careers", to: "/careers" },
            { label: "Contact", to: "/contact" },
            { label: "Business", to: "/business" },
          ]} />
          <FooterCol title="Legal & Security" links={[
            { label: "Security Center", to: "/security" },
            { label: "Privacy", to: "/legal/privacy" },
            { label: "Terms", to: "/legal/terms" },
          ]} />
        </div>
        <div className="border-t border-primary-foreground/15">
          <div className="container-page py-4 text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} {settings?.brand_name ?? "Stable Finance Bank"}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">{title}</p>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to + l.label}><Link to={l.to} className="text-primary-foreground/85 hover:text-primary-foreground hover:underline">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
