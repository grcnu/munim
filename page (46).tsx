'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Search, X, Trash2, RotateCcw } from 'lucide-react';
import { mockInvoices } from '@/lib/mockData';
import { formatIndianCurrency, formatDate, todayISO } from '@/lib/formatters';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

interface ReturnLine {
  invoiceLineId: string;
  productName: string;
  originalQty: number;
  returnQty: number;
  rate: number;
  gstPct: number;
  lineTotal: number;
}

interface SalesReturn {
  id: string;
  returnNumber: string;
  date: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  lines: ReturnLine[];
  totalAmount: number;
  created_at: string;
}

const mockSalesReturns: SalesReturn[] = [
  {
    id: 'sr-001', returnNumber: 'SR-0002', date: '2026-05-17', invoiceId: 'inv-002', invoiceNumber: 'INV-0042', customerName: 'Priya Enterprises',
    lines: [{ invoiceLineId: 'il-002a', productName: 'Detergent Powder 1kg', originalQty: 20, returnQty: 5, rate: 89, gstPct: 18, lineTotal: 525.25 }],
    totalAmount: 525.25, created_at: '2026-05-17T14:00:00Z',
  },
  {
    id: 'sr-002', returnNumber: 'SR-0001', date: '2026-05-15', invoiceId: 'inv-005', invoiceNumber: 'INV-0039', customerName: 'Vijay Medical Store',
    lines: [{ invoiceLineId: 'il-005b', productName: 'Shampoo 400ml', originalQty: 12, returnQty: 2, gstPct: 18, rate: 285, lineTotal: 673.3 }],
    totalAmount: 673.3, created_at: '2026-05-15T16:00:00Z',
  },
];

interface ReturnFormProps {
  onSave: (r: SalesReturn) => void;
  onClose: () => void;
  nextNumber: string;
}

function ReturnForm({ onSave, onClose, nextNumber }: ReturnFormProps) {
  const [date, setDate] = useState(todayISO());
  const [invoiceId, setInvoiceId] = useState('');
  const [lines, setLines] = useState<ReturnLine[]>([]);

  const selectedInvoice = mockInvoices.find((i) => i.id === invoiceId);

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const inv = mockInvoices.find((i) => i.id === id);
    if (inv) {
      setLines(inv.lines.map((l) => ({
        invoiceLineId: l.id, productName: l.productName, originalQty: l.quantity,
        returnQty: 0, rate: l.rate, gstPct: l.gstPct,
        lineTotal: 0,
      })));
    }
  };

  const updateReturnQty = (lineId: string, qty: number) => {
    setLines((prev) => prev.map((l) => {
      if (l.invoiceLineId !== lineId) return l;
      const clamped = Math.min(Math.max(0, qty), l.originalQty);
      const lineTotal = Math.round(clamped * l.rate * (1 + l.gstPct / 100) * 100) / 100;
      return { ...l, returnQty: clamped, lineTotal };
    }));
  };

  const totalAmount = lines.reduce((s, l) => s + l.lineTotal, 0);

  const handleSave = () => {
    if (!invoiceId) { toast.error('Select an invoice'); return; }
    const activeLines = lines.filter((l) => l.returnQty > 0);
    if (activeLines.length === 0) { toast.error('Enter return quantity for at least one item'); return; }
    onSave({
      id: `sr-${Date.now()}`, returnNumber: nextNumber, date,
      invoiceId, invoiceNumber: selectedInvoice?.invoiceNumber ?? '',
      customerName: selectedInvoice?.customerName ?? '',
      lines: activeLines, totalAmount, created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl border flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-700 text-foreground">New Sales Return — {nextNumber}</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Original Invoice *</label>
              <select value={invoiceId} onChange={(e) => handleInvoiceChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option value="">Select invoice…</option>
                {mockInvoices.map((i) => <option key={i.id} value={i.id}>{i.invoiceNumber} — {i.customerName}</option>)}
              </select>
            </div>
          </div>

          {lines.length > 0 && (
            <div>
              <p className="text-xs font-600 text-muted-foreground mb-2">Return Quantities</p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40"><tr>
                    <th className="text-left px-3 py-2 font-600 text-muted-foreground">Product</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground">Sold Qty</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground w-24">Return Qty</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground">Amount</th>
                  </tr></thead>
                  <tbody>
                    {lines.map((l) => (
                      <tr key={l.invoiceLineId} className="border-t">
                        <td className="px-3 py-2">{l.productName}</td>
                        <td className="px-3 py-2 text-right font-tabular text-muted-foreground">{l.originalQty}</td>
                        <td className="px-3 py-2">
                          <input type="number" min={0} max={l.originalQty} value={l.returnQty}
                            onChange={(e) => updateReturnQty(l.invoiceLineId, Number(e.target.value))}
                            className="w-full text-xs border rounded px-2 py-1 text-right bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                        </td>
                        <td className="px-3 py-2 text-right font-600 font-tabular">{l.returnQty > 0 ? formatIndianCurrency(l.lineTotal) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalAmount > 0 && (
                <div className="flex justify-end mt-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Return Amount</p>
                    <p className="text-xl font-800 text-danger font-tabular">{formatIndianCurrency(totalAmount)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
            <p className="text-xs text-warning font-600">⚠ Sales returns cannot be edited after saving. Delete and re-enter to correct.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 transition-all">Save Return</button>
        </div>
      </div>
    </div>
  );
}

export default function SalesReturnPage() {
  const [returns, setReturns] = useState<SalesReturn[]>(mockSalesReturns);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SalesReturn | null>(null);

  const filtered = useMemo(() =>
    returns.filter((r) => {
      const q = search.toLowerCase();
      return r.returnNumber.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q) || r.invoiceNumber.toLowerCase().includes(q);
    }), [returns, search]);

  const nextNumber = `SR-${String(returns.length + 1).padStart(4, '0')}`;

  const handleSave = (r: SalesReturn) => {
    setReturns((prev) => [r, ...prev]);
    toast.success(`${r.returnNumber} saved. Stock updated.`);
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setReturns((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    toast.success(`${deleteTarget.returnNumber} deleted. Stock reversed.`);
    setDeleteTarget(null);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-700 text-foreground">Sales Returns</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} returns · Stock is restored on return</p>
          </div>
          <button onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all">
            <Plus size={16} /> New Return
          </button>
        </div>

        <div className="bg-card rounded-xl border shadow-card p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search return number, invoice, or customer…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"><X size={12} className="text-muted-foreground" /></button>}
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Return #</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Invoice #</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Customer</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Items</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Return Amount</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}>
                    <EmptyState icon={RotateCcw} title="No sales returns" description="Record goods returned by customers from previous invoices."
                      actionLabel="New Return" onAction={() => setFormOpen(true)} />
                  </td></tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.id} className={`border-b last:border-b-0 row-hover transition-colors group ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                    <td className="px-4 py-3 font-700 text-primary text-xs font-mono">{r.returnNumber}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.invoiceNumber}</td>
                    <td className="px-4 py-3 text-xs font-500 text-foreground">{r.customerName}</td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground font-tabular">{r.lines.length}</td>
                    <td className="px-4 py-3 text-right text-sm font-700 text-danger font-tabular">{formatIndianCurrency(r.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDeleteTarget(r)} title="Delete" className="p-1.5 rounded hover:bg-red-50 transition-colors"><Trash2 size={14} className="text-danger" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {formOpen && <ReturnForm onSave={handleSave} onClose={() => setFormOpen(false)} nextNumber={nextNumber} />}

        <ConfirmModal isOpen={!!deleteTarget} title="Delete Sales Return"
          message={`Delete ${deleteTarget?.returnNumber}? Stock will be reversed. This cannot be undone.`}
          confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      </div>
    </AppLayout>
  );
}
