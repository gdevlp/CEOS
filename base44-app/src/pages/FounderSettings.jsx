import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteHeader from '@/components/SiteHeader';
import FounderNav from '@/components/founder/FounderNav';
import AccountSettings from '@/components/founder/settings/AccountSettings';
import PaymentSettings from '@/components/founder/settings/PaymentSettings';
import BoostSettings from '@/components/founder/settings/BoostSettings';
import PersonalizationSettings from '@/components/founder/settings/PersonalizationSettings';
import PreferencesSettings from '@/components/founder/settings/PreferencesSettings';
import VacationSettings from '@/components/founder/settings/VacationSettings';
import PrivacySettings from '@/components/founder/settings/PrivacySettings';
import { toast } from '@/components/ui/use-toast';

const SECTIONS = [
  { id: 'boost', label: 'Boost shop' },
  { id: 'account', label: 'Account details' },
  { id: 'payment', label: 'Payment settings' },
  { id: 'personalization', label: 'Personalization' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'vacation', label: 'Vacation mode' },
  { id: 'privacy', label: 'Privacy' },
];

export default function FounderSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    (async () => {
      const list = await base44.entities.Brand.filter({ created_by_id: user.id }, '-created_date', 1);
      if (!active) return;
      if (!list.length) {
        navigate('/apply', { replace: true });
        return;
      }
      setBrand(list[0]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, navigate]);

  const save = async (patch, message) => {
    const updated = await base44.entities.Brand.update(brand.id, patch);
    setBrand(updated);
    toast({ title: message || 'Settings saved' });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <FounderNav />

      <main className="mx-auto max-w-5xl px-5 py-14">
        <h1 className="font-display text-4xl">Settings</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Everything about how your shop runs — how it looks, what you are billed and when you step
          away.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
          <nav aria-label="Settings sections" className="hidden lg:block">
            <ul className="sticky top-24 space-y-1 text-sm">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-6">
            <BoostSettings brand={brand} />
            <AccountSettings user={user} />
            <PaymentSettings brand={brand} />
            <PersonalizationSettings />
            <PreferencesSettings brand={brand} onSave={save} />
            <VacationSettings brand={brand} onSave={save} />
            <PrivacySettings brand={brand} onSave={save} />
          </div>
        </div>
      </main>
    </div>
  );
}