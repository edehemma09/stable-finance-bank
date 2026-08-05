import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, FileEdit, Settings, LifeBuoy, ShieldCheck, Landmark, FileCheck2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const u = (await supabase.auth.getUser()).data.user;
    if (!u) throw redirect({ to: "/auth" });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
    const roles = (data ?? []).map((r) => r.role);
    if (!roles.includes("admin") && !roles.includes("support")) throw redirect({ to: "/app" });
  },
  component: AdminShell,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/kyc", label: "KYC review", icon: ShieldCheck },
  { to: "/admin/loans", label: "Loan decisions", icon: Landmark },
  { to: "/admin/cheques", label: "Cheque queue", icon: FileCheck2 },
  { to: "/admin/tickets", label: "Tickets", icon: LifeBuoy },
  { to: "/admin/recycle", label: "Recycle bin", icon: Trash2 },
  { to: "/admin/cms", label: "CMS", icon: FileEdit },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];


function AdminShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-60 shrink-0 border-r bg-card p-4 md:block">
        <p className="px-2 pb-4 font-display text-xl">Stable Finance Admin</p>
        <nav className="space-y-1">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? path === to : path.startsWith(to);
            return (
              <Link key={to} to={to as never} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <Icon className="h-4 w-4" />{label}
              </Link>
            );
          })}
        </nav>
        <Link to="/app" className="mt-6 block px-3 text-xs text-muted-foreground hover:text-foreground">← Back to banking</Link>
      </aside>
      <main className="flex-1"><Outlet /></main>
    </div>
  );
}
