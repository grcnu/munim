'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { mockCustomers, mockInvoices } from '@/lib/mockData';
import { formatIndianCurrency, formatDate } from '@/lib/formatters';

interface LedgerEntry {
  date: string;
  type: string;
  reference: string;
  debit: number;
  credit: number;
  note: string;
}

function buildCustomerLedger(customerId: string): LedgerEntry[] {
  const customer = mockCustomers.find((c) => c.id === customerId);
  if (!customer) return [];
  const entries: LedgerEntry[] = [];
  if (customer.openingBalance > 0) {
    entries.push({ date: '2026-01-01', type: 'Opening Balance', reference: '—', debit: customer.openingBalance, credit: 0, note: 'Opening balance' });
  }
  mockInvoices.filter((i) => !i.is_deleted && i.customerId === customerId).forEach((inv) => {
    entries.push({ date: inv.date, type: 'Sale Invoice', reference: inv.invoiceNumber, debit: inv.grandTotalAfterDiscount, credit: 0, note: '' });
    const paid = inv.cashPaid + inv.upiPaid + inv.bankPaid;
    if (paid > 0) {
      const methods = [inv.cashPaid > 0 ? 'Cash' : '', inv.upiPaid > 0 ? 'UPI' : '', inv.bankPaid > 0 ? 'Bank' : ''].filter(Boolean).join(', ');
      entries.push({ date: inv.date, type: 'Payment', reference: inv.invoiceNumber, debit: 0, credit: paid, note: `via ${methods}` });
    }
  });
  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export default function CustomerLedgerPage() {
  const [customerId, setCustomerId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const entries = useMemo(() => {
    if (!customerId) return [];
    return buildCustomerLedger(customerId).filter((e) => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [customerId, dateFrom, dateTo]);

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
          <h1 className="text-2xl font-700 text-foreground">Customer Ledger</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Transaction history with running balance per customer</p>
        </div>

        <div className="bg-card rounded-xl border shadow-card p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-600 text-muted-foreground mb-1">Customer *</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
              <option value="">Select customer…</option>
              {mockCustomers.filter((c) => !c.is_deleted).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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

        {customerId && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-xl border shadow-card p-3">
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Total Billed</p>
                <p className="text-lg font-800 text-foreground font-tabular">{formatIndianCurrency(totalDebit)}</p>
              </div>
              <div className="bg-card rounded-xl border shadow-card p-3">
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Total Received</p>
                <p className="text-lg font-800 text-accent font-tabular">{formatIndianCurrency(totalCredit)}</p>
              </div>
              <div className={`bg-card rounded-xl border shadow-card p-3 ${currentBalance > 0 ? 'border-l-4 border-l-danger' : ''}`}>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Balance Due</p>
                <p className={`text-lg font-800 font-tabular ${currentBalance > 0 ? 'text-danger' : 'text-muted-foreground'}`}>{formatIndianCurrency(currentBalance)}</p>
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
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-sm">No transactions found for this customer</td></tr>
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

        {!customerId && (
          <div className="bg-card rounded-xl border shadow-card p-12 text-center">
            <p className="text-muted-foreground text-sm">Select a customer above to view their ledger</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
