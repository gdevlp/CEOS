import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteHeader from '@/components/SiteHeader';
import ApplicationForm from '@/components/brand/ApplicationForm';
import { sendBrandEmail } from '@/lib/emails';
import { toast } from '@/components/ui/use-toast';

export default function Apply() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    (async () => {
      const existing = await base44.entities.Brand.filter(
        { created_by_id: user.id },
        '-created_date',
        1,
      );
      if (!active) return;
      if (existing.length) navigate('/founder', { replace: true });
      else setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, [user, navigate]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    const brand = await base44.entities.Brand.create({
      ...values,
      owner_name: values.owner_name || user.full_name || '',
      contact_email: values.contact_email || user.email,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    });

    await sendBrandEmail({
      to: brand.contact_email,
      subject: 'We received your CEO/$ application',
      heading: `Thanks — ${brand.name} is with our team`,
      lines: [
        'Every brand on CEO/$ is reviewed by hand, so this usually takes a few days.',
        'You can follow the status of your application any time from your founder dashboard.',
        'We will email you the moment there is an update.',
      ],
    });

    toast({
      title: 'Application submitted',
      description: 'We will email you as soon as it has been reviewed.',
    });
    navigate('/founder', { replace: true });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          Founder application
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
          Tell us about your brand
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Every brand is reviewed before it goes live. The more you tell us, the faster we can make a
          decision.
        </p>

        <div className="mt-12">
          {checking ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
          ) : (
            <ApplicationForm onSubmit={handleSubmit} submitting={submitting} />
          )}
        </div>
      </main>
    </div>
  );
}