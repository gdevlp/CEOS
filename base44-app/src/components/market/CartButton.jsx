import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import CartDrawer from '@/components/market/CartDrawer';

export default function CartButton() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <ShoppingBag className="h-4 w-4" />
        <span className="hidden sm:inline">Bag</span>
        {count > 0 && (
          <span className="rounded-full bg-foreground px-1.5 text-[10px] leading-4 text-background">
            {count}
          </span>
        )}
      </Button>
      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}