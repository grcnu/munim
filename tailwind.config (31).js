'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Search, X, Trash2, FileQuestion, FileText } from 'lucide-react';
import { mockCustomers, mockProducts, GSTRate } from '@/lib/mockData';
import { formatIndianCurrency, formatDate, todayISO } from '@/lib/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

interface QuoteLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  discountPct: number;
  gstPct: GSTRate;
  lineTotal: number;
}

interface Quotation {
  id: string;
  quoteNumber: string;
  date: string;
  validUntil: string;
  customerId: string | null;
  customerName: string;
  lines: QuoteLine[];
  grandTotal: number;
  note: string;
  is_deleted: boolean;
  created_at: string;
}

function calcLineTotal(qty: number, rate: number, discPct: number, gstPct: number): number {
  return Math.round(qty * rate * (1 - discPct / 100) * (1 + gstPct / 100) * 100) / 100;
}

const today = todayISO();
const mockQuotations: Quotation[] = [
  {
    id: 'qt-001', quoteNumber: 'QT-0003', date: '2026-05-17', validUntil: '2026-05-31', customerId: 'cust-001', customerName: 'Ramesh Agarwal Traders',
    lines: [{ id: 'ql-001a', productId: 'prod-001', productName: 'Basmati Rice 5kg', quantity: 20, rate: 425, discountPct: 2, gstPct: 5, lineTotal: calcLineTotal(20, 425, 2, 5) }],
    grandTotal: calcLineTotal(20, 425, 2, 5), note: 'Bulk discount applied', is_deleted: false, created_at: '2026-05-17T09:00:00Z',
  },
  {
    id: 'qt-002', quoteNumber: 'QT-0002', date: '2026-05-10', validUntil: '2026-05-20', customerId: 'cust-004', customerName: 'Meena Cloth House',
    lines: [
      { id: 'ql-002a', productId: 'prod-006', productName: 'Sugar 1kg', quantity: 100, rate: 48, discountPct: 0, gstPct: 5, lineTotal: calcLineTotal(100, 48, 0, 5) },
      { id: 'ql-002b', productId: 'prod-010', productName: 'Tea Leaves 500g', quantity: 20, rate: 185, discountPct: 0, gstPct: 5, lineTotal: calcLineTotal(20, 185, 0, 5) },
    ],
    grandTotal: calcLineTotal(100, 48, 0, 5) + calcLineTotal(20, 185, 0, 5), note: '', is_deleted: false, created_at: '2026-05-10T11:00:00Z',
  },
  {
    id: 'qt-003', quoteNumber: 'QT-0001', date: '2026-04-25', validUntil: '2026-05-05', customerId: 'cust-002', customerName: 'Priya Enterprises',
    lines: [{ id: 'ql-003a', productId: 'prod-004', productName: 'Detergent Powder 1kg', quantity: 50, rate: 89, discountPct: 5, gstPct: 18, lineTotal: calcLineTotal(50, 89, 5, 18) }],
    grandTotal: calcLineTotal(50, 89, 5, 18), note: 'Price valid for 10 days', is_deleted: false, created_at: '2026-04-25T14:00:00Z',
  },
];

interface QuoteFormProps {
  quote: Quotation | null;
  onSave: (q: Quotation) => void;
  onClose: () => void;
  nextNumber: string;
}

function QuoteForm({ quote, onSave, onClose, nextNumber }: QuoteFormProps) {
  const [date, setDate] = useState(quote?.date ?? todayISO());
  const [validUntil, setValidUntil] = useState(quote?.validUntil ?? '');
  const [customerId, setCustomerId] = useState(quote?.customerId ?? '');
  const [customerName, setCustomerName] = useState(quote?.customerName ?? '');
  const [note, setNote] = useState(quote?.note ?? '');
  const [lines, setLines] = useState<QuoteLine[]>(quote?.lines ?? []);

  const addLine = () => {
    const p = mockProducts[0];
    setLines((prev) => [...prev, {
      id: `ql-${Date.now()}`, productId: p.id, productName: p.name,
      quantity: 1, rate: p.salePrice, discountPct: p.defaultDiscount, gstPct: p.gstRate,
      lineTotal: calcLineTotal(1, p.salePrice, p.defaultDiscount, p.gstRate),
    }]);
  };

  const updateLine = (id: string, field: keyof QuoteLine, value: string | number) => {
    setLines((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      if (field === 'productId') {
        const p = mockProducts.find((p) => p.id === value);
        if (p) { updated.productName = p.name; updated.rate = p.salePrice; updated.gstPct = p.gstRate; updated.discountPct = p.defaultDiscount; }
      }
      updated.lineTotal = calcLineTotal(updated.quantity, updated.rate, updated.discountPct, updated.gstPct);
      return updated;
    }));
  };

  const grandTotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  const handleSave = () => {
    if (!date || !validUntil) { toast.error('Date and Valid Until are required'); return; }
    if (validUntil < date) { toast.error('Valid Until must be on or after Date'); return; }
    if (lines.length === 0) { toast.error('Add at least one item'); return; }
    onSave({
      id: quote?.id ?? `qt-${Date.now()}`, quoteNumber: quote?.quoteNumber ?? nextNumber,
      date, validUntil, customerId: customerId || null, customerName: customerName || 'Walk-in Customer',
      lines, grandTotal, note, is_deleted: false, created_at: quote?.created_at ?? new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl border flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-700 text-foreground">{quote ? `Edit ${quote.quoteNumber}` : `New Quotation — ${nextNumber}`}</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4 flex-1">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Valid Until *</label>
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Customer</label>
              <select value={customerId} onChange={(e) => { setCustomerId(e.target.value); setCustomerName(mockCustomers.find((c) => c.id === e.target.value)?.name ?? ''); }}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option value="">Walk-in</option>
                {mockCustomers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-600 text-muted-foreground">Items *</label>
              <button onClick={addLine} className="flex items-center gap-1 text-xs font-600 text-primary hover:underline"><Plus size={12} /> Add Item</button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/40"><tr>
                  <th className="text-left px-3 py-2 font-600 text-muted-foreground">Product</th>
                  <th className="text-right px-3 py-2 font-600 text-muted-foreground w-20">Qty</th>
                  <th className="text-right px-3 py-2 font-600 text-muted-foreground w-24">Rate</th>
                  <th className="text-right px-3 py-2 font-600 text-muted-foreground w-20">Disc%</th>
                  <th className="text-right px-3 py-2 font-600 text-muted-foreground w-20">GST%</th>
                  <th className="text-right px-3 py-2 font-600 text-muted-foreground w-28">Total</th>
                  <th className="w-8"></th>
                </tr></thead>
                <tbody>
                  {lines.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-6 text-muted-foreground text-xs">No items added yet</td></tr>
                  ) : lines.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="px-3 py-2">
                        <select value={l.productId} onChange={(e) => updateLine(l.id, 'productId', e.target.value)}
                          className="w-full text-xs border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                          {mockProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2"><input type="number" min={1} value={l.quantity} onChange={(e) => updateLine(l.id, 'quantity', Number(e.target.value))} className="w-full text-xs border rounded px-2 py-1 text-right bg-background focus:outline-none focus:ring-1 focus:ring-primary" /></td>
                      <td className="px-3 py-2"><input type="number" min={0} value={l.rate} onChange={(e) => updateLine(l.id, 'rate', Number(e.target.value))} className="w-full text-xs border rounded px-2 py-1 text-right bg-background focus:outline-none focus:ring-1 focus:ring-primary" /></td>
                      <td className="px-3 py-2"><input type="number" min={0} max={100} value={l.discountPct} onChange={(e) => updateLine(l.id, 'discountPct', Number(e.target.value))} className="w-full text-xs border rounded px-2 py-1 text-right bg-background focus:outline-none focus:ring-1 focus:ring-primary" /></td>
                      <td className="px-3 py-2">
                        <select value={l.gstPct} onChange={(e) => updateLine(l.id, 'gstPct', Number(e.target.value) as GSTRate)} className="w-full text-xs border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                          {[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right font-600 font-tabular">{formatIndianCurrency(l.lineTotal)}</td>
                      <td className="px-3 py-2"><button onClick={() => setLines((prev) => prev.filter((x) => x.id !== l.id))} className="p-1 hover:bg-red-50 rounded transition-colors"><X size={12} className="text-danger" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {lines.length > 0 && (
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Grand Total</p>
                <p className="text-xl font-800 text-foreground font-tabular">{formatIndianCurrency(grandTotal)}</p>
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-1">Note</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note…"
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 transition-all">{quote ? 'Update' : 'Save Quotation'}</button>
        </div>
      </div>
    </div>
  );
}

export default function QuotationPage() {
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Quotation | null>(null);

  const filtered = useMemo(() =>
    quotations.filter((q) => !q.is_deleted).filter((q) => {
      const s = search.toLowerCase();
      return q.quoteNumber.toLowerCase().includes(s) || q.customerName.toLowerCase().includes(s);
    }), [quotations, search]);

  const nextNumber = `QT-${String(quotations.filter((q) => !q.is_deleted).length + 1).padStart(4, '0')}`;

  const isExpired = (q: Quotation) => q.validUntil < today;

  const handleSave = (q: Quotation) => {
    const exists = quotations.find((x) => x.id === q.id);
    if (exists) {
      setQuotations((prev) => prev.map((x) => x.id === q.id ? q : x));
      toast.success(`${q.quoteNumber} updated.`);
    } else {
      setQuotations((prev) => [q, ...prev]);
      toast.success(`${q.quoteNumber} saved.`);
    }
    setFormOpen(false);
    setEditingQuote(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setQuotations((prev) => prev.map((q) => q.id === deleteTarget.id ? { ...q, is_deleted: true } : q));
    toast.success(`${deleteTarget.quoteNumber} deleted.`);
    setDeleteTarget(null);
  };

  const handleConvert = (q: Quotation) => {
    toast.success(`${q.quoteNumber} items copied to new invoice. Open Sale Invoice to complete.`);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-700 text-foreground">Quotations</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} quotations · Does not affect stock or balances</p>
          </div>
          <button onClick={() => { setEditingQuote(null); setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all">
            <Plus size={16} /> New Quotation
          </button>
        </div>

        <div className="bg-card rounded-xl border shadow-card p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search quotation number or customer…" value={search}
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
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Quote #</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Valid Until</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Customer</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Items</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8}>
                    <EmptyState icon={FileQuestion} title="No quotations" description="Create price quotations for customers before confirming a sale."
                      actionLabel="New Quotation" onAction={() => { setEditingQuote(null); setFormOpen(true); }} />
                  </td></tr>
                ) : filtered.map((q, i) => (
                  <tr key={q.id} className={`border-b last:border-b-0 row-hover transition-colors group ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                    <td className="px-4 py-3 font-700 text-primary text-xs font-mono">{q.quoteNumber}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(q.date)}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <span className={isExpired(q) ? 'text-danger' : 'text-muted-foreground'}>{formatDate(q.validUntil)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-500 text-foreground">{q.customerName}</td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground font-tabular">{q.lines.length}</td>
                    <td className="px-4 py-3 text-right text-sm font-700 text-foreground font-tabular">{formatIndianCurrency(q.grandTotal)}</td>
                    <td className="px-4 py-3 text-center">
                      {isExpired(q) ? <StatusBadge status="expired" /> : <StatusBadge status="active" label="Active" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingQuote(q); setFormOpen(true); }} title="Edit" className="p-1.5 rounded hover:bg-muted transition-colors"><FileQuestion size={14} className="text-muted-foreground" /></button>
                        <button onClick={() => handleConvert(q)} title="Convert to Invoice" className="p-1.5 rounded hover:bg-green-50 transition-colors"><FileText size={14} className="text-accent" /></button>
                        <button onClick={() => setDeleteTarget(q)} title="Delete" className="p-1.5 rounded hover:bg-red-50 transition-colors"><Trash2 size={14} className="text-danger" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {formOpen && <QuoteForm quote={editingQuote} onSave={handleSave} onClose={() => { setFormOpen(false); setEditingQuote(null); }} nextNumber={nextNumber} />}

        <ConfirmModal isOpen={!!deleteTarget} title="Delete Quotation"
          message={`Delete ${deleteTarget?.quoteNumber}? This cannot be undone.`}
          confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      </div>
    </AppLayout>
  );
}
