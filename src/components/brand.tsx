import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery } from "@/lib/queries";

export function BrandMark({ className = "" }: { className?: string }) {
  const { data } = useQuery(siteSettingsQuery);
  const name = data?.brand_name ?? "Meridian Bank";
  return (
    <a href="/" className={`inline-flex items-center gap-2 ${className}`}>
      {data?.logo_url ? (
        <img src={data.logo_url} alt={name} className="h-7 w-7 rounded-md object-cover" />
      ) : (
        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
          <span className="font-display text-lg leading-none">M</span>
        </span>
      )}
      <span className="font-display text-xl leading-none tracking-tight">{name}</span>
    </a>
  );
}
