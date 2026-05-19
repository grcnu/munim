'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';

import { mockInvoices } from '@/lib/mockData';
import { formatIndianCurrency } from '@/lib/formatters';

const GST_RATES = [0, 5, 12, 18, 28];

export default function GSTSummaryPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const summary = useMemo(() => {
    const filtered = mockInvoices.filter((inv) => !inv.is_deleted).filter((inv) => {
      if (dateFrom && inv.date < dateFrom) return false;
      if (dateTo && inv.date > dateTo) return false;
      return true;
    });

    const result: Record<number, { taxable: number; gst: number; total: number }> = {};
    GST_RATES.forEach((r) => { result[r] = { taxable: 0, gst: 0, total: 0 }; });

    filtered.forEach((inv) => {
      inv.lines.forEach((l) => {
        result[l.gstPct].taxable += l.taxableAmount;
        result[l.gstPct].gst += l.gstAmount;
        result[l.gstPct].total += l.lineTotal;
      });
    });

    return result;
  }, [dateFrom, dateTo]);

  const grandTaxable = Object.values(summary).reduce((s, r) => s + r.taxable, 0);
  const grandGST = Object.values(summary).reduce((s, r) => s + r.gst, 0);
  const grandTotal = Object.values(summary).reduce((s, r) => s + r.total, 0);

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-700 text-foreground">GST Summary</h1>
          <p className="text-sm text-muted-foreground mt-0.5">GST collected on sales invoices grouped by rate</p>
        </div>

        <div className="bg-card rounded-xl border shadow-card p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-600 text-muted-foreground">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-600 text-muted-foreground">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-xs text-danger hover:underline">Clear</button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border shadow-card p-4">
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Taxable Amount</p>
            <p className="text-xl font-800 text-foreground font-tabular">{formatIndianCurrency(grandTaxable)}</p>
          </div>
          <div className="bg-card rounded-xl border shadow-card p-4">
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Total GST</p>
            <p className="text-xl font-800 text-primary font-tabular">{formatIndianCurrency(grandGST)}</p>
          </div>
          <div className="bg-card rounded-xl border shadow-card p-4">
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Invoice Total</p>
            <p className="text-xl font-800 text-foreground font-tabular">{formatIndianCurrency(grandTotal)}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/20">
            <p className="text-sm font-700 text-foreground">GST Rate-wise Breakup</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">GST Rate</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Taxable Amount</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">CGST (50%)</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">SGST (50%)</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Total GST</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {GST_RATES.map((rate) => {
                  const row = summary[rate];
                  const cgst = row.gst / 2;
                  const sgst = row.gst / 2;
                  return (
                    <tr key={rate} className={`border-b last:border-b-0 ${row.taxable === 0 ? 'opacity-40' : ''}`}>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-700 bg-primary/10 text-primary">{rate}%</span>
                      </td>
                      <td className="px-4 py-3 text-right font-tabular text-sm">{formatIndianCurrency(row.taxable)}</td>
                      <td className="px-4 py-3 text-right font-tabular text-xs text-muted-foreground">{formatIndianCurrency(cgst)}</td>
                      <td className="px-4 py-3 text-right font-tabular text-xs text-muted-foreground">{formatIndianCurrency(sgst)}</td>
                      <td className="px-4 py-3 text-right font-700 font-tabular text-primary">{formatIndianCurrency(row.gst)}</td>
                      <td className="px-4 py-3 text-right font-700 font-tabular">{formatIndianCurrency(row.total)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-muted/30 font-700">
                  <td className="px-4 py-3 text-sm font-800">TOTAL</td>
                  <td className="px-4 py-3 text-right font-tabular text-sm">{formatIndianCurrency(grandTaxable)}</td>
                  <td className="px-4 py-3 text-right font-tabular text-xs">{formatIndianCurrency(grandGST / 2)}</td>
                  <td className="px-4 py-3 text-right font-tabular text-xs">{formatIndianCurrency(grandGST / 2)}</td>
                  <td className="px-4 py-3 text-right font-tabular text-primary">{formatIndianCurrency(grandGST)}</td>
                  <td className="px-4 py-3 text-right font-tabular">{formatIndianCurrency(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
