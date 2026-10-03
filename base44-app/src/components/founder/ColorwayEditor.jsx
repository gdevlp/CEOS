import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUploader from '@/components/brand/ImageUploader';
import { blankColorway } from '@/lib/colorways';
import { Plus, X } from 'lucide-react';

const MAX_PHOTOS = 5;

export default function ColorwayEditor({ colors = [], onChange }) {
  const patch = (index, changes) =>
    onChange(colors.map((color, i) => (i === index ? { ...color, ...changes } : color)));

  const patchSize = (index, sizeIndex, changes) =>
    patch(index, {
      sizes: colors[index].sizes.map((size, i) =>
        i === sizeIndex ? { ...size, ...changes } : size
      ),
    });

  return (
    <div className="space-y-4">
      {colors.map((color, index) => (
        <div key={index} className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <label
              title="Swatch"
              className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border"
            >
              {color.swatch ? (
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: color.swatch }}
                />
              ) : (
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <input
                type="color"
                value={color.swatch || '#111111'}
                onChange={(event) => patch(index, { swatch: event.target.value })}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>

            <Input
              value={color.name}
              onChange={(event) => patch(index, { name: event.target.value })}
              placeholder="Colour name — e.g. Black"
              className="flex-1"
            />

            {colors.length > 1 && (
              <button
                type="button"
                onClick={() => onChange(colors.filter((_, i) => i !== index))}
                aria-label="Remove colour"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {color.swatch && (
            <button
              type="button"
              onClick={() => patch(index, { swatch: '' })}
              className="mt-2 text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Remove swatch
            </button>
          )}

          <div className="mt-5">
            <Label>Photos</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              These switch when a shopper picks this colour.
            </p>
            <div className="mt-3">
              <ImageUploader
                images={color.images}
                onChange={(images) => patch(index, { images })}
                max={MAX_PHOTOS}
              />
            </div>
          </div>

          <div className="mt-5">
            <Label>Sizes and stock</Label>
            <div className="mt-3 space-y-2">
              {color.sizes.map((size, sizeIndex) => (
                <div key={sizeIndex} className="flex gap-2">
                  <Input
                    value={size.label}
                    onChange={(event) => patchSize(index, sizeIndex, { label: event.target.value })}
                    placeholder="M"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={size.stock}
                    onChange={(event) => patchSize(index, sizeIndex, { stock: event.target.value })}
                    placeholder="Stock"
                    className="w-24"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      patch(index, { sizes: color.sizes.filter((_, i) => i !== sizeIndex) })
                    }
                    aria-label="Remove size"
                    className="px-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => patch(index, { sizes: [...color.sizes, { label: '', stock: '' }] })}
              className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              + Add size
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Leave stock empty for made-to-order — it stays available.
            </p>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...colors, blankColorway()])}
        className="w-full"
      >
        <Plus className="h-4 w-4" />
        Add colour
      </Button>
    </div>
  );
}