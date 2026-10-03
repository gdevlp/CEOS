import React from 'react';
import { money } from '@/lib/shop';

export default function TopPieces({ pieces }) {
  if (!pieces.length) {
    return <p className="text-sm text-muted-foreground">Nothing viewed yet.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <th className="pb-3">Piece</th>
          <th className="pb-3 text-right">Views</th>
          <th className="pb-3 text-right">Units</th>
          <th className="pb-3 text-right">Sales</th>
        </tr>
      </thead>
      <tbody>
        {pieces.map((row) => (
          <tr key={row.id} className="border-t border-border">
            <td className="py-3 pr-4">{row.title || 'Untitled piece'}</td>
            <td className="py-3 text-right tabular-nums">{row.views}</td>
            <td className="py-3 text-right tabular-nums">{row.units}</td>
            <td className="py-3 text-right tabular-nums">{money(row.sales)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}