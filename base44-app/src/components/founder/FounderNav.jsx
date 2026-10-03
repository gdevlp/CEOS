import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { to: '/founder', label: 'Dashboard' },
  { to: '/founder/products', label: 'Products' },
  { to: '/founder/orders', label: 'Orders' },
  { to: '/founder/analytics', label: 'Analytics' },
  { to: '/founder/storefront', label: 'Storefront' },
  { to: '/founder/billing', label: 'Billing' },
  { to: '/founder/settings', label: 'Settings' },
];

/** The founder area's own sections, so every part of a brand is one tap away. */
export default function FounderNav() {
  const { pathname } = useLocation();

  return (
    <nav className="border-b border-border/70 bg-background">
      <div className="no-scrollbar mx-auto flex max-w-5xl gap-1 overflow-x-auto px-5">
        {SECTIONS.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors',
              pathname === section.to
                ? 'border-foreground font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {section.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}