import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const siteSettingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const pageBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const navPagesQuery = queryOptions({
  queryKey: ["pages", "nav"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("pages")
      .select("slug,nav_label,nav_order")
      .eq("in_nav", true)
      .eq("published", true)
      .order("nav_order");
    if (error) throw error;
    return data ?? [];
  },
});

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: async () => (await supabase.auth.getUser()).data.user,
  staleTime: 30_000,
});

export const myProfileQuery = queryOptions({
  queryKey: ["me", "profile"],
  queryFn: async () => {
    const u = (await supabase.auth.getUser()).data.user;
    if (!u) return null;
    const { data } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
    return data;
  },
});

export const myRolesQuery = queryOptions({
  queryKey: ["me", "roles"],
  queryFn: async () => {
    const u = (await supabase.auth.getUser()).data.user;
    if (!u) return [] as string[];
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
    return (data ?? []).map((r) => r.role as string);
  },
});

export const myAccountsQuery = queryOptions({
  queryKey: ["me", "accounts"],
  queryFn: async () => {
    const { data, error } = await supabase.from("accounts").select("*").order("created_at");
    if (error) throw error;
    return data ?? [];
  },
});

export const myTransactionsQuery = (limit = 50) =>
  queryOptions({
    queryKey: ["me", "tx", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });

export const myCardsQuery = queryOptions({
  queryKey: ["me", "cards"],
  queryFn: async () => {
    const { data, error } = await supabase.from("cards").select("*").order("created_at");
    if (error) throw error;
    return data ?? [];
  },
});

export const myPayeesQuery = queryOptions({
  queryKey: ["me", "payees"],
  queryFn: async () => {
    const { data } = await supabase.from("payees").select("*").order("name");
    return data ?? [];
  },
});

export const myAlertsQuery = queryOptions({
  queryKey: ["me", "alerts"],
  queryFn: async () => {
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    return data ?? [];
  },
});

export const myTicketsQuery = queryOptions({
  queryKey: ["me", "tickets"],
  queryFn: async () => {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .order("updated_at", { ascending: false });
    return data ?? [];
  },
});

export const formatUSD = (n: number | string | null | undefined) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n ?? 0));

export const myLoansQuery = queryOptions({
  queryKey: ["me", "loans"],
  queryFn: async () => {
    const { data, error } = await supabase.from("loans").select("*").order("created_at");
    if (error) throw error;
    return data ?? [];
  },
});

export const myHoldingsQuery = queryOptions({
  queryKey: ["me", "holdings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("holdings").select("*").order("symbol");
    if (error) throw error;
    return data ?? [];
  },
});

export const myKycQuery = queryOptions({
  queryKey: ["me", "kyc"],
  queryFn: async () => {
    const { data } = await supabase
      .from("kyc_submissions")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(1);
    return data?.[0] ?? null;
  },
});

export const myChequesQuery = queryOptions({
  queryKey: ["me", "cheques"],
  queryFn: async () => {
    const { data } = await supabase
      .from("cheque_deposits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    return data ?? [];
  },
});
