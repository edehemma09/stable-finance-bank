import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { myAccountsQuery, siteSettingsQuery, formatUSD } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/deposits")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(myAccountsQuery);
    context.queryClient.ensureQueryData(siteSettingsQuery);
  },
  component: Deposits,
});

function Deposits() {
  const { data: accounts } = useSuspenseQuery(myAccountsQuery);
  const { data: settings } = useSuspenseQuery(siteSettingsQuery);
  const primary = accounts[0];
  return (
    <div className="container-page py-6 md:py-10">
      <h1 className="font-display text-3xl md:text-4xl">Deposits</h1>
      <Tabs defaultValue="direct" className="mt-6">
        <TabsList>
          <TabsTrigger value="direct">Direct deposit</TabsTrigger>
          <TabsTrigger value="cheque">Deposit a cheque</TabsTrigger>
        </TabsList>
        <TabsContent value="direct">
          <div className="mt-4 rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Share these details with your employer or payer:
            </p>
            {primary ? (
              <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Account holder</dt>
                  <dd className="font-medium">You</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Account number</dt>
                  <dd className="font-mono">{primary.account_number}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Routing number</dt>
                  <dd className="font-mono">{settings?.routing_number}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Account type</dt>
                  <dd className="capitalize">{primary.type}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Bank name</dt>
                  <dd>{settings?.brand_name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Bank address</dt>
                  <dd>{settings?.address}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Open an account first.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="cheque">
          <ChequeForm accounts={accounts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChequeForm({
  accounts,
}: {
  accounts: {
    id: string;
    nickname: string | null;
    type: string;
    account_number: string;
    balance: number | string;
  }[];
}) {
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: async () => {
      const u = (await supabase.auth.getUser()).data.user!;
      const upload = async (f: File | null, label: string) => {
        if (!f) return null;
        const key = `${u.id}/${crypto.randomUUID()}-${label}-${f.name}`;
        const { error } = await supabase.storage.from("deposits").upload(key, f);
        if (error) throw error;
        return key;
      };
      const [frontKey, backKey] = await Promise.all([upload(front, "front"), upload(back, "back")]);
      const { error } = await supabase.from("cheque_deposits").insert({
        user_id: u.id,
        account_id: account,
        amount: Number(amount),
        front_url: frontKey,
        back_url: backKey,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Cheque submitted for review");
      setAmount("");
      setFront(null);
      setBack(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  return (
    <form
      className="mt-4 space-y-4 rounded-xl border bg-card p-6"
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate();
      }}
    >
      <div>
        <Label>Deposit into</Label>
        <Select value={account} onValueChange={setAccount}>
          <SelectTrigger>
            <SelectValue placeholder="Choose account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.nickname ?? a.type} ••{a.account_number.slice(-4)} — {formatUSD(a.balance)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Amount</Label>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Cheque front</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFront(e.target.files?.[0] ?? null)}
            required
          />
        </div>
        <div>
          <Label>Cheque back</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setBack(e.target.files?.[0] ?? null)}
            required
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Deposits are reviewed by our team within 1 business day.
      </p>
      <Button
        type="submit"
        disabled={m.isPending || !account || !amount || !front || !back}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {m.isPending ? "Uploading…" : "Submit cheque"}
      </Button>
    </form>
  );
}
