import React from 'react';
import { Image } from '@/components/ui/image';

function Block({ title, body }) {
  if (!body) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{title}</h3>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

export default function StoreStory({ brand }) {
  const story = brand.story || brand.description;
  const hasFounder = brand.founder_message || brand.founder_photo_url;
  const hasPolicies = brand.shipping_policy || brand.return_policy;
  if (!story && !hasFounder && !hasPolicies) return null;

  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-16">
        {story && (
          <div className="max-w-2xl">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              The brand
            </h2>
            <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed">{story}</p>
          </div>
        )}

        {hasFounder && (
          <div className="mt-14 flex flex-col gap-6 sm:flex-row sm:items-center">
            {brand.founder_photo_url && (
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted">
                <Image
                  src={brand.founder_photo_url}
                  alt=""
                  fittingType="fill"
                  className="h-full w-full"
                />
              </div>
            )}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                From the founder
              </h3>
              {brand.founder_message && (
                <p className="mt-3 max-w-xl whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {brand.founder_message}
                </p>
              )}
            </div>
          </div>
        )}

        {hasPolicies && (
          <div className="mt-14 grid gap-10 border-t border-border pt-10 sm:grid-cols-2">
            <Block title="Shipping" body={brand.shipping_policy} />
            <Block title="Returns" body={brand.return_policy} />
          </div>
        )}
      </div>
    </section>
  );
}