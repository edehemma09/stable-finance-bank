import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileImage } from "lucide-react";

/** Renders a private-bucket document via a short-lived signed URL (admin read policies apply). */
export function SignedDoc({
  bucket,
  path,
  label,
}: {
  bucket: "kyc" | "deposits";
  path: string | null;
  label: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!path) {
      setUrl(null);
      return;
    }
    supabase.storage
      .from(bucket)
      .createSignedUrl(path, 300)
      .then(({ data }) => {
        if (alive) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      alive = false;
    };
  }, [bucket, path]);

  return (
    <div className="min-w-0">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-lg border"
        >
          <img src={url} alt={label} className="h-28 w-full object-cover" />
        </a>
      ) : (
        <div className="grid h-28 place-items-center rounded-lg border bg-muted/40 text-muted-foreground">
          <FileImage className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
