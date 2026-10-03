import React from "react";
import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row">
        <div className="font-display text-xl text-foreground">
          CEO<span className="text-brand">/$</span>
        </div>
        <p>Built for early-stage clothing brands.</p>
        <Link to="/login" className="transition-colors hover:text-foreground">
          Sign in
        </Link>
      </div>
    </footer>
  );
}