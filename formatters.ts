'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Search, X, Edit2, Trash2, Package } from 'lucide-react';
import { mockProducts, GSTRate } from '@/lib/mockData';
import { formatIndianCurrency, formatDate, todayISO } from '@/lib/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

type PaymentStatus = 'Paid' | 'Partial' | 'Pending';
type PayMethod = 'Cash' | 'UPI' | 'Bank';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  gstin: string;
}

const mockSuppliers: Supplier[] = [
  { id: 'sup-001', name: 'Agro Traders Pvt Ltd', phone: '9876500001', gstin: '29AAAAA0001A1Z5' },
  { id: 'sup-002', name: 'National Foods Distributor', phone: '9876500002', gstin: '07BBBBB0002B2Z6' },
  { id: 'sup-003', name: 'Sunrise FMCG Wholesale', phone: '9876500003', gstin: '27CCCCC0003C3Z7' },
  { id: 'sup-004', name: 'Karnataka Oils & Fats', phone: '9876500004', gstin: '29DDDDD0004D4Z8' },
];

interface BillLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  purchaseRate: number;
  gstPct: GSTRate;
  lineTotal: number;
}

interface PurchaseBill {
  id: string;
  billNumber: string;
  date: string;
  supplierId: string | null;
  supplierName: string;
  lines: BillLine[];
  grandTotal: number;
  cashPaid: number;
  upiPaid: number;
  bankPaid: number;
  balanceDue: number;
  status: PaymentStatus;
  is_deleted: boolean;
  created_at: string;
}

function calcLineTotal(qty: number, rate: number, gstPct: number): number {
  return Math.round(qty * rate * (1 + gstPct / 100) * 100) / 100;
}

const mockPurchaseBills: PurchaseBill[] = [
  {
    id: 'pur-001', billNumber: 'PUR-0005', date: '2026-05-16', supplierId: 'sup-001', supplierName: 'Agro Traders Pvt Ltd',
    lines: [
      { id: 'bl-001a', productId: 'prod-001', productName: 'Basmati Rice 5kg', quantity: 30, purchaseRate: 310, gstPct: 5, lineTotal: calcLineTotal(30, 310, 5) },
      { id: 'bl-001b', productId: 'prod-002', productName: 'Toor Dal 1kg', quantity: 100, purchaseRate: 112, gstPct: 5, lineTotal: calcLineTotal(100, 112, 5) },
    ],
    grandTotal: 21490, cashPaid: 10000, upiPaid: 0, bankPaid: 0, balanceDue: 11490, status: 'Partial', is_deleted: false, created_at: '2026-05-16T10:00:00Z',
  },
  {
    id: 'pur-002', billNumber: 'PUR-0004', date: '2026-05-14', supplierId: 'sup-003', supplierName: 'Sunrise FMCG Wholesale',
    lines: [
      { id: 'bl-002a', productId: 'prod-004', productName: 'Detergent Powder 1kg', quantity: 200, purchaseRate: 62, gstPct: 18, lineTotal: calcLineTotal(200, 62, 18) },
      { id: 'bl-002b', productId: 'prod-007', productName: 'Soap Bar Pack (4)', quantity: 50, purchaseRate: 78, gstPct: 18, lineTotal: calcLineTotal(50, 78, 18) },
    ],
    grandTotal: 19234, cashPaid: 19234, upiPaid: 0, bankPaid: 0, balanceDue: 0, status: 'Paid', is_deleted: false, created_at: '2026-05-14T11:00:00Z',
  },
  {
    id: 'pur-003', billNumber: 'PUR-0003', date: '2026-05-10', supplierId: 'sup-002', supplierName: 'National Foods Distributor',
    lines: [
      { id: 'bl-003a', productId: 'prod-005', productName: 'Atta 10kg', quantity: 20, purchaseRate: 290, gstPct: 0, lineTotal: calcLineTotal(20, 290, 0) },
      { id: 'bl-003b', productId: 'prod-006', productName: 'Sugar 1kg', quantity: 300, purchaseRate: 36, gstPct: 5, lineTotal: calcLineTotal(300, 36, 5) },
    ],
    grandTotal: 17140, cashPaid: 0, upiPaid: 0, bankPaid: 0, balanceDue: 17140, status: 'Pending', is_deleted: false, created_at: '2026-05-10T09:00:00Z',
  },
];

interface BillFormProps {
  bill: PurchaseBill | null;
  onSave: (b: PurchaseBill) => void;
  onClose: () => void;
  nextNumber: string;
}

function BillForm({ bill, onSave, onClose, nextNumber }: BillFormProps) {
  const [date, setDate] = useState(bill?.date ?? todayISO());
  const [supplierId, setSupplierId] = useState(bill?.supplierId ?? '');
  const [supplierName, setSupplierName] = useState(bill?.supplierName ?? '');
  const [lines, setLines] = useState<BillLine[]>(bill?.lines ?? []);
  const [cashPaid, setCashPaid] = useState(bill?.cashPaid ?? 0);
  const [upiPaid, setUpiPaid] = useState(bill?.upiPaid ?? 0);
  const [bankPaid, setBankPaid] = useState(bill?.bankPaid ?? 0);

  const grandTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const totalPaid = cashPaid + upiPaid + bankPaid;
  const balanceDue = Math.max(0, grandTotal - totalPaid);
  const status: PaymentStatus = balanceDue <= 0 ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Pending';

  const addLine = () => {
    const p = mockProducts[0];
    setLines((prev) => [...prev, {
      id: `bl-${Date.now()}`, productId: p.id, productName: p.name,
      quantity: 1, purchaseRate: p.purchasePrice, gstPct: p.gstRate,
      lineTotal: calcLineTotal(1, p.purchasePrice, p.gstRate),
    }]);
  };

  const updateLine = (id: string, field: keyof BillLine, value: string | number) => {
    setLines((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      if (field === 'productId') {
        const p = mockProducts.find((p) => p.id === value);
        if (p) { updated.productName = p.name; updated.purchaseRate = p.purchasePrice; updated.gstPct = p.gstRate; }
      }
      updated.lineTotal = calcLineTotal(updated.quantity, updated.purchaseRate, updated.gstPct);
      return updated;
    }));
  };

  const handleSupplierChange = (id: string) => {
    setSupplierId(id);
    const s = mockSuppliers.find((s) => s.id === id);
    setSupplierName(s?.name ?? '');
  };

  const handleSave = () => {
    if (!supplierName.trim()) { toast.error('Supplier name is required'); return; }
    if (lines.length === 0) { toast.error('Add at least one item'); return; }
    if (totalPaid > grandTotal) { toast.error('Total paid cannot exceed grand total'); return; }
    onSave({
      id: bill?.id ?? `pur-${Date.now()}`,
      billNumber: bill?.billNumber ?? nextNumber,
      date, supplierId: supplierId || null, supplierName,
      lines, grandTotal, cashPaid, upiPaid, bankPaid, balanceDue, status,
      is_deleted: false, created_at: bill?.created_at ?? new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl border flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-700 text-foreground">{bill ? `Edit ${bill.billNumber}` : `New Purchase Bill — ${nextNumber}`}</h2>
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
              <label className="block text-xs font-600 text-muted-foreground mb-1">Supplier *</label>
              <select value={supplierId} onChange={(e) => handleSupplierChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option value="">Select supplier…</option>
                {mockSuppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {!supplierId && (
                <input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Or type supplier name…" className="mt-1 w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              )}
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
                  <th className="text-right px-3 py-2 font-600 text-muted-foreground w-28">Purchase Rate</th>
                  <th className="text-right px-3 py-2 font-600 text-muted-foreground w-20">GST%</th>
                  <th className="text-right px-3 py-2 font-600 text-muted-foreground w-28">Total</th>
                  <th className="w-8"></th>
                </tr></thead>
                <tbody>
                  {lines.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-6 text-muted-foreground text-xs">No items added yet</td></tr>
                  ) : lines.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="px-3 py-2">
                        <select value={l.productId} onChange={(e) => updateLine(l.id, 'productId', e.target.value)}
                          className="w-full text-xs border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                          {mockProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min={1} value={l.quantity} onChange={(e) => updateLine(l.id, 'quantity', Number(e.target.value))}
                          className="w-full text-xs border rounded px-2 py-1 text-right bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min={0} value={l.purchaseRate} onChange={(e) => updateLine(l.id, 'purchaseRate', Number(e.target.value))}
                          className="w-full text-xs border rounded px-2 py-1 text-right bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                      </td>
                      <td className="px-3 py-2">
                        <select value={l.gstPct} onChange={(e) => updateLine(l.id, 'gstPct', Number(e.target.value) as GSTRate)}
                          className="w-full text-xs border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                          {[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right font-600 font-tabular">{formatIndianCurrency(l.lineTotal)}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => setLines((prev) => prev.filter((x) => x.id !== l.id))} className="p-1 hover:bg-red-50 rounded transition-colors">
                          <X size={12} className="text-danger" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {lines.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-xs font-600 text-muted-foreground">Payment</p>
                {[{ label: 'Cash Paid', val: cashPaid, set: setCashPaid }, { label: 'UPI Paid', val: upiPaid, set: setUpiPaid }, { label: 'Bank Paid', val: bankPaid, set: setBankPaid }].map(({ label, val, set }) => (
                  <div key={label} className="flex items-center gap-3">
                    <label className="text-xs text-muted-foreground w-20">{label}</label>
                    <input type="number" min={0} value={val} onChange={(e) => set(Number(e.target.value))}
                      className="flex-1 px-3 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary text-right font-tabular" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-end text-right space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Grand Total</span><span className="font-700 font-tabular">{formatIndianCurrency(grandTotal)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Paid</span><span className="font-600 text-accent font-tabular">{formatIndianCurrency(totalPaid)}</span></div>
                <div className="flex justify-between text-sm border-t pt-1"><span className="font-700">Balance Due</span><span className={`font-800 font-tabular ${balanceDue > 0 ? 'text-danger' : 'text-accent'}`}>{formatIndianCurrency(balanceDue)}</span></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 transition-all">
            {bill ? 'Update Bill' : 'Save Bill'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseBillPage() {
  const [bills, setBills] = useState<PurchaseBill[]>(mockPurchaseBills);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<PurchaseBill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseBill | null>(null);

  const filtered = useMemo(() =>
    bills.filter((b) => !b.is_deleted)
      .filter((b) => statusFilter === 'All' || b.status === statusFilter)
      .filter((b) => {
        const q = search.toLowerCase();
        return b.billNumber.toLowerCase().includes(q) || b.supplierName.toLowerCase().includes(q);
      }), [bills, search, statusFilter]);

  const nextNumber = `PUR-${String(bills.filter((b) => !b.is_deleted).length + 1).padStart(4, '0')}`;
  const totalDue = filtered.reduce((s, b) => s + b.balanceDue, 0);

  const handleSave = (bill: PurchaseBill) => {
    const exists = bills.find((b) => b.id === bill.id);
    if (exists) {
      setBills((prev) => prev.map((b) => b.id === bill.id ? bill : b));
      toast.success(`${bill.billNumber} updated.`);
    } else {
      setBills((prev) => [bill, ...prev]);
      toast.success(`${bill.billNumber} saved.`);
    }
    setFormOpen(false);
    setEditingBill(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setBills((prev) => prev.map((b) => b.id === deleteTarget.id ? { ...b, is_deleted: true } : b));
    toast.success(`${deleteTarget.billNumber} deleted.`);
    setDeleteTarget(null);
  };

  const statusVariant = (s: PaymentStatus) => s === 'Paid' ? 'paid' as const : s === 'Partial' ? 'partial' as const : 'pending' as const;

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-700 text-foreground">Purchase Bills</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} bills · {formatIndianCurrency(totalDue)} pending</p>
          </div>
          <button onClick={() => { setEditingBill(null); setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all">
            <Plus size={16} /> New Bill
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {(['All', 'Paid', 'Partial', 'Pending'] as const).map((s) => {
            const count = s === 'All' ? bills.filter((b) => !b.is_deleted).length : bills.filter((b) => !b.is_deleted && b.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-600 border transition-all btn-press ${statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'}`}>
                {s} <span className="font-tabular">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-card rounded-xl border shadow-card p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search bill number or supplier…" value={search}
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
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Bill #</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Supplier</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Items</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Total</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Paid</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Balance</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9}>
                    <EmptyState icon={Package} title="No purchase bills" description="Record purchase bills to track stock and supplier payments."
                      actionLabel="New Bill" onAction={() => { setEditingBill(null); setFormOpen(true); }} />
                  </td></tr>
                ) : filtered.map((bill, i) => (
                  <tr key={bill.id} className={`border-b last:border-b-0 row-hover transition-colors group ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                    <td className="px-4 py-3 font-700 text-primary text-xs font-mono">{bill.billNumber}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(bill.date)}</td>
                    <td className="px-4 py-3 text-xs font-500 text-foreground">{bill.supplierName}</td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground font-tabular">{bill.lines.length}</td>
                    <td className="px-4 py-3 text-right text-sm font-700 text-foreground font-tabular">{formatIndianCurrency(bill.grandTotal)}</td>
                    <td className="px-4 py-3 text-right text-xs font-600 text-accent font-tabular">{formatIndianCurrency(bill.cashPaid + bill.upiPaid + bill.bankPaid)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-700 font-tabular ${bill.balanceDue > 0 ? 'text-danger' : 'text-muted-foreground'}`}>{formatIndianCurrency(bill.balanceDue)}</span>
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={statusVariant(bill.status)} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingBill(bill); setFormOpen(true); }} title="Edit" className="p-1.5 rounded hover:bg-muted transition-colors"><Edit2 size={14} className="text-muted-foreground" /></button>
                        <button onClick={() => setDeleteTarget(bill)} title="Delete" className="p-1.5 rounded hover:bg-red-50 transition-colors"><Trash2 size={14} className="text-danger" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {formOpen && <BillForm bill={editingBill} onSave={handleSave} onClose={() => { setFormOpen(false); setEditingBill(null); }} nextNumber={nextNumber} />}

        <ConfirmModal isOpen={!!deleteTarget} title="Delete Purchase Bill"
          message={`Delete ${deleteTarget?.billNumber}? This cannot be undone.`}
          confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      </div>
    </AppLayout>
  );
}
