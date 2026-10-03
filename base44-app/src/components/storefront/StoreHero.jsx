import React from 'react';
import { Image } from '@/components/ui/image';
import { socialUrl } from '@/lib/branding';

function socialLinks(brand) {
  return [
    { label: 'Website', href: socialUrl('website', brand.website) },
    { label: 'Instagram', href: socialUrl('instagram', brand.instagram) },
    { label: 'TikTok', href: socialUrl('tiktok', brand.tiktok) },
  ].filter((link) => link.href);
}

function SocialRow({ brand, className = '' }) {
  const links = socialLinks(brand);
  if (!links.length) return null;

  return (
    <div className={`flex flex-wrap gap-5 text-sm ${className}`}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 transition-opacity hover:opacity-60 hover:underline"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

function LogoMark({ brand, className = 'h-16 w-16' }) {
  if (!brand.logo_url) return null;

  return (
    <span
      className={`block ${className} overflow-hidden rounded-full border border-border bg-card`}
    >
      <Image
        src={brand.logo_url}
        alt={`${brand.name} logo`}
        fittingType="fill"
        className="h-full w-full"
      />
    </span>
  );
}

function Category({ brand, className = '' }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.3em] text-accent ${className}`}>
      {brand.category || 'Emerging brand'}
    </p>
  );
}

function FullBanner({ brand }) {
  return (
    <section className="relative">
      <div className="h-[46vh] min-h-[320px] w-full bg-muted">
        <Image src={brand.banner_url} alt="" fittingType="fill" className="h-full w-full" />
      </div>
      <div className="absolute inset-0 flex items-center bg-foreground/40">
        <div className="mx-auto w-full max-w-6xl px-5 text-background">
          <LogoMark brand={brand} />
          <Category brand={brand} className="mt-6 opacity-80" />
          <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">{brand.name}</h1>
          {brand.tagline && <p className="mt-4 max-w-xl text-lg opacity-90">{brand.tagline}</p>}
          <SocialRow brand={brand} className="mt-6" />
        </div>
      </div>
    </section>
  );
}

function SplitBanner({ brand }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:items-center">
      <div>
        <LogoMark brand={brand} />
        <Category brand={brand} className="mt-6" />
        <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">{brand.name}</h1>
        {brand.tagline && (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{brand.tagline}</p>
        )}
        <SocialRow brand={brand} className="mt-6 text-muted-foreground" />
      </div>
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        <Image src={brand.banner_url} alt="" fittingType="fill" className="h-full w-full" />
      </div>
    </section>
  );
}

function MinimalBanner({ brand }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 text-center">
      <LogoMark brand={brand} className="mx-auto h-20 w-20" />
      <Category brand={brand} className="mt-6" />
      <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">{brand.name}</h1>
      {brand.tagline && (
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {brand.tagline}
        </p>
      )}
      <SocialRow brand={brand} className="mt-6 justify-center text-muted-foreground" />
    </section>
  );
}

export default function StoreHero({ brand, bannerStyle }) {
  // Without a banner image the image-led styles have nothing to show, so fall
  // back to the type-only layout rather than a grey rectangle.
  const style = brand.banner_url ? bannerStyle : 'minimal';

  if (style === 'full') return <FullBanner brand={brand} />;
  if (style === 'split') return <SplitBanner brand={brand} />;
  return <MinimalBanner brand={brand} />;
}