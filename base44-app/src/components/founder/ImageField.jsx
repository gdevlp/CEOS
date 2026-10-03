import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';
import { IMAGE_RULES, checkImage } from '@/lib/storefront';

/**
 * A single curated image slot. Enforces the minimum size before uploading, so a
 * stretched or pixelated banner can never reach a live storefront. Images are
 * cropped to their slot by the Image component, so a founder's photo always
 * lands in the frame regardless of its own proportions.
 */
export default function ImageField({ kind, value, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const rule = IMAGE_RULES[kind];

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const check = await checkImage(file, kind);
      if (!check.ok) {
        setError(check.message);
        return;
      }
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      onChange(res.file_url);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <div className={`${rule.box} overflow-hidden rounded-xl border border-border bg-muted`}>
          {value ? (
            <Image src={value} alt="" fittingType="fill" className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              {rule.label}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {value ? 'Replace' : 'Upload'}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              <X className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        At least {rule.minWidth}×{rule.minHeight}px. {rule.note} We crop it to fit.
      </p>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}