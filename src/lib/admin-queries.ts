import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const adminCustomersQuery = (search: string) =>
  queryOptions({
    queryKey: ["admin", "customers", search],
    queryFn: async () => {
      let q = supabase
        .from("profiles")
        .select("id,email,username,full_name,status,kyc_status,transaction_limit,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`email.ilike.${s},username.ilike.${s},full_name.ilike.${s}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const adminCustomerQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "customer", id],
    queryFn: async () => {
      const [profile, accounts, tx, roles] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.from("accounts").select("*").eq("user_id", id).order("created_at"),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(25),
        supabase.from("user_roles").select("role").eq("user_id", id),
      ]);
      if (profile.error) throw profile.error;
      return {
        profile: profile.data,
        accounts: accounts.data ?? [],
        transactions: tx.data ?? [],
        roles: (roles.data ?? []).map((r) => r.role as string),
      };
    },
  });

export const statusTone = (status: string | null | undefined) =>
  ({
    active: "bg-success/10 text-success border-success/30",
    suspended: "bg-warning/15 text-warning-foreground border-warning/40",
    banned: "bg-destructive/10 text-destructive border-destructive/30",
    closed: "bg-muted text-muted-foreground border-border",
  })[status ?? "active"] ?? "bg-muted text-muted-foreground border-border";

export const adminTransfersQuery = queryOptions({
  queryKey: ["admin", "transfers"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("transfers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  },
});

export const adminKycQuery = queryOptions({
  queryKey: ["admin", "kyc"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("kyc_submissions")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data ?? [];
  },
});

export const adminLoansQuery = queryOptions({
  queryKey: ["admin", "loans"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(150);
    if (error) throw error;
    return data ?? [];
  },
});

export const adminChequesQuery = queryOptions({
  queryKey: ["admin", "cheques"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("cheque_deposits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data ?? [];
  },
});

export const adminProfileLookupQuery = queryOptions({
  queryKey: ["admin", "profile-lookup"],
  queryFn: async () => {
    const { data } = await supabase.from("profiles").select("id,email,full_name,username");
    const map = new Map<
      string,
      { email: string; full_name: string | null; username: string | null }
    >();
    (data ?? []).forEach((p) =>
      map.set(p.id, { email: p.email, full_name: p.full_name, username: p.username }),
    );
    return map;
  },
});

export const adminTicketQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "ticket", id],
    queryFn: async () => {
      const [t, m] = await Promise.all([
        supabase.from("support_tickets").select("*").eq("id", id).maybeSingle(),
        supabase.from("ticket_messages").select("*").eq("ticket_id", id).order("created_at"),
      ]);
      return { ticket: t.data, messages: m.data ?? [] };
    },
  });

export const adminEmailLogQuery = queryOptions({
  queryKey: ["admin", "email_log"],
  queryFn: async () => {
    const { data } = await supabase
      .from("email_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    return data ?? [];
  },
});

export const smtpSettingsQuery = queryOptions({
  queryKey: ["admin", "smtp"],
  queryFn: async () =>
    (await supabase.from("smtp_settings").select("*").eq("id", 1).maybeSingle()).data,
});

export const adminDeletedUsersQuery = queryOptions({
  queryKey: ["admin", "deleted_users"],
  queryFn: async () => {
    const { data, error } = await (supabase.from("deleted_users" as never) as any)
      .select("*")
      .order("deleted_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []) as {
      id: string;
      user_id: string;
      email: string | null;
      full_name: string | null;
      username: string | null;
      snapshot: unknown;
      deleted_at: string;
    }[];
  },
});
