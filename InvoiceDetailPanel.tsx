'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Search, X, Package } from 'lucide-react';
import { mockProducts, computeStockForProduct, getStockStatus } from '@/lib/mockData';
import { formatIndianCurrency, formatDate } from '@/lib/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

interface StockMovement {
  date: string;
  type: 'Opening' | 'Purchase' | 'Sale' | 'Adjustment';
  reference: string;
  party: string;
  qtyIn: number;
  qtyOut: number;
  balance: number;
  note: string;
}

const mockMovements: Record<string, StockMovement[]> = {
  'prod-001': [
    { date: '2026-01-15', type: 'Opening', reference: 'Opening Stock', party: '', qtyIn: 50, qtyOut: 0, balance: 50, note: '' },
    { date: '2026-05-10', type: 'Purchase', reference: 'PUR-0003', party: 'Agro Traders Pvt Ltd', qtyIn: 30, qtyOut: 0, balance: 80, note: '' },
    { date: '2026-05-13', type: 'Sale', reference: 'INV-0035', party: 'Ramesh Agarwal Traders', qtyIn: 0, qtyOut: 20, balance: 60, note: '' },
    { date: '2026-05-17', type: 'Sale', reference: 'INV-0043', party: 'Ramesh Agarwal Traders', qtyIn: 0, qtyOut: 10, balance: 50, note: '' },
    { date: '2026-05-17', type: 'Adjustment', reference: 'ADJ-001', party: '', qtyIn: 0, qtyOut: 42, balance: 8, note: 'Count correction' },
  ],
};

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const withStock = useMemo(() =>
    mockProducts.filter((p) => !p.is_deleted).map((p) => ({
      ...p,
      currentStock: computeStockForProduct(p.id, p.openingStock),
      stockStatus: getStockStatus(computeStockForProduct(p.id, p.openingStock)),
    })), []);

  const categories = ['All', ...Array.from(new Set(withStock.map((p) => p.category)))];

  const filtered = useMemo(() =>
    withStock.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || p.qr.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      const matchStock = stockFilter === 'All' || p.stockStatus === stockFilter;
      return matchSearch && matchCat && matchStock;
    }), [withStock, search, categoryFilter, stockFilter]);

  const selectedProduct = withStock.find((p) => p.id === selectedProductId);
  const movements = selectedProductId ? (mockMovements[selectedProductId] ?? []) : [];

  const stockVariant = (s: string) => s === 'Available' ? 'available' as const : s === 'Low Stock' ? 'low' as const : 'out' as const;

  const totalInventoryValue = withStock.reduce((s, p) => s + p.currentStock * p.purchasePrice, 0);

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-700 text-foreground">Inventory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{withStock.length} products · Value: {formatIndianCurrency(totalInventoryValue)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Available', count: withStock.filter((p) => p.stockStatus === 'Available').length, color: 'text-accent' },
            { label: 'Low Stock', count: withStock.filter((p) => p.stockStatus === 'Low Stock').length, color: 'text-warning' },
            { label: 'Out of Stock', count: withStock.filter((p) => p.stockStatus === 'Out of Stock').length, color: 'text-danger' },
          ].map(({ label, count, color }) => (
            <div key={label} className="bg-card rounded-xl border shadow-card p-3">
              <p className={`text-xs font-600 uppercase tracking-wide mb-1 ${color}`}>{label}</p>
              <p className={`text-2xl font-800 font-tabular ${color}`}>{count}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border shadow-card p-3 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search by name, QR, category…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"><X size={12} className="text-muted-foreground" /></button>}
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            {categories.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            {['All', 'Available', 'Low Stock', 'Out of Stock'].map((s) => <option key={s} value={s}>{s === 'All' ? 'All Stock Status' : s}</option>)}
          </select>
        </div>

        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">QR Code</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Current Stock</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Sale Price</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">GST%</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">History</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState icon={Package} title="No products found" description="No products match your current filters." /></td></tr>
                ) : filtered.map((p, i) => (
                  <tr key={p.id} className={`border-b last:border-b-0 row-hover transition-colors ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="text-xs font-600 text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.qr}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-800 font-tabular ${p.currentStock <= 0 ? 'text-danger' : p.currentStock <= 5 ? 'text-warning' : 'text-foreground'}`}>{p.currentStock}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-600 font-tabular">{formatIndianCurrency(p.salePrice)}</td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground">{p.gstRate}%</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={stockVariant(p.stockStatus)} /></td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setSelectedProductId(selectedProductId === p.id ? null : p.id)}
                        className={`px-2.5 py-1 text-xs font-600 rounded-lg border transition-colors ${selectedProductId === p.id ? 'bg-primary text-white border-primary' : 'hover:bg-muted border-border'}`}>
                        History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedProduct && (
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
              <div>
                <p className="text-sm font-700 text-foreground">Stock History — {selectedProduct.name}</p>
                <p className="text-xs text-muted-foreground">Current Stock: <span className="font-700">{selectedProduct.currentStock}</span></p>
              </div>
              <button onClick={() => setSelectedProductId(null)} className="p-1.5 rounded hover:bg-muted transition-colors"><X size={14} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/40"><tr>
                  <th className="text-left px-4 py-2 font-600 text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-2 font-600 text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-2 font-600 text-muted-foreground">Reference</th>
                  <th className="text-left px-4 py-2 font-600 text-muted-foreground">Party</th>
                  <th className="text-right px-4 py-2 font-600 text-accent">In</th>
                  <th className="text-right px-4 py-2 font-600 text-danger">Out</th>
                  <th className="text-right px-4 py-2 font-600 text-muted-foreground">Balance</th>
                  <th className="text-left px-4 py-2 font-600 text-muted-foreground">Note</th>
                </tr></thead>
                <tbody>
                  {movements.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-6 text-muted-foreground">No movement history available</td></tr>
                  ) : movements.map((m, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{formatDate(m.date)}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-600 ${m.type === 'Purchase' ? 'bg-accent/10 text-accent' : m.type === 'Sale' ? 'bg-danger/10 text-danger' : m.type === 'Adjustment' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>{m.type}</span>
                      </td>
                      <td className="px-4 py-2 font-mono text-muted-foreground">{m.reference}</td>
                      <td className="px-4 py-2 text-muted-foreground">{m.party || '—'}</td>
                      <td className="px-4 py-2 text-right font-600 text-accent font-tabular">{m.qtyIn > 0 ? `+${m.qtyIn}` : '—'}</td>
                      <td className="px-4 py-2 text-right font-600 text-danger font-tabular">{m.qtyOut > 0 ? `-${m.qtyOut}` : '—'}</td>
                      <td className="px-4 py-2 text-right font-700 font-tabular">{m.balance}</td>
                      <td className="px-4 py-2 text-muted-foreground">{m.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
