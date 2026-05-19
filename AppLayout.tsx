'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Search, X, Trash2, Receipt } from 'lucide-react';
import { formatIndianCurrency, formatDate, todayISO } from '@/lib/formatters';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

type PayMethod = 'Cash' | 'UPI' | 'Bank';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  gstin: string;
  openingBalance: number;
}

const mockSuppliers: Supplier[] = [
  { id: 'sup-001', name: 'Agro Traders Pvt Ltd', phone: '9876500001', gstin: '29AAAAA0001A1Z5', openingBalance: 15000 },
  { id: 'sup-002', name: 'National Foods Distributor', phone: '9876500002', gstin: '07BBBBB0002B2Z6', openingBalance: 0 },
  { id: 'sup-003', name: 'Sunrise FMCG Wholesale', phone: '9876500003', gstin: '27CCCCC0003C3Z7', openingBalance: 8500 },
  { id: 'sup-004', name: 'Karnataka Oils & Fats', phone: '9876500004', gstin: '29DDDDD0004D4Z8', openingBalance: 0 },
];

interface PaymentOut {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  method: PayMethod;
  note: string;
  created_at: string;
}

const mockPaymentsOut: PaymentOut[] = [
  { id: 'po-001', date: '2026-05-17', supplierId: 'sup-001', supplierName: 'Agro Traders Pvt Ltd', amount: 12000, method: 'Bank', note: 'NEFT against PUR-0005', created_at: '2026-05-17T10:00:00Z' },
  { id: 'po-002', date: '2026-05-15', supplierId: 'sup-003', supplierName: 'Sunrise FMCG Wholesale', amount: 5500, method: 'Cash', note: '', created_at: '2026-05-15T14:00:00Z' },
  { id: 'po-003', date: '2026-05-13', supplierId: 'sup-002', supplierName: 'National Foods Distributor', amount: 8750, method: 'UPI', note: 'Advance payment', created_at: '2026-05-13T09:30:00Z' },
];

interface PaymentFormProps {
  onSave: (p: PaymentOut) => void;
  onClose: () => void;
}

function PaymentForm({ onSave, onClose }: PaymentFormProps) {
  const [date, setDate] = useState(todayISO());
  const [supplierId, setSupplierId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayMethod>('Cash');
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!supplierId) { toast.error('Please select a supplier'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Amount must be greater than 0'); return; }
    const supplier = mockSuppliers.find((s) => s.id === supplierId);
    onSave({
      id: `po-${Date.now()}`, date, supplierId,
      supplierName: supplier?.name ?? '', amount: amt, method, note,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-700 text-foreground">Record Payment-Out</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-1">Supplier *</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
              <option value="">Select supplier…</option>
              {mockSuppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Amount (₹) *</label>
              <input type="number" min={0.01} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-1">Payment Method *</label>
            <div className="flex gap-2">
              {(['Cash', 'UPI', 'Bank'] as PayMethod[]).map((m) => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`flex-1 py-2 text-sm font-600 rounded-lg border transition-all ${method === m ? 'bg-primary text-white border-primary' : 'hover:bg-muted border-border'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-1">Note</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note or bill reference…"
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
            <p className="text-xs text-warning font-600">⚠ Payment-Out cannot be edited after saving. Delete and re-enter to correct.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 transition-all">Save Payment</button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentOutPage() {
  const [payments, setPayments] = useState<PaymentOut[]>(mockPaymentsOut);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentOut | null>(null);

  const filtered = useMemo(() =>
    payments.filter((p) => {
      const q = search.toLowerCase();
      return p.supplierName.toLowerCase().includes(q) || p.note.toLowerCase().includes(q) || p.method.toLowerCase().includes(q);
    }), [payments, search]);

  const totalAmount = filtered.reduce((s, p) => s + p.amount, 0);

  const handleSave = (p: PaymentOut) => {
    setPayments((prev) => [p, ...prev]);
    toast.success(`Payment of ${formatIndianCurrency(p.amount)} to ${p.supplierName} recorded.`);
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setPayments((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success('Payment deleted.');
    setDeleteTarget(null);
  };

  const methodBg = (m: PayMethod) => m === 'Cash' ? 'bg-accent/10 text-accent' : m === 'UPI' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning';

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-700 text-foreground">Payment-Out</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} entries · {formatIndianCurrency(totalAmount)} total paid</p>
          </div>
          <button onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all">
            <Plus size={16} /> Record Payment
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['Cash', 'UPI', 'Bank'] as PayMethod[]).map((m) => {
            const total = payments.filter((p) => p.method === m).reduce((s, p) => s + p.amount, 0);
            const color = m === 'Cash' ? 'text-accent' : m === 'UPI' ? 'text-primary' : 'text-warning';
            return (
              <div key={m} className="bg-card rounded-xl border shadow-card p-3">
                <p className={`text-xs font-600 uppercase tracking-wide mb-1 ${color}`}>{m}</p>
                <p className="text-xl font-800 text-foreground font-tabular">{formatIndianCurrency(total)}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-card rounded-xl border shadow-card p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search supplier, method, note…" value={search}
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
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Supplier</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Amount</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Method</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Note</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6}>
                    <EmptyState icon={Receipt} title="No payments recorded" description="Record payments made to suppliers."
                      actionLabel="Record Payment" onAction={() => setFormOpen(true)} />
                  </td></tr>
                ) : filtered.map((p, i) => (
                  <tr key={p.id} className={`border-b last:border-b-0 row-hover transition-colors group ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(p.date)}</td>
                    <td className="px-4 py-3 text-xs font-500 text-foreground">{p.supplierName}</td>
                    <td className="px-4 py-3 text-right text-sm font-700 text-danger font-tabular">{formatIndianCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 ${methodBg(p.method)}`}>{p.method}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{p.note || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDeleteTarget(p)} title="Delete" className="p-1.5 rounded hover:bg-red-50 transition-colors"><Trash2 size={14} className="text-danger" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {formOpen && <PaymentForm onSave={handleSave} onClose={() => setFormOpen(false)} />}

        <ConfirmModal isOpen={!!deleteTarget} title="Delete Payment"
          message={`Delete payment of ${deleteTarget ? formatIndianCurrency(deleteTarget.amount) : ''} to ${deleteTarget?.supplierName}? This cannot be undone.`}
          confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      </div>
    </AppLayout>
  );
}
