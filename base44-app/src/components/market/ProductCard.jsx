import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { useCart } from '@/lib/CartContext';
import { money } from '@/lib/shop';
import { productHasColors } from '@/lib/colorways';
import { toast } from '@/components/ui/use-toast';

export default function ProductCard({ product, source = 'marketplace' }) {
  const { add } = useCart();
  const sizes = product.sizes?.filter(Boolean) || [];
  const hasColors = productHasColors(product);

  const addToBag = (size) => {
    add(product, { size, image: product.images?.[0] || '', quantity: 1, source });
    toast({
      title: 'Added to your bag',
      description: `${product.title}${size ? ` · Size ${size}` : ''}`,
    });
  };

  return (
    <div className="group flex flex-col">
      <Link
        to={`/product/${product.id}?src=${source}`}
        className="overflow-hidden rounded-2xl border border-border bg-muted"
      >
        <Image
          src={product.images?.[0]}
          alt={product.title}
          fittingType="fill"
          className="h-72 w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="mt-4 flex-1">
        <Link
          to={`/brand/${product.brand_id}`}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {product.brand_name || 'Brand'}
        </Link>
        <h3 className="mt-2 font-heading text-base leading-snug">
          <Link to={`/product/${product.id}?src=${source}`}>{product.title}</Link>
        </h3>
        <p className="mt-1 text-sm">{money(product.price)}</p>
      </div>

      {hasColors ? (
        <Link
          to={`/product/${product.id}?src=${source}`}
          className="mt-3 self-start rounded-full border border-border px-4 py-1.5 text-xs transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
        >
          Choose options
        </Link>
      ) : sizes.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => addToBag(size)}
              className="rounded-full border border-border px-2.5 py-1 text-xs transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
            >
              {size}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => addToBag('')}
          className="mt-3 self-start rounded-full border border-border px-4 py-1.5 text-xs transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
        >
          Add to bag
        </button>
      )}
    </div>
  );
}