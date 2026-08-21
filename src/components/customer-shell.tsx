import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Wallet, ArrowLeftRight, Upload, CreditCard, Receipt, FileText, Bell, User,
  LifeBuoy, LogOut, LineChart, Landmark, PiggyBank, Grid3X3, ShieldCheck, ChevronRight,
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { myProfileQuery, myRolesQuery, formatUSD } from "@/lib/queries";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

export const NAV: NavItem[] = [
  { to: "/app", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/app/accounts", label: "Accounts", icon: Wallet },
  { to: "/app/transfers", label: "Transfer", icon: ArrowLeftRight },
  { to: "/app/deposits", label: "Deposit", icon: Upload },
  { to: "/app/cards", label: "Cards", icon: CreditCard },
  { to: "/app/wealth", label: "Wealth", icon: LineChart },
  { to: "/app/loans", label: "Loans", icon: Landmark },
  { to: "/app/retirement", label: "IRA", icon: PiggyBank },
  { to: "/app/bills", label: "Bills", icon: Receipt },
  { to: "/app/statements", label: "Statements", icon: FileText },
  { to: "/app/alerts", label: "Alerts", icon: Bell },
  { to: "/app/support", label: "Support", icon: LifeBuoy },
  { to: "/app/profile", label: "Profile", icon: User },
];

const TABS = NAV.filter((n) => ["/app", "/app/accounts", "/app/transfers", "/app/wealth"].includes(n.to));
const MORE = NAV.filter((n) => !TABS.some((t) => t.to === n.to));

export function CustomerShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: profile } = useQuery(myProfileQuery);
  const { data: roles = [] } = useQuery(myRolesQuery);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [moreOpen, setMoreOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.avatar_url) {
      setAvatarUrl(null);
      return;
    }
    let active = true;
    void supabase.storage.from("avatars").createSignedUrl(profile.avatar_url, 3600).then(({ data }) => {
      if (active) setAvatarUrl(data?.signedUrl ?? null);
    });
    return () => { active = false; };
  }, [profile?.avatar_url]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const isActive = (to: string, exact?: boolean) => (exact ? path === to : path === to || path.startsWith(to + "/"));
  const moreActive = MORE.some((m) => isActive(m.to, m.exact));
  const initials = (profile?.full_name ?? profile?.email ?? "M").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-surface text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="border-b border-sidebar-border p-5"><BrandMark className="text-sidebar-foreground [&_span]:text-sidebar-foreground" /></div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <Link key={to} to={to as never} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive(to, exact) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}`}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
          {roles.includes("admin") && (
            <Link to="/admin" className="mt-4 flex items-center gap-3 rounded-lg border border-sidebar-border/60 px-3 py-2 text-sm text-sidebar-primary hover:bg-sidebar-accent/40">
              <ShieldCheck className="h-4 w-4" />Admin console
            </Link>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 px-2 text-xs">
            <p className="truncate text-sidebar-foreground/60">{profile?.email}</p>
            <p className="truncate font-medium">{profile?.full_name}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />Sign out
          </Button>
        </div>
      </aside>

      {/* Content */}
      <div className="md:pl-64">
        {/* Mobile app bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-primary px-4 text-primary-foreground md:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-accent text-sm font-bold text-primary">
              {avatarUrl ? <img src={avatarUrl} alt="" className="size-full object-cover" /> : initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-primary-foreground/70">Welcome back</p>
              <p className="truncate text-sm font-semibold">{profile?.full_name ?? profile?.email}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link to="/app/alerts" className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10"><Bell className="h-4 w-4" /></Link>
            <Link to="/app/profile" aria-label="Profile" className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-primary-foreground/10">
              {avatarUrl ? <img src={avatarUrl} alt="" className="size-full object-cover" /> : <User className="h-4 w-4" />}
            </Link>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)] pb-28 md:min-h-screen md:pb-0"><Outlet /></main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="mx-3 mb-3 grid grid-cols-5 items-end rounded-2xl border border-border/60 bg-background/95 px-1 py-1.5 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.25)] backdrop-blur">
          {TABS.slice(0, 2).map((t) => <Tab key={t.to} item={t} active={isActive(t.to, t.exact)} />)}

          {/* Center action */}
          <Link to="/app/transfers" className="flex flex-col items-center gap-1 pb-1">
            <span className={`grid h-12 w-12 -translate-y-4 place-items-center rounded-2xl shadow-lg ring-4 ring-background transition-transform active:scale-95 ${isActive("/app/transfers") ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
              <ArrowLeftRight className="h-5 w-5" />
            </span>
            <span className="-mt-3 text-[10px] font-semibold tracking-wide text-muted-foreground">Transfer</span>
          </Link>

          <Tab item={TABS[3]} active={isActive(TABS[3].to)} />

          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-semibold transition-colors ${moreActive ? "text-accent" : "text-muted-foreground"}`}>
                <Grid3X3 className="h-5 w-5" />More
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl pb-8">
              <SheetHeader className="text-left"><SheetTitle className="font-display text-xl">All services</SheetTitle></SheetHeader>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {MORE.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to as never} onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center text-[11px] font-semibold transition-colors ${isActive(to) ? "border-accent bg-accent/10 text-primary" : "bg-card text-primary hover:border-accent"}`}>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted"><Icon className="h-5 w-5" /></span>
                    {label}
                  </Link>
                ))}
              </div>
              {roles.includes("admin") && (
                <Link to="/admin" onClick={() => setMoreOpen(false)} className="mt-4 flex items-center justify-between rounded-2xl border bg-primary p-4 text-sm font-semibold text-primary-foreground">
                  <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Admin console</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
              <div className="mt-3 flex items-center justify-between rounded-2xl border bg-card p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{profile?.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">Daily limit {formatUSD(profile?.transaction_limit ?? 5000)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
}

function Tab({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link to={item.to as never} className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-semibold transition-colors ${active ? "text-accent" : "text-muted-foreground"}`}>
      <Icon className="h-5 w-5" />{item.label}
    </Link>
  );
}
