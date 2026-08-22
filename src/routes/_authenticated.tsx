import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getBlockingAccountState } from "@/lib/account-state";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { redirect: location.href } });

    const blocked = await getBlockingAccountState();
    if (blocked) {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth", search: { state: blocked } });
    }

    return { user: data.user };
  },
  component: () => <Outlet />,
});
