'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { formatIndianCurrency } from '@/lib/formatters';
import { mockProducts, computeStockForProduct } from '@/lib/mockData';

const cashBalance = 24350.00;
const upiBalance = 12890.50;
const bankBalance = 87420.75;
const totalCustomerReceivables = 29121.00;
const totalSupplierPayables = 23500.00;

const inventoryValue = mockProducts.filter((p) => !p.is_deleted).reduce((s, p) => {
  const stock = computeStockForProduct(p.id, p.openingStock);
  return s + stock * p.purchasePrice;
}, 0);

const totalAssets = cashBalance + upiBalance + bankBalance + inventoryValue + totalCustomerReceivables;
const totalLiabilities = totalSupplierPayables;
const netWorth = totalAssets - totalLiabilities;

interface BSRowProps {
  label: string;
  value: number;
  indent?: boolean;
  bold?: boolean;
  color?: string;
}

function BSRow({ label, value, indent = false, bold = false, color = 'text-foreground' }: BSRowProps) {
  return (
    <div className={`flex items-center justify-between py-2 ${indent ? 'pl-4' : ''}`}>
      <span className={`text-sm ${bold ? 'font-700 text-foreground' : 'text-muted-foreground'}`}>{label}</span>
      <span className={`text-sm font-tabular ${bold ? 'font-800' : 'font-600'} ${color}`}>{formatIndianCurrency(value)}</span>
    </div>
  );
}

export default function BalanceSheetPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Balance Sheet</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Assets, liabilities and net worth as of today</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border shadow-card p-4 border-l-4 border-l-accent">
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Total Assets</p>
            <p className="text-xl font-800 text-accent font-tabular">{formatIndianCurrency(totalAssets)}</p>
          </div>
          <div className="bg-card rounded-xl border shadow-card p-4 border-l-4 border-l-danger">
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Total Liabilities</p>
            <p className="text-xl font-800 text-danger font-tabular">{formatIndianCurrency(totalLiabilities)}</p>
          </div>
          <div className={`bg-card rounded-xl border shadow-card p-4 border-l-4 ${netWorth >= 0 ? 'border-l-primary' : 'border-l-danger'}`}>
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Net Worth</p>
            <p className={`text-xl font-800 font-tabular ${netWorth >= 0 ? 'text-primary' : 'text-danger'}`}>{formatIndianCurrency(netWorth)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Assets */}
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b bg-accent/5">
              <p className="text-sm font-700 text-accent">ASSETS</p>
            </div>
            <div className="p-4 divide-y">
              <div className="pb-3">
                <p className="text-xs font-700 text-muted-foreground uppercase tracking-wide mb-2">Current Assets</p>
                <BSRow label="Cash Balance" value={cashBalance} indent />
                <BSRow label="UPI Balance" value={upiBalance} indent />
                <BSRow label="Bank Balance" value={bankBalance} indent />
                <BSRow label="Customer Receivables" value={totalCustomerReceivables} indent />
                <BSRow label="Inventory Value" value={inventoryValue} indent />
              </div>
              <div className="pt-3">
                <BSRow label="TOTAL ASSETS" value={totalAssets} bold color="text-accent" />
              </div>
            </div>
          </div>

          {/* Liabilities + Net Worth */}
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b bg-danger/5">
              <p className="text-sm font-700 text-danger">LIABILITIES & NET WORTH</p>
            </div>
            <div className="p-4 divide-y">
              <div className="pb-3">
                <p className="text-xs font-700 text-muted-foreground uppercase tracking-wide mb-2">Current Liabilities</p>
                <BSRow label="Supplier Payables" value={totalSupplierPayables} indent />
              </div>
              <div className="py-3">
                <BSRow label="TOTAL LIABILITIES" value={totalLiabilities} bold color="text-danger" />
              </div>
              <div className="pt-3">
                <p className="text-xs font-700 text-muted-foreground uppercase tracking-wide mb-2">Equity</p>
                <BSRow label="Net Worth (Assets − Liabilities)" value={netWorth} bold color={netWorth >= 0 ? 'text-primary' : 'text-danger'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
