import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";
import { Camera, LoaderCircle, UserRound } from "lucide-react";
import { myProfileQuery, myKycQuery, formatUSD } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { notifyByEmail } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/profile")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myProfileQuery),
  component: Profile,
});

function Profile() {
  const { data: profile } = useSuspenseQuery(myProfileQuery);
  const qc = useQueryClient();
  const avatarInput = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [f, setF] = useState({ full_name: "", phone: "", address_line1: "", city: "", state: "", postal_code: "", two_factor_enabled: false });
  useEffect(() => { if (profile) setF({ full_name: profile.full_name ?? "", phone: profile.phone ?? "", address_line1: profile.address_line1 ?? "", city: profile.city ?? "", state: profile.state ?? "", postal_code: profile.postal_code ?? "", two_factor_enabled: profile.two_factor_enabled }); }, [profile]);
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

  const save = useMutation({
    mutationFn: async () => {
      const u = (await supabase.auth.getUser()).data.user;
      if (!u) throw new Error("Your session expired — sign in again");
      const { error } = await supabase.from("profiles").update(f).eq("id", u.id); if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile saved"); qc.invalidateQueries({ queryKey: ["me","profile"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const allowedTypes = ["image/png", "image/jpeg"];
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!allowedTypes.includes(file.type) || !extension || !["png", "jpg", "jpeg"].includes(extension)) {
        throw new Error("Choose a PNG or JPG image");
      }
      if (file.size > 5 * 1024 * 1024) throw new Error("Profile pictures must be 5 MB or smaller");
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Your session expired — sign in again");
      const path = `${user.id}/profile.${extension === "png" ? "png" : "jpg"}`;
      if (profile?.avatar_url && profile.avatar_url !== path) {
        await supabase.storage.from("avatars").remove([profile.avatar_url]);
      }
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
        contentType: file.type,
        upsert: true,
      });
      if (uploadError) throw uploadError;
      const { error: profileError } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      toast.success("Profile picture updated");
      qc.invalidateQueries({ queryKey: ["me", "profile"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed"),
  });

  const changePw = async () => {
    const pw = prompt("New password (min 8 chars):"); if (!pw || pw.length < 8) return;
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) toast.error(error.message); else toast.success("Password updated");
  };

  return (
    <div className="container-page py-6 md:py-10">
      <h1 className="font-display text-3xl md:text-4xl">Profile & settings</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-display text-lg">Personal info</h2>
          <div className="mt-4 grid gap-3">
            <div className="flex items-center gap-4 border-b pb-5">
              <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-muted-foreground">
                {avatarUrl ? <img src={avatarUrl} alt="Profile" className="size-full object-cover" /> : <UserRound className="size-8" aria-hidden />}
                {uploadAvatar.isPending && <div className="absolute inset-0 grid place-items-center bg-background/75"><LoaderCircle className="size-5 animate-spin" aria-hidden /></div>}
              </div>
              <div>
                <Button type="button" variant="outline" onClick={() => avatarInput.current?.click()} disabled={uploadAvatar.isPending}>
                  <Camera className="size-4" aria-hidden />
                  Change picture
                </Button>
                <input
                  ref={avatarInput}
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadAvatar.mutate(file);
                    event.target.value = "";
                  }}
                />
                <p className="mt-1 text-xs text-muted-foreground">PNG or JPG, up to 5 MB</p>
              </div>
            </div>
            <div><Label>Email</Label><Input value={profile?.email ?? ""} readOnly disabled /></div>
            <div><Label>Full name</Label><Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={f.address_line1} onChange={(e) => setF({ ...f, address_line1: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="City" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
              <Input placeholder="State" value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} />
              <Input placeholder="Zip" value={f.postal_code} onChange={(e) => setF({ ...f, postal_code: e.target.value })} />
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending} className="mt-2 w-fit">Save changes</Button>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-display text-lg">Security</h2>
            <div className="mt-4 space-y-4">
              <Button variant="outline" onClick={changePw}>Change password</Button>
              <div className="flex items-center justify-between"><Label>Two-factor authentication</Label><Switch checked={f.two_factor_enabled} onCheckedChange={(v) => { setF({ ...f, two_factor_enabled: v }); }} /></div>
            </div>
          </div>
          <KycCard />
        </div>
      </div>
    </div>
  );
}

const DOC_TYPES = ["passport", "drivers_license", "national_id"] as const;

function KycCard() {
  const { data: profile } = useSuspenseQuery(myProfileQuery);
  const { data: kyc } = useQuery(myKycQuery);
  const qc = useQueryClient();
  const [docType, setDocType] = useState<string>("passport");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const status = kyc?.status ?? profile?.kyc_status ?? "unverified";
  const locked = status === "pending" || status === "approved" || status === "verified";

  const submit = useMutation({
    mutationFn: async () => {
      const u = (await supabase.auth.getUser()).data.user!;
      if (!front || !selfie) throw new Error("Upload the front of your document and a selfie");
      const upload = async (file: File, tag: string) => {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${u.id}/${Date.now()}-${tag}.${ext}`;
        const { error } = await supabase.storage.from("kyc").upload(path, file, { upsert: true });
        if (error) throw error;
        return path;
      };
      const [frontPath, backPath, selfiePath] = await Promise.all([
        upload(front, "front"),
        back ? upload(back, "back") : Promise.resolve(null),
        upload(selfie, "selfie"),
      ]);
      const { error } = await (supabase.rpc as never as (n: string, a: unknown) => Promise<{ error: Error | null }>)("submit_kyc", {
        _doc_type: docType,
        _front: frontPath,
        _back: backPath,
        _selfie: selfiePath,
      });
      if (error) throw error;
      notifyByEmail({
        template: "kyc_submitted",
        subject: "Identity verification received",
        title: "We received your documents",
        intro: "Our compliance team is reviewing your identity verification. We'll email you when it's complete.",
        rows: [
          ["Document type", docType.replace("_", " ")],
          ["Submitted", new Date().toLocaleString()],
          ["Current daily limit", formatUSD(profile?.transaction_limit ?? 5000)],
        ],
        footnote: "Reviews are usually completed within one business day.",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setFront(null); setBack(null); setSelfie(null);
      toast.success("Documents submitted for review");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-lg">Identity verification</h2>
        <span className="rounded-full border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide capitalize">{status}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Your daily transaction limit is <span className="font-medium text-foreground">{formatUSD(profile?.transaction_limit ?? 5000)}</span>. Verifying your identity can raise it.
      </p>

      {status === "rejected" && kyc?.notes && (
        <p className="mt-3 rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">{kyc.notes}</p>
      )}

      {locked ? (
        <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          {status === "pending"
            ? "Your documents are under review by our compliance team."
            : "Your identity is verified. No further action needed."}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <Label>Document type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((d) => <SelectItem key={d} value={d} className="capitalize">{d.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Document front</Label><Input type="file" accept="image/*,.pdf" onChange={(e) => setFront(e.target.files?.[0] ?? null)} /></div>
          <div><Label>Document back (optional)</Label><Input type="file" accept="image/*,.pdf" onChange={(e) => setBack(e.target.files?.[0] ?? null)} /></div>
          <div><Label>Selfie holding your document</Label><Input type="file" accept="image/*" onChange={(e) => setSelfie(e.target.files?.[0] ?? null)} /></div>
          <Button onClick={() => submit.mutate()} disabled={submit.isPending || !front || !selfie}>
            {submit.isPending ? "Uploading…" : "Submit for verification"}
          </Button>
        </div>
      )}
    </div>
  );
}

