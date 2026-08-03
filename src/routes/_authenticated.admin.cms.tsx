import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/cms")({
  component: Cms,
});

function Cms() {
  const { data } = useQuery({
    queryKey: ["admin", "pages"],
    queryFn: async () => (await supabase.from("pages").select("id,slug,title,nav_label,nav_order,in_nav,published").order("nav_order")).data ?? [],
  });
  return (
    <div className="p-4 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Content management</p>
      <h1 className="font-display text-3xl">Marketing pages</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((p) => (
          <div key={p.id} className="rounded-xl border bg-card p-4">
            <p className="font-medium">{p.title}</p>
            <p className="font-mono text-xs text-muted-foreground">/{p.slug}</p>
            <div className="mt-3 flex items-center gap-2 text-[11px]">
              <span className={`rounded-full border px-2 py-0.5 ${p.published ? "border-success/30 bg-success/10 text-success" : "text-muted-foreground"}`}>{p.published ? "Published" : "Draft"}</span>
              {p.in_nav && <span className="rounded-full border px-2 py-0.5 text-muted-foreground">In nav</span>}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">Block editor, logo and brand upload arrive in the CMS pass — <Link to="/admin/settings" className="underline">site settings</Link>.</p>
    </div>
  );
}
