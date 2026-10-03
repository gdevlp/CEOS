import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { Image } from '@/components/ui/image';
import ShareImageCard from '@/components/founder/ShareImageCard';
import { downloadCard } from '@/lib/shareCard';
import { colorwayImages, productColorways } from '@/lib/colorways';
import { money } from '@/lib/shop';
import {
  APP_ONLY_TARGETS,
  DIRECT_TARGETS,
  canShareNatively,
  captionFor,
  copyText,
  shareNatively,
  shareUrlFor,
  slugify,
} from '@/lib/share';
import { toast } from '@/components/ui/use-toast';
import { Check, Copy, Download, Loader2, Share2 } from 'lucide-react';

export default function ListingLiveDialog({ open, onOpenChange, product }) {
  const cardRef = useRef(null);
  const [caption, setCaption] = useState('');
  const [copied, setCopied] = useState('');
  const [building, setBuilding] = useState(false);
  const native = canShareNatively();

  const url = useMemo(() => (product ? shareUrlFor(product) : ''), [product]);
  const photo = product ? colorwayImages(product, productColorways(product)[0])[0] : '';

  useEffect(() => {
    if (!open || !product) return;
    setCaption(captionFor(product, product.brand_name || 'our brand'));
    setCopied('');
  }, [open, product]);

  if (!product) return null;

  const copy = async (value, key) => {
    const ok = await copyText(value);
    if (!ok) {
      toast({
        title: 'Could not copy',
        description: 'Select the text and copy it manually.',
      });
      return;
    }
    setCopied(key);
    toast({ title: key === 'link' ? 'Link copied' : 'Caption copied' });
  };

  const shareNow = () =>
    shareNatively({ title: product.title, text: caption, url });

  const saveImage = async () => {
    if (!cardRef.current) return;
    setBuilding(true);
    try {
      await downloadCard(cardRef.current, `${slugify(product.title)}.png`);
    } catch {
      toast({
        title: 'Could not build the image',
        description: 'Your browser blocked the product photo. Try another browser, or save the photo directly.',
      });
    } finally {
      setBuilding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-normal">
            Your listing is live
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex items-center gap-4 border-b border-border pb-6">
          <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            <Image src={photo} alt="" fittingType="fill" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-heading text-lg">{product.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {money(product.price)} · live in the marketplace and on your store
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="space-y-7">
            <div>
              <Label>Your link</Label>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Visits and orders through this link are counted as coming from your own sharing.
              </p>
              <div className="mt-3 flex gap-2">
                <Input readOnly value={url} className="flex-1 text-xs" />
                <Button variant="outline" onClick={() => copy(url, 'link')}>
                  {copied === 'link' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                rows={3}
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                className="mt-3"
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 -ml-3"
                onClick={() => copy(caption, 'caption')}
              >
                {copied === 'caption' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy caption
              </Button>
            </div>

            <div>
              <Label>Share it</Label>

              {native && (
                <Button className="mt-3 h-11 w-full" onClick={shareNow}>
                  <Share2 className="h-4 w-4" />
                  Share…
                </Button>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {DIRECT_TARGETS.map((target) => (
                  <Button key={target.key} asChild variant="outline" size="sm">
                    <a
                      href={target.href(url, caption)}
                      {...(target.external
                        ? { target: '_blank', rel: 'noreferrer' }
                        : {})}
                    >
                      {target.label}
                    </a>
                  </Button>
                ))}

                {APP_ONLY_TARGETS.map((target) => (
                  <Button
                    key={target.key}
                    variant="outline"
                    size="sm"
                    disabled={!native}
                    onClick={native ? shareNow : undefined}
                    title={
                      native
                        ? `Send to ${target.label} through your phone's share menu`
                        : `${target.label} has no browser link — download the image card and post from the app.`
                    }
                  >
                    {target.label}
                  </Button>
                ))}
              </div>

              {!native && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Instagram and TikTok have no browser link, so they only open through a phone's
                  share menu. On a computer, download the image card and post it from the app.
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Image card</Label>
            <p className="mt-1.5 text-xs text-muted-foreground">
              The product photo with your brand name.
            </p>
            <div className="mt-3">
              <ShareImageCard product={product} photo={photo} innerRef={cardRef} />
            </div>
            <Button
              variant="outline"
              className="mt-3 w-full"
              onClick={saveImage}
              disabled={building}
            >
              {building ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {building ? 'Building…' : 'Download image'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}