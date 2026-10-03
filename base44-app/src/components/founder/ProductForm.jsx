import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ColorwayEditor from '@/components/founder/ColorwayEditor';
import { CATEGORIES } from '@/lib/branding';
import { blankColorway, productColorways } from '@/lib/colorways';

const blankDraft = () => ({
  title: '',
  description: '',
  category: '',
  price: '',
  status: 'published',
  colorways: [blankColorway()],
});

/** The form's colours for a product — an existing one's, or a single blank. */
function draftFrom(product) {
  if (!product) return blankDraft();

  return {
    title: product.title || '',
    description: product.description || '',
    category: product.category || '',
    price: product.price != null ? String(product.price) : '',
    status: product.status || 'published',
    colorways: productColorways(product).map((color) => ({
      name: color.name || '',
      swatch: color.swatch || '',
      images: color.images || [],
      sizes: (color.sizes || []).map((size) => ({
        label: size.label || '',
        stock: size.stock == null ? '' : String(size.stock),
      })),
    })),
  };
}

export default function ProductForm({ open, onOpenChange, initial, onSubmit, submitting }) {
  const [values, setValues] = useState(blankDraft);

  useEffect(() => {
    if (!open) return;
    setValues(draftFrom(initial));
  }, [open, initial]);

  const set = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  // One unnamed colour is the single default colour; several colours each need a
  // name, or a shopper could not tell them apart.
  const needsNames =
    values.colorways.length > 1 && values.colorways.some((color) => !color.name.trim());

  const submit = (event) => {
    event.preventDefault();
    if (needsNames) return;

    const colorways = values.colorways
      .map((color) => ({
        name: color.name.trim(),
        swatch: color.swatch,
        images: color.images,
        sizes: color.sizes
          .map((size) => ({
            label: size.label.trim(),
            stock: size.stock === '' ? null : Math.max(0, Math.round(Number(size.stock) || 0)),
          }))
          .filter((size) => size.label),
      }))
      .filter((color) => color.name || color.images.length || color.sizes.length);

    // The product's own photos and sizes stay the flattened view of its colours,
    // so cards, listings and the setup checklist keep reading one place.
    const sizes = [];
    colorways.forEach((color) =>
      color.sizes.forEach((size) => {
        if (!sizes.includes(size.label)) sizes.push(size.label);
      })
    );

    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      price: Number(values.price) || 0,
      colorways,
      images: colorways.find((color) => color.images.length)?.images || [],
      sizes,
      status: values.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal">
            {initial ? 'Edit product' : 'New product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <Label htmlFor="title">Product name</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder="Oversized wool coat"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={values.description}
              onChange={(event) => set('description', event.target.value)}
              placeholder="Fabric, fit, sizing notes."
              className="mt-2"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select value={values.category} onValueChange={(value) => set('category', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(event) => set('price', event.target.value)}
                placeholder="180"
                required
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label>Colours</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              One colour is fine. Add more and shoppers pick between them — each with its own
              photos, sizes and stock. Still counts as one piece on your plan.
            </p>
            <div className="mt-3">
              <ColorwayEditor
                colors={values.colorways}
                onChange={(colorways) => set('colorways', colorways)}
              />
            </div>
            {needsNames && (
              <p className="mt-3 text-sm text-destructive">Give every colour a name.</p>
            )}
          </div>

          <div>
            <Label>Visibility</Label>
            <Select value={values.status} onValueChange={(value) => set('status', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published — live in the marketplace</SelectItem>
                <SelectItem value="draft">Draft — hidden from shoppers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={submitting || !values.title.trim() || !values.price || needsNames}
            className="h-11 w-full"
          >
            {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add product'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}