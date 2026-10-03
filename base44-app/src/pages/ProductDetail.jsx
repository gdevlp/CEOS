import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SiteHeader from '@/components/SiteHeader';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { useCart } from '@/lib/CartContext';
import { money, shippingFor, FREE_SHIPPING_OVER } from '@/lib/shop';
import {
  colorwayImages,
  colorwayInStock,
  productColorways,
  productHasColors,
  sizeInStock,
} from '@/lib/colorways';
import { trackProductView } from '@/lib/analytics';
import { applyProductMeta } from '@/lib/share';
import { toast } from '@/components/ui/use-toast';
import { Minus, Plus } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [missing, setMissing] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let isActive = true;
    const previousTitle = document.title;

    (async () => {
      try {
        const record = await base44.entities.Product.get(id);
        if (!isActive) return;
        const first = productColorways(record)[0];
        setProduct(record);
        setColorIndex(0);
        setSize((first?.sizes || []).find(sizeInStock)?.label || '');

        const src = new URLSearchParams(window.location.search).get('src');
        trackProductView(record, src);

        applyProductMeta({
          title: `${record.title} — ${record.brand_name || 'CEO/$'}`,
          description:
            record.description?.trim() ||
            `${record.title} by ${record.brand_name || 'an emerging label'} — ${money(
              record.price
            )} on CEO/$.`,
          image: colorwayImages(record, first)[0],
          url: `${window.location.origin}/product/${record.id}`,
        });
      } catch {
        if (isActive) setMissing(true);
      }
    })();

    return () => {
      isActive = false;
      document.title = previousTitle;
    };
  }, [id]);

  if (missing) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="font-display text-3xl">This piece is not available</h1>
          <p className="mt-3 text-muted-foreground">
            It may have been removed, or the link is out of date.
          </p>
          <Button asChild className="mt-8">
            <Link to="/market">Back to the marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      </div>
    );
  }

  const colorways = productColorways(product);
  const showColors = productHasColors(product);
  const colorway = colorways[colorIndex] || colorways[0];
  const images = colorwayImages(product, colorway);
  const sizes = colorway?.sizes || [];
  const shipping = shippingFor(product.price || 0);
  const inStock = colorwayInStock(colorway);
  const buyable = inStock && (!sizes.length || Boolean(size));

  const chooseColor = (index) => {
    setColorIndex(index);
    setActive(0);
    const next = colorways[index];
    setSize((next?.sizes || []).find(sizeInStock)?.label || '');
  };

  const addToBag = () => {
    const src = new URLSearchParams(window.location.search).get('src');
    add(product, {
      size,
      color: colorway?.name || '',
      image: images[0] || '',
      quantity,
      source: src,
    });
    toast({
      title: 'Added to your bag',
      description: [product.title, colorway?.name, size ? `Size ${size}` : '']
        .filter(Boolean)
        .join(' · '),
    });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-14">
        <Link
          to={`/brand/${product.brand_id}`}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {product.brand_name || 'Brand'}
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-2xl border border-border bg-muted">
              <Image
                src={images[active]}
                alt={product.title}
                fittingType="fill"
                className="h-[520px] w-full"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.map((url, index) => (
                  <button
                    key={`${url}-${index}`}
                    type="button"
                    onClick={() => setActive(index)}
                    className={`overflow-hidden rounded-lg border bg-muted transition-colors ${
                      index === active ? 'border-foreground' : 'border-border'
                    }`}
                  >
                    <Image src={url} alt="" fittingType="fill" className="h-24 w-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-4xl leading-tight">{product.title}</h1>
            <p className="mt-4 text-lg">{money(product.price)}</p>
            {product.category && (
              <p className="mt-2 text-sm text-muted-foreground">{product.category}</p>
            )}

            {showColors && (
              <div className="mt-9">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Colour
                  {colorway?.name && (
                    <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">
                      {colorway.name}
                    </span>
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {colorways.map((option, index) => {
                    const available = colorwayInStock(option);
                    const selected = index === colorIndex;

                    return (
                      <button
                        key={`${option.name}-${index}`}
                        type="button"
                        onClick={() => chooseColor(index)}
                        disabled={!available}
                        title={available ? option.name : `${option.name} — sold out`}
                        className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm transition-colors ${
                          selected ? 'border-foreground' : 'border-border hover:border-foreground'
                        } ${available ? '' : 'cursor-not-allowed opacity-40 hover:border-border'}`}
                      >
                        {option.swatch ? (
                          <span
                            className="h-6 w-6 rounded-full border border-border"
                            style={{ backgroundColor: option.swatch }}
                          />
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium uppercase">
                            {option.name.slice(0, 1)}
                          </span>
                        )}
                        <span>{option.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Size</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizes.map((option) => {
                    const available = sizeInStock(option);

                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setSize(option.label)}
                        disabled={!available}
                        className={`min-w-12 rounded-full border px-4 py-2 text-sm transition-colors ${
                          option.label === size
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:border-foreground'
                        } ${
                          available
                            ? ''
                            : 'cursor-not-allowed text-muted-foreground line-through opacity-50 hover:border-border'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {!inStock && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {colorway?.name ? `This colour is sold out.` : 'This piece is sold out.'}
                  </p>
                )}
              </div>
            )}

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Quantity</p>
              <div className="mt-3 flex w-fit items-center rounded-full border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Decrease quantity"
                  className="px-3.5 py-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                  aria-label="Increase quantity"
                  className="px-3.5 py-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <Button
              size="lg"
              className="mt-9 h-12 w-full"
              onClick={addToBag}
              disabled={!buyable}
            >
              {inStock ? 'Add to bag' : 'Sold out'}
            </Button>

            <p className="mt-4 text-sm text-muted-foreground">
              {shipping === 0
                ? 'Free shipping from this brand.'
                : `${money(shipping)} shipping from this brand — free over ${money(
                    FREE_SHIPPING_OVER
                  )}.`}
            </p>

            {product.description && (
              <div className="mt-10 border-t border-border pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Details</p>
                <p className="mt-4 whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}