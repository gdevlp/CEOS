import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import CartButton from '@/components/market/CartButton';
import ThemeToggle from '@/components/ThemeToggle';

export default function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const signOut = () => {
    logout(false);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link to="/" className="font-display text-2xl leading-none tracking-tight">
          CEO<span className="text-brand">/$</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/market" className="transition-colors hover:text-foreground">
            Shop
          </Link>
          <Link to="/brands" className="transition-colors hover:text-foreground">
            Brands
          </Link>
          <Link to="/#why" className="transition-colors hover:text-foreground">
            Why CEO/$
          </Link>
          <Link to="/#how" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link to="/#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link to="/founder">My brand</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/orders">My orders</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/founder/analytics">Analytics</Link>
              </Button>
              <CartButton />
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <CartButton />
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/apply">Apply to sell</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}