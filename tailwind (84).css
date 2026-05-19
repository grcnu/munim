import React from 'react';
import { mockInvoices } from '@/lib/mockData';
import { formatIndianCurrency, formatDate } from '@/lib/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import { PaymentStatus } from '@/lib/mockData';

export default function RecentInvoicesTable() {
  const recent = mockInvoices.slice(0, 5);

  const statusVariant = (s: PaymentStatus) => {
    if (s === 'Paid') return 'paid';
    if (s === 'Partial') return 'partial';
    return 'pending';
  };

  return (
    <div className="bg-card rounded-xl border shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-sm font-700 text-foreground">Recent Invoices</h2>
        <a href="/sales-invoice-management" className="text-xs font-600 text-primary hover:underline">
          View all
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-4 py-2.5 text-xs font-600 text-muted-foreground">Invoice #</th>
              <th className="text-left px-4 py-2.5 text-xs font-600 text-muted-foreground">Customer</th>
              <th className="text-left px-4 py-2.5 text-xs font-600 text-muted-foreground hidden sm:table-cell">Date</th>
              <th className="text-right px-4 py-2.5 text-xs font-600 text-muted-foreground">Total</th>
              <th className="text-right px-4 py-2.5 text-xs font-600 text-muted-foreground hidden md:table-cell">Balance</th>
              <th className="text-center px-4 py-2.5 text-xs font-600 text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((inv, i) => (
              <tr
                key={`recent-inv-${inv.id}`}
                className={`border-b last:border-b-0 row-hover transition-colors ${i % 2 === 1 ? 'bg-muted/20' : ''}`}
              >
                <td className="px-4 py-2.5">
                  <span className="font-700 text-primary text-xs font-mono">{inv.invoiceNumber}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-foreground text-xs font-500 truncate max-w-[140px] block">{inv.customerName}</span>
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">
                  {formatDate(inv.date)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-xs font-700 text-foreground font-tabular">
                    {formatIndianCurrency(inv.grandTotalAfterDiscount)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right hidden md:table-cell">
                  <span className={`text-xs font-600 font-tabular ${inv.balanceDue > 0 ? 'text-danger' : 'text-muted-foreground'}`}>
                    {formatIndianCurrency(inv.balanceDue)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <StatusBadge status={statusVariant(inv.status)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}