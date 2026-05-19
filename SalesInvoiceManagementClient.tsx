'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { formatIndianCurrency, formatDate } from '@/lib/formatters';
import { mockInvoices } from '@/lib/mockData';

type AccountFilter = 'All' | 'Cash' | 'UPI' | 'Bank';

interface MoneyEntry {
  date: string;
  account: 'Cash' | 'UPI' | 'Bank';
  type: string;
  details: string;
  moneyIn: number;
  moneyOut: number;
}

function buildMoneyLedger(): MoneyEntry[] {
  const entries: MoneyEntry[] = [];

  mockInvoices.filter((i) => !i.is_deleted).forEach((inv) => {
    if (inv.cashPaid > 0) entries.push({ date: inv.date, account: 'Cash', type: 'Invoice Payment', details: `${inv.invoiceNumber} — ${inv.customerName}`, moneyIn: inv.cashPaid, moneyOut: 0 });
    if (inv.upiPaid > 0) entries.push({ date: inv.date, account: 'UPI', type: 'Invoice Payment', details: `${inv.invoiceNumber} — ${inv.customerName}`, moneyIn: inv.upiPaid, moneyOut: 0 });
    if (inv.bankPaid > 0) entries.push({ date: inv.date, account: 'Bank', type: 'Invoice Payment', details: `${inv.invoiceNumber} — ${inv.customerName}`, moneyIn: inv.bankPaid, moneyOut: 0 });
  });

  // Mock expenses
  entries.push({ date: '2026-05-15', account: 'Bank', type: 'Expense', details: 'Rent — May 2026', moneyIn: 0, moneyOut: 18000 });
  entries.push({ date: '2026-05-14', account: 'UPI', type: 'Expense', details: 'Electricity — April 2026', moneyIn: 0, moneyOut: 3450 });
  entries.push({ date: '2026-05-12', account: 'Cash', type: 'Expense', details: 'Transport — Agro Traders', moneyIn: 0, moneyOut: 850 });

  // Mock fund transfers
  entries.push({ date: '2026-05-16', account: 'Cash', type: 'Fund Transfer', details: 'Cash → Bank (Daily deposit)', moneyIn: 0, moneyOut: 5000 });
  entries.push({ date: '2026-05-16', account: 'Bank', type: 'Fund Transfer', details: 'Cash → Bank (Daily deposit)', moneyIn: 5000, moneyOut: 0 });

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

const allEntries = buildMoneyLedger();

export default function MoneyLedgerPage() {
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() =>
    allEntries.filter((e) => {
      const matchAccount = accountFilter === 'All' || e.account === accountFilter;
      const matchFrom = !dateFrom || e.date >= dateFrom;
      const matchTo = !dateTo || e.date <= dateTo;
      return matchAccount && matchFrom && matchTo;
    }), [accountFilter, dateFrom, dateTo]);

  const totalIn = filtered.reduce((s, e) => s + e.moneyIn, 0);
  const totalOut = filtered.reduce((s, e) => s + e.moneyOut, 0);

  const accountBg = (a: string) => a === 'Cash' ? 'bg-accent/10 text-accent' : a === 'UPI' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning';

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Money Ledger</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Cash, UPI and Bank transaction register</p>
        </div>

        <div className="bg-card rounded-xl border shadow-card p-4 flex flex-wrap gap-4">
          <div className="flex gap-2">
            {(['All', 'Cash', 'UPI', 'Bank'] as AccountFilter[]).map((a) => (
              <button key={a} onClick={() => setAccountFilter(a)}
                className={`px-3 py-1.5 text-xs font-600 rounded-lg border transition-all ${accountFilter === a ? 'bg-primary text-white border-primary' : 'hover:bg-muted border-border'}`}>
                {a}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            <span className="text-xs text-muted-foreground">to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-xs text-danger hover:underline">Clear</button>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border shadow-card p-3">
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Total Money In</p>
            <p className="text-xl font-800 text-accent font-tabular">{formatIndianCurrency(totalIn)}</p>
          </div>
          <div className="bg-card rounded-xl border shadow-card p-3">
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Total Money Out</p>
            <p className="text-xl font-800 text-danger font-tabular">{formatIndianCurrency(totalOut)}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr>
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Date</th>
                <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Account</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Details</th>
                <th className="text-right px-4 py-3 text-xs font-600 text-accent">Money In</th>
                <th className="text-right px-4 py-3 text-xs font-600 text-danger">Money Out</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">No transactions found</td></tr>
                ) : filtered.map((e, i) => (
                  <tr key={i} className={`border-b last:border-b-0 ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 ${accountBg(e.account)}`}>{e.account}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-500 text-foreground">{e.type}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{e.details}</td>
                    <td className="px-4 py-3 text-right text-xs font-700 text-accent font-tabular">{e.moneyIn > 0 ? formatIndianCurrency(e.moneyIn) : '—'}</td>
                    <td className="px-4 py-3 text-right text-xs font-700 text-danger font-tabular">{e.moneyOut > 0 ? formatIndianCurrency(e.moneyOut) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
