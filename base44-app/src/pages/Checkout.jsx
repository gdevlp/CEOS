import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteHeader from '@/components/SiteHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Image } from '@/components/ui/image';
import { useCart } from '@/lib/CartContext';
import { cartTotals, allocateProcessing, money } from '@/lib/shop';
import { lineLabel } from '@/lib/colorways';
import { planFor, planByKey, DEFAULT_PLAN, feeOn } from '@/lib/plans';
import { toast } from '@/components/ui/use-toast';

const EMPTY_FORM = {
  name: '',
  email: '',
  address: '',
  city: '',
  postal: '',
  country: '',
  note: '',
};

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, clear } = useCart();
  const [form, setForm] = useState(EMPTY_FORM);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
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

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.full_name || '',
      email: prev.email || user.email || '',
    }));
  }, [user]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const placeOrder = async (event) => {
    event.preventDefault();
    setPlacing(true);
    setError('');
    try {
      const checkoutGroupId = `chk_${Date.now()}`;
      const brandRecords = await base44.entities.Brand.list('-created_date', 500);
      const brandById = new Map(brandRecords.map((record) => [record.id, record]));
      const planByBrandId = new Map(brandRecords.map((record) => [record.id, planFor(record)]));

      // Priced against the brands as they are right now, so each sub-order is
      // written with the same plan, delivery charge and processing the shopper
      // was shown.
      const priced = cartTotals(items, brandById);
      const { byBrand: processingByBrand } = allocateProcessing(priced.groups, priced.total);

      const orders = priced.groups.map((group) => {
        const plan = planByBrandId.get(group.brand_id) || planByKey(DEFAULT_PLAN);
        const { fee } = feeOn(plan, group.subtotal);
        return {
        checkout_group_id: checkoutGroupId,
        brand_id: group.brand_id,
        brand_name: group.brand_name,
        brand_owner_id: group.brand_owner_id,
        buyer_name: form.name.trim(),
        buyer_email: form.email.trim(),
        items: group.items.map((item) => ({
          product_id: item.product_id,
          title: item.title,
          color: item.color,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: group.subtotal,
        shipping_cost: group.shipping,
        total: group.total,
        shipping_address: [form.address, form.city, form.postal, form.country]
          .map((part) => part.trim())
          .filter(Boolean)
          .join(', '),
        note: form.note.trim(),
        status: 'placed',
        payment_status: 'unpaid',
        placed_at: new Date().toISOString(),
        source: group.source,
        fee_rate: plan.fee,
        fee_amount: fee,
        processing_fee: processingByBrand.get(group.brand_id) || 0,
        };
      });

      await base44.entities.Order.bulkCreate(orders);
      clear();
      toast({
        title: 'Order placed',
        description: `${groups.length} brand${groups.length > 1 ? 's' : ''} will ship separately.`,
      });
      navigate('/orders');
    } catch (err) {
      setError(err.message || 'We could not place your order. Please try again.');
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="font-display text-3xl">Your bag is empty</h1>
          <p className="mt-3 text-muted-foreground">Add a few pieces before checking out.</p>
          <Button asChild className="mt-8">
            <Link to="/market">Shop the marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="font-display text-4xl">Checkout</h1>
        <p className="mt-3 text-muted-foreground">
          One payment, {groups.length} shipment{groups.length > 1 ? 's' : ''} — each brand fulfils
          its own order.
        </p>

        <form onSubmit={placeOrder} className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => set('name', event.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => set('email', event.target.value)}
                  required
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(event) => set('address', event.target.value)}
                required
                className="mt-2"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(event) => set('city', event.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="postal">Postal code</Label>
                <Input
                  id="postal"
                  value={form.postal}
                  onChange={(event) => set('postal', event.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(event) => set('country', event.target.value)}
                  required
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="note">Order note (optional)</Label>
              <Textarea
                id="note"
                rows={3}
                value={form.note}
                onChange={(event) => set('note', event.target.value)}
                className="mt-2"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.2em]">
                Your order
              </h2>

              <div className="mt-6 space-y-6">
                {groups.map((group) => (
                  <div key={group.brand_id}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                        {group.brand_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {money(group.subtotal)}
                      </span>
                    </div>
                    <div className="mt-3 space-y-3">
                      {group.items.map((item) => (
                        <div key={item.key} className="flex gap-3">
                          <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fittingType="fill"
                              className="h-full w-full"
                            />
                          </div>
                          <div className="flex-1 text-sm">
                            <p className="leading-snug">{item.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {lineLabel(item)}
                            </p>
                          </div>
                          <span className="text-sm">{money(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Shipping {group.shipping === 0 ? 'free' : money(group.shipping)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7 space-y-1.5 border-t border-border pt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : money(shipping)}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-border pt-3 font-medium">
                  <span>Total</span>
                  <span>{money(total)}</span>
                </div>
              </div>

              <Button type="submit" size="lg" disabled={placing} className="mt-6 h-12 w-full">
                {placing ? 'Placing order…' : 'Place order'}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Card payment is connected in the next milestone — orders are placed as unpaid for
                now.
              </p>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}