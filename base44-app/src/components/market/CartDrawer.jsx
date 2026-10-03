import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { useCart } from '@/lib/CartContext';
import { cartTotals, money } from '@/lib/shop';
import { variantLabel } from '@/lib/colorways';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartDrawer({ open, onOpenChange }) {
  const { items, setQuantity, remove } = useCart();
  const [brands, setBrands] = useState(null);

  // Delivery is priced by each brand, so the bag needs their current rates.
  useEffect(() => {
    let active = true;
    (async () => {
      const list = await base44.entities.Brand.list('-created_date', 500);
      if (active) setBrands(new Map(list.map((record) => [record.id, record])));
    })();
    return () => {
      active = false;
    };
  }, []);

  const { groups, subtotal, shipping, total } = cartTotals(items, brands);
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="font-display text-2xl font-normal">Your bag</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-muted-foreground">Your bag is empty.</p>
            <Button asChild variant="outline" onClick={close}>
              <Link to="/market">Shop the marketplace</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {groups.map((group) => (
                <div key={group.brand_id} className="mb-8 last:mb-0">
                  <div className="flex items-baseline justify-between">
                    <Link
                      to={`/brand/${group.brand_id}`}
                      onClick={close}
                      className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:text-accent"
                    >
                      {group.brand_name}
                    </Link>
                    <span className="text-xs text-muted-foreground">{money(group.subtotal)}</span>
                  </div>

                  <div className="mt-4 space-y-4">
                    {group.items.map((item) => (
                      <div key={item.key} className="flex gap-4">
                        <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fittingType="fill"
                            className="h-full w-full"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between gap-2">
                            <p className="text-sm leading-snug">{item.title}</p>
                            <button
                              type="button"
                              onClick={() => remove(item.key)}
                              aria-label={`Remove ${item.title}`}
                              className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {variantLabel(item) && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {variantLabel(item)}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center rounded-full border border-border">
                              <button
                                type="button"
                                onClick={() => setQuantity(item.key, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="px-2.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => setQuantity(item.key, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="px-2.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm">{money(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-6 py-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="mt-1.5 flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : money(shipping)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-border pt-3 font-medium">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
              <Button asChild size="lg" className="mt-5 h-12 w-full" onClick={close}>
                <Link to="/checkout">Checkout</Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Each brand ships its own order.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}