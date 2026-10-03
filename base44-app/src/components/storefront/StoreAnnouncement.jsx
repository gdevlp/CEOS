import React from 'react';

export default function StoreAnnouncement({ text }) {
  if (!text) return null;

  return (
    <div className="bg-foreground px-5 py-2.5 text-center text-xs tracking-wide text-background">
      {text}
    </div>
  );
}