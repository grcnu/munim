'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';

import { mockInvoices } from '@/lib/mockData';
import { formatIndianCurrency } from '@/lib/formatters';

const mockExpenses = [
  { category: 'Rent', amount: 18000 },
  { category: 'Electricity', amount: 3450 },
  { category: 'Transport', amount: 850 },
  { category: 'Packaging', amount: 1200 },
  { category: 'Salaries', amount: 25000 },
];

const mockPurchaseBillsTotal = 57864;
const mockSalesReturnsTotal = 1198.55;
const mockPurchaseReturnsTotal = 0;

export default function ProfitLossPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const revenue = useMemo(() => {
    return mockInvoices?.filter((i) => !i?.is_deleted)?.filter((i) => {
      if (dateFrom && i?.date < dateFrom) return false;
      if (dateTo && i?.date > dateTo) return false;
      return true;
    })?.reduce((s, i) => s + i?.grandTotalAfterDiscount, 0);
  }, [dateFrom, dateTo]);

  const netRevenue = revenue - mockSalesReturnsTotal;
  const costOfGoods = mockPurchaseBillsTotal - mockPurchaseReturnsTotal;
  const grossProfit = netRevenue - costOfGoods;
  const totalExpenses = mockExpenses?.reduce((s, e) => s + e?.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const pnlRows = [
    { label: 'Revenue (Sales)', value: revenue, indent: false, bold: false, color: 'text-foreground' },
    { label: 'Less: Sales Returns', value: -mockSalesReturnsTotal, indent: true, bold: false, color: 'text-danger' },
    { label: 'Net Revenue', value: netRevenue, indent: false, bold: true, color: 'text-foreground', divider: true },
    { label: 'Cost of Goods Sold', value: -costOfGoods, indent: false, bold: false, color: 'text-danger' },
    { label: 'Gross Profit', value: grossProfit, indent: false, bold: true, color: grossProfit >= 0 ? 'text-accent' : 'text-danger', divider: true },
    { label: 'Total Expenses', value: -totalExpenses, indent: false, bold: false, color: 'text-danger' },
    { label: 'Net Profit', value: netProfit, indent: false, bold: true, color: netProfit >= 0 ? 'text-accent' : 'text-danger', divider: true },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Profit & Loss</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Revenue, cost, and net profit summary</p>
        </div>

        <div className="bg-card rounded-xl border shadow-card p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-600 text-muted-foreground">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e?.target?.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-600 text-muted-foreground">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e?.target?.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-xs text-danger hover:underline">Clear</button>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className={`bg-card rounded-xl border shadow-card p-4 ${netProfit >= 0 ? 'border-l-4 border-l-accent' : 'border-l-4 border-l-danger'}`}>
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Net Profit</p>
            <p className={`text-2xl font-800 font-tabular ${netProfit >= 0 ? 'text-accent' : 'text-danger'}`}>{formatIndianCurrency(Math.abs(netProfit))}</p>
            <p className="text-xs text-muted-foreground mt-1">{netProfit >= 0 ? 'Profit' : 'Loss'}</p>
          </div>
          <div className="bg-card rounded-xl border shadow-card p-4">
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Gross Profit</p>
            <p className={`text-xl font-800 font-tabular ${grossProfit >= 0 ? 'text-accent' : 'text-danger'}`}>{formatIndianCurrency(grossProfit)}</p>
          </div>
          <div className="bg-card rounded-xl border shadow-card p-4">
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Total Expenses</p>
            <p className="text-xl font-800 text-danger font-tabular">{formatIndianCurrency(totalExpenses)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/20">
              <p className="text-sm font-700 text-foreground">P&L Statement</p>
            </div>
            <div className="p-4 space-y-2">
              {pnlRows?.map((row, i) => (
                <div key={i}>
                  {row?.divider && <div className="border-t my-2" />}
                  <div className={`flex items-center justify-between ${row?.indent ? 'pl-4' : ''}`}>
                    <span className={`text-sm ${row?.bold ? 'font-700 text-foreground' : 'text-muted-foreground'}`}>{row?.label}</span>
                    <span className={`text-sm font-tabular ${row?.bold ? 'font-800' : 'font-600'} ${row?.color}`}>
                      {row?.value < 0 ? `(${formatIndianCurrency(Math.abs(row?.value))})` : formatIndianCurrency(row?.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/20">
              <p className="text-sm font-700 text-foreground">Expense Breakdown</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40"><tr>
                  <th className="text-left px-4 py-2 text-xs font-600 text-muted-foreground">Category</th>
                  <th className="text-right px-4 py-2 text-xs font-600 text-muted-foreground">Amount</th>
                  <th className="text-right px-4 py-2 text-xs font-600 text-muted-foreground">% of Total</th>
                </tr></thead>
                <tbody>
                  {mockExpenses?.map((e) => (
                    <tr key={e?.category} className="border-t">
                      <td className="px-4 py-2 text-sm">{e?.category}</td>
                      <td className="px-4 py-2 text-right font-600 font-tabular text-danger">{formatIndianCurrency(e?.amount)}</td>
                      <td className="px-4 py-2 text-right text-xs text-muted-foreground font-tabular">{((e?.amount / totalExpenses) * 100)?.toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted/20 font-700">
                    <td className="px-4 py-2 text-sm font-800">Total</td>
                    <td className="px-4 py-2 text-right font-tabular text-danger">{formatIndianCurrency(totalExpenses)}</td>
                    <td className="px-4 py-2 text-right text-xs font-tabular">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
