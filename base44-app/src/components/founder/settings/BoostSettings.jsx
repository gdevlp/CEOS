import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import SettingsSection from './SettingsSection';
import { DIRECT_TARGETS, SHARE_SOURCE, canShareNatively, copyText, shareNatively } from '@/lib/share';
import { toast } from '@/components/ui/use-toast';
import { Check, Copy, Share2 } from 'lucide-react';

export default function BoostSettings({ brand }) {
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/brand/${brand.id}?src=${SHARE_SOURCE}`;
  const text = `${brand.name} is live on CEO/$. Come and see the collection.`;

  const copy = async () => {
    const ok = await copyText(`${text}\n${url}`);
    setCopied(ok);
    toast({
      title: ok ? 'Shop link copied' : 'Could not copy the link',
      description: ok ? 'Paste it anywhere your shoppers are.' : 'Copy it from the box above.',
    });
  };

  const share = async () => {
    const ok = await shareNatively({ title: brand.name, text, url });
    if (!ok) toast({ title: 'Sharing was cancelled' });
  };

  return (
    <SettingsSection
      id="boost"
      title="Boost your shop"
      blurb="Send shoppers straight to your storefront. Links you share from here are counted as shares in your analytics."
    >
      <p className="break-all rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        {url}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={copy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy shop link'}
        </Button>
        {canShareNatively() && (
          <Button variant="outline" onClick={share}>
            <Share2 className="h-4 w-4" />
            Share…
          </Button>
        )}
        {DIRECT_TARGETS.map((target) => (
          <Button key={target.key} asChild variant="outline">
            <a href={target.href(url, text)} target="_blank" rel="noreferrer">
              {target.label}
            </a>
          </Button>
        ))}
      </div>

      {!brand.storefront_published_at && (
        <p className="mt-4 text-sm text-muted-foreground">
          You have not published your storefront yet, so shoppers still see the default look.
        </p>
      )}
    </SettingsSection>
  );
}