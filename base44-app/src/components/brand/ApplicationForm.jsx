import React, { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { CATEGORIES } from '@/lib/branding';
import { PLANS, DEFAULT_PLAN } from '@/lib/plans';
import OptionCards from '@/components/founder/OptionCards';
import ImageUploader from './ImageUploader';

const EMPTY = {
  name: '',
  tagline: '',
  category: '',
  description: '',
  website: '',
  instagram: '',
  tiktok: '',
  sample_images: [],
  owner_name: '',
  contact_email: '',
  country: '',
  plan: DEFAULT_PLAN,
};

const PLAN_OPTIONS = PLANS.map((plan) => ({
  key: plan.key,
  name: `${plan.name} — $${plan.price}/mo`,
  blurb: `${plan.fee}% per sale · up to ${plan.cap} live products`,
}));

function Section({ title, hint, children }) {
  return (
    <section className="grid gap-5 border-t border-border pt-9 md:grid-cols-[210px_1fr] md:gap-10">
      <div>
        <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em]">{title}</h2>
        {hint && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export default function ApplicationForm({
  initial,
  submitLabel = 'Submit application',
  submitting,
  onSubmit,
}) {
  const [values, setValues] = useState({ ...EMPTY, ...initial });
  const set = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="space-y-9"
    >
      <Section title="The brand" hint="What you are building, and who it is for.">
        <div className="space-y-2">
          <Label htmlFor="name">Brand name</Label>
          <Input
            id="name"
            required
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Studio Marrow"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">One-line tagline</Label>
          <Input
            id="tagline"
            value={values.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            placeholder="Minimal knitwear, made to last"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={values.category} onValueChange={(value) => set('category', value)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Choose a category" />
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
        <div className="space-y-2">
          <Label htmlFor="description">About the brand</Label>
          <Textarea
            id="description"
            required
            rows={5}
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Tell us the story, the craft and what makes it different."
          />
        </div>
      </Section>

      <Section title="Where you sell" hint="Links help us understand your brand today.">
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={values.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="yourbrand.com"
            className="h-11"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={values.instagram}
              onChange={(e) => set('instagram', e.target.value)}
              placeholder="@yourbrand"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktok">TikTok</Label>
            <Input
              id="tiktok"
              value={values.tiktok}
              onChange={(e) => set('tiktok', e.target.value)}
              placeholder="@yourbrand"
              className="h-11"
            />
          </div>
        </div>
      </Section>

      <Section title="Sample images" hint="Up to six. Clean, well-lit product or campaign shots work best.">
        <ImageUploader
          images={values.sample_images}
          onChange={(images) => set('sample_images', images)}
        />
      </Section>

      <Section title="About you" hint="So we know who we are talking to.">
        <div className="space-y-2">
          <Label htmlFor="owner_name">Your name</Label>
          <Input
            id="owner_name"
            value={values.owner_name}
            onChange={(e) => set('owner_name', e.target.value)}
            placeholder="Full name"
            className="h-11"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact email</Label>
            <Input
              id="contact_email"
              type="email"
              value={values.contact_email}
              onChange={(e) => set('contact_email', e.target.value)}
              placeholder="you@yourbrand.com"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={values.country}
              onChange={(e) => set('country', e.target.value)}
              placeholder="United Kingdom"
              className="h-11"
            />
          </div>
        </div>
      </Section>

      <Section
        title="Your plan"
        hint="Pick the plan you want to start on. You can change it any time from billing once you are live."
      >
        <OptionCards
          options={PLAN_OPTIONS}
          value={values.plan}
          onChange={(plan) => set('plan', plan)}
          className="sm:grid-cols-2"
        />
      </Section>

      <div className="flex justify-end border-t border-border pt-9">
        <Button type="submit" size="lg" disabled={submitting} className="h-12 px-8">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}