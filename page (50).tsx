'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { formatIndianCurrency, formatDate } from '@/lib/formatters';

interface Supplier {
  id: string;
  name: string;
}

const mockSuppliers: Supplier[] = [
  { id: 'sup-001', name: 'Agro Traders Pvt Ltd' },
  { id: 'sup-002', name: 'National Foods Distributor' },
  { id: 'sup-003', name: 'Sunrise FMCG Wholesale' },
  { id: 'sup-004', name: 'Karnataka Oils & Fats' },
];

interface LedgerEntry {
  date: string;
  type: string;
  reference: string;
  debit: number;
  credit: number;
  note: string;
}

const mockSupplierLedgers: Record<string, LedgerEntry[]> = {
  'sup-001': [
    { date: '2026-01-01', type: 'Opening Balance', reference: '—', debit: 15000, credit: 0, note: 'Opening balance' },
    { date: '2026-05-16', type: 'Purchase Bill', reference: 'PUR-0005', debit: 21490, credit: 0, note: '' },
    { date: '2026-05-17', type: 'Payment-Out', reference: 'PO-001', debit: 0, credit: 12000, note: 'NEFT against PUR-0005' },
  ],
  'sup-002': [
    { date: '2026-05-10', type: 'Purchase Bill', reference: 'PUR-0003', debit: 17140, credit: 0, note: '' },
    { date: '2026-05-13', type: 'Payment-Out', reference: 'PO-003', debit: 0, credit: 8750, note: 'Advance payment' },
  ],
  'sup-003': [
    { date: '2026-01-01', type: 'Opening Balance', reference: '—', debit: 8500, credit: 0, note: 'Opening balance' },
    { date: '2026-05-14', type: 'Purchase Bill', reference: 'PUR-0004', debit: 19234, credit: 0, note: '' },
    { date: '2026-05-15', type: 'Payment-Out', reference: 'PO-002', debit: 0, credit: 5500, note: '' },
    { date: '2026-05-14', type: 'Payment-Out', reference: 'PO-004', debit: 0, credit: 19234, note: 'Full payment' },
  ],
};

export default function SupplierLedgerPage() {
  const [supplierId, setSupplierId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const rawEntries = supplierId ? (mockSupplierLedgers[supplierId] ?? []) : [];
  const entries = rawEntries.filter((e) => {
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo && e.date > dateTo) return false;
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));

  let runningBalance = 0;
  const withBalance = entries.map((e) => {
    runningBalance += e.debit - e.credit;
    return { ...e, balance: Math.max(0, runningBalance) };
  });

  const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0);
  const currentBalance = Math.max(0, totalDebit - totalCredit);

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Supplier Ledger</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Purchase and payment history per supplier</p>
        </div>

        <div className="bg-card rounded-xl border shadow-card p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-600 text-muted-foreground mb-1">Supplier *</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
              <option value="">Select supplier…</option>
              {mockSuppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>
        </div>

        {supplierId && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-xl border shadow-card p-3">
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Total Purchased</p>
                <p className="text-lg font-800 text-foreground font-tabular">{formatIndianCurrency(totalDebit)}</p>
              </div>
              <div className="bg-card rounded-xl border shadow-card p-3">
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Total Paid</p>
                <p className="text-lg font-800 text-accent font-tabular">{formatIndianCurrency(totalCredit)}</p>
              </div>
              <div className={`bg-card rounded-xl border shadow-card p-3 ${currentBalance > 0 ? 'border-l-4 border-l-warning' : ''}`}>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Balance Due</p>
                <p className={`text-lg font-800 font-tabular ${currentBalance > 0 ? 'text-warning' : 'text-muted-foreground'}`}>{formatIndianCurrency(currentBalance)}</p>
              </div>
            </div>

            <div className="bg-card rounded-xl border shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40"><tr>
                    <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Reference</th>
                    <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Debit</th>
                    <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Credit</th>
                    <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Balance</th>
                    <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Note</th>
                  </tr></thead>
                  <tbody>
                    {withBalance.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-sm">No transactions found</td></tr>
                    ) : withBalance.map((e, i) => (
                      <tr key={i} className={`border-b last:border-b-0 ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(e.date)}</td>
                        <td className="px-4 py-3 text-xs font-500 text-foreground">{e.type}</td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{e.reference}</td>
                        <td className="px-4 py-3 text-right text-xs font-tabular">{e.debit > 0 ? formatIndianCurrency(e.debit) : '—'}</td>
                        <td className="px-4 py-3 text-right text-xs font-tabular text-accent">{e.credit > 0 ? formatIndianCurrency(e.credit) : '—'}</td>
                        <td className="px-4 py-3 text-right text-sm font-700 font-tabular">{formatIndianCurrency(e.balance)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{e.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!supplierId && (
          <div className="bg-card rounded-xl border shadow-card p-12 text-center">
            <p className="text-muted-foreground text-sm">Select a supplier above to view their ledger</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
