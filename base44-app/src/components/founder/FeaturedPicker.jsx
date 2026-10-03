import React from 'react';
import { Image } from '@/components/ui/image';
import { MAX_FEATURED } from '@/lib/storefront';
import { Star } from 'lucide-react';

export default function FeaturedPicker({ products, value = [], onChange }) {
  const toggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id));
      return;
    }
    if (value.length >= MAX_FEATURED) return;
    onChange([...value, id]);
  };

  if (!products.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Publish a product first, then you can spotlight it here.
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {value.length} of {MAX_FEATURED} chosen · shown in this order at the top of your store.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {products.map((product) => {
          const index = value.indexOf(product.id);
          const active = index > -1;
          const full = !active && value.length >= MAX_FEATURED;

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => toggle(product.id)}
              disabled={full}
              aria-pressed={active}
              className={`overflow-hidden rounded-xl border text-left transition-colors disabled:opacity-40 ${
                active ? 'border-foreground' : 'border-border hover:border-foreground/40'
              }`}
            >
              <span className="relative block aspect-square bg-muted">
                {product.images?.[0] && (
                  <Image
                    src={product.images[0]}
                    alt=""
                    fittingType="fill"
                    className="h-full w-full"
                  />
                )}
                {active && (
                  <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs text-background">
                    {index + 1}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-2.5">
                {active && <Star className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate text-xs">{product.title}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}