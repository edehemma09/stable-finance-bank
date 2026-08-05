import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery } from "@/lib/queries";

export function BrandMark({ className = "" }: { className?: string }) {
  const { data } = useQuery(siteSettingsQuery);
  const name = data?.brand_name ?? "Stable Finance Bank";
  return (
    <a href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={data?.logo_url ?? "/mark.png"}
        alt={name}
        className="h-8 w-8 rounded-md object-contain"
      />
      <span className="font-display text-xl leading-none tracking-tight">{name}</span>
    </a>
  );
}
