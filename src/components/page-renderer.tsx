import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Wallet, Sparkles, Car, CreditCard, Home, GraduationCap, Award, PiggyBank, Landmark, Briefcase, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tile = { label: string; icon?: string; to?: string };
type Block =
  | { type: "features"; title?: string; items: { title: string; body: string }[] }
  | { type: "stats"; items: { k: string; v: string }[] }
  | { type: "cta"; title: string; body?: string; button?: string; to?: string }
  | { type: "rich"; body: string }
  | { type: "tiles"; title?: string; items: Tile[] }
  | { type: "promos"; title?: string; items: { title: string; body?: string; cta?: string; to?: string }[] }
  | { type: "billboard"; kicker?: string; title: string; body?: string; cta?: string; to?: string };

const ICONS: Record<string, typeof Wallet> = {
  car: Car, card: CreditCard, home: Home, grad: GraduationCap, award: Award,
  piggy: PiggyBank, bank: Landmark, briefcase: Briefcase, shield: ShieldCheck,
  wallet: Wallet, heart: HeartHandshake, sparkle: Sparkles,
};

export function PageRenderer({ page }: { page: { title: string; hero_title: string | null; hero_subtitle: string | null; hero_image?: string | null; blocks: unknown } }) {
  const blocks = (Array.isArray(page.blocks) ? page.blocks : []) as Block[];
  const heroImage = (page as { hero_image?: string | null }).hero_image;
  return (
    <>
      {/* Hero — full-bleed image with navy overlay */}
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            loading="eager"
            className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
          />
        )}
        <div className={`absolute inset-0 -z-10 ${heroImage ? "bg-primary/85" : "bg-primary"}`} />
        {heroImage && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/85 to-primary/55" />
        )}
        <div className="container-page py-16 md:py-28">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl leading-[1.05] md:text-5xl lg:text-6xl">{page.hero_title ?? page.title}</h1>
            {page.hero_subtitle && <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">{page.hero_subtitle}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/auth" search={{ mode: "signup" } as never}>Enroll now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/contact">Talk to a banker</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {blocks.map((b, i) => <BlockView key={i} block={b} />)}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.type === "tiles") {
    return (
      <section className="bg-surface">
        <div className="container-page py-14">
          {block.title && (
            <h2 className="mb-8 flex items-center gap-3 font-display text-2xl md:text-3xl">
              <span className="h-6 w-1 rounded-sm bg-accent" />{block.title}
            </h2>
          )}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {block.items.map((it, i) => {
              const Icon = ICONS[it.icon ?? "wallet"] ?? Wallet;
              const inner = (
                <>
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-blue/10 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-brand-blue">{it.label}</p>
                </>
              );
              return it.to ? (
                <Link key={i} to={it.to} className="group flex flex-col items-center rounded-xl border border-border/70 bg-card p-5 text-center transition-all hover:border-brand-blue hover:shadow-md">
                  {inner}
                </Link>
              ) : (
                <div key={i} className="group flex flex-col items-center rounded-xl border border-border/70 bg-card p-5 text-center">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
  if (block.type === "features") {
    const iconList = [Sparkles, Wallet, ShieldCheck, PiggyBank, Landmark, Award];
    return (
      <section className="border-b bg-background">
        <div className="container-page py-16">
          {block.title && <h2 className="mb-10 font-display text-3xl md:text-4xl"><span className="mr-3 inline-block h-7 w-1 translate-y-1 rounded-sm bg-accent" />{block.title}</h2>}
          <div className="grid gap-6 md:grid-cols-3">
            {block.items.map((it, i) => {
              const Icon = iconList[i % iconList.length];
              return (
                <div key={i} className="rounded-xl border border-border/70 bg-card p-6 transition-shadow hover:shadow-md">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-blue/10 text-brand-blue"><Icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 font-display text-xl">{it.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
  if (block.type === "promos") {
    return (
      <section className="bg-background">
        <div className="container-page py-14">
          {block.title && <h2 className="mb-8 font-display text-2xl md:text-3xl"><span className="mr-3 inline-block h-6 w-1 translate-y-1 rounded-sm bg-accent" />{block.title}</h2>}
          <div className="grid gap-6 md:grid-cols-3">
            {block.items.map((it, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
                {it.image ? (
                  <img
                    src={it.image}
                    alt={it.title}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-brand-blue/15 via-primary/10 to-accent/20" />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-lg">{it.title}</h3>
                  {it.body && <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>}
                  <Link to={it.to ?? "/auth"} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline">
                    {it.cta ?? "Learn more"} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (block.type === "billboard") {
    return (
      <section className="bg-primary text-primary-foreground">
        <div className="container-page grid gap-8 py-14 md:grid-cols-[1.3fr_1fr] md:items-center md:py-20">
          <div>
            {block.kicker && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">{block.kicker}</p>}
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl">{block.title}</h2>
            {block.body && <p className="mt-4 max-w-xl text-primary-foreground/80">{block.body}</p>}
            <Button asChild size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to={block.to ?? "/auth"}>{block.cta ?? "Explore"} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="hidden md:block">
            <div className="ml-auto h-56 w-full max-w-md rounded-2xl bg-primary-dark ring-1 ring-primary-foreground/15" />
          </div>
        </div>
      </section>
    );
  }
  if (block.type === "stats") {
    return (
      <section className="border-y bg-surface">
        <div className="container-page grid gap-8 py-12 md:grid-cols-3">
          {block.items.map((it, i) => (
            <div key={i}>
              <p className="font-display text-4xl text-primary">{it.k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{it.v}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (block.type === "cta") {
    return (
      <section className="bg-surface">
        <div className="container-page py-16 text-center">
          <h2 className="font-display text-3xl md:text-4xl">{block.title}</h2>
          {block.body && <p className="mx-auto mt-3 max-w-lg text-muted-foreground">{block.body}</p>}
          <Button asChild size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to={block.to ?? "/auth"}>{block.button ?? "Get started"}</Link>
          </Button>
        </div>
      </section>
    );
  }
  if (block.type === "rich") {
    return (
      <section className="border-b">
        <div className="container-page prose prose-neutral max-w-3xl py-16 text-lg leading-relaxed text-foreground">
          <p>{block.body}</p>
        </div>
      </section>
    );
  }
  return null;
}
