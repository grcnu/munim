'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Search, X, Eye, Edit2, Trash2, ShoppingCart, FileText } from 'lucide-react';
import { mockCustomers, mockProducts, Customer, Product, GSTRate } from '@/lib/mockData';
import { formatIndianCurrency, formatDate, todayISO } from '@/lib/formatters';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

interface OrderLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  discountPct: number;
  gstPct: GSTRate;
  lineTotal: number;
}

interface SaleOrder {
  id: string;
  orderNumber: string;
  date: string;
  customerId: string | null;
  customerName: string;
  lines: OrderLine[];
  grandTotal: number;
  note: string;
  is_deleted: boolean;
  created_at: string;
}

const mockSaleOrders: SaleOrder[] = [
  {
    id: 'so-001', orderNumber: 'SO-0003', date: '2026-05-17', customerId: 'cust-001', customerName: 'Ramesh Agarwal Traders',
    lines: [
      { id: 'sol-001a', productId: 'prod-001', productName: 'Basmati Rice 5kg', quantity: 15, rate: 425, discountPct: 0, gstPct: 5, lineTotal: 6693.75 },
    ],
    grandTotal: 6693.75, note: 'Deliver by 20 May', is_deleted: false, created_at: '2026-05-17T08:00:00Z',
  },
  {
    id: 'so-002', orderNumber: 'SO-0002', date: '2026-05-15', customerId: 'cust-004', customerName: 'Meena Cloth House',
    lines: [
      { id: 'sol-002a', productId: 'prod-006', productName: 'Sugar 1kg', quantity: 50, rate: 48, discountPct: 0, gstPct: 5, lineTotal: 2520 },
      { id: 'sol-002b', productId: 'prod-010', productName: 'Tea Leaves 500g', quantity: 10, rate: 185, discountPct: 0, gstPct: 5, lineTotal: 1942.5 },
    ],
    grandTotal: 4462.5, note: '', is_deleted: false, created_at: '2026-05-15T10:00:00Z',
  },
  {
    id: 'so-003', orderNumber: 'SO-0001', date: '2026-05-12', customerId: 'cust-002', customerName: 'Priya Enterprises',
    lines: [
      { id: 'sol-003a', productId: 'prod-004', productName: 'Detergent Powder 1kg', quantity: 30, rate: 89, discountPct: 5, gstPct: 18, lineTotal: 2990.97 },
    ],
    grandTotal: 2990.97, note: 'Urgent order', is_deleted: false, created_at: '2026-05-12T14:00:00Z',
  },
];

function calcLineTotal(qty: number, rate: number, discPct: number, gstPct: number): number {
  const gross = qty * rate;
  const afterDisc = gross * (1 - discPct / 100);
  return Math.round(afterDisc * (1 + gstPct / 100) * 100) / 100;
}

interface OrderFormProps {
  order: SaleOrder | null;
  onSave: (o: SaleOrder) => void;
  onClose: () => void;
  nextNumber: string;
}

function OrderForm({ order, onSave, onClose, nextNumber }: OrderFormProps) {
  const [date, setDate] = useState(order?.date ?? todayISO());
  const [customerId, setCustomerId] = useState(order?.customerId ?? '');
  const [customerName, setCustomerName] = useState(order?.customerName ?? '');
  const [note, setNote] = useState(order?.note ?? '');
  const [lines, setLines] = useState<OrderLine[]>(order?.lines ?? []);

  const addLine = () => {
    const p = mockProducts[0];
    const newLine: OrderLine = {
      id: `sol-${Date.now()}`, productId: p.id, productName: p.name,
      quantity: 1, rate: p.salePrice, discountPct: p.defaultDiscount, gstPct: p.gstRate,
      lineTotal: calcLineTotal(1, p.salePrice, p.defaultDiscount, p.gstRate),
    };
    setLines((prev) => [...prev, newLine]);
  };

  const updateLine = (id: string, field: keyof OrderLine, value: string | number) => {
    setLines((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      if (field === 'productId') {
        const p = mockProducts.find((p) => p.id === value);
        if (p) {
          updated.productName = p.name;
          updated.rate = p.salePrice;
          updated.gstPct = p.gstRate;
          updated.discountPct = p.defaultDiscount;
        }
      }
      updated.lineTotal = calcLineTotal(updated.quantity, updated.rate, updated.discountPct, updated.gstPct);
      return updated;
    }));
  };

  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));

  const grandTotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const c = mockCustomers.find((c) => c.id === id);
    setCustomerName(c?.name ?? '');
  };

  const handleSave = () => {
    if (!date) { toast.error('Date is required'); return; }
    if (lines.length === 0) { toast.error('Add at least one item'); return; }
    const saved: SaleOrder = {
      id: order?.id ?? `so-${Date.now()}`,
      orderNumber: order?.orderNumber ?? nextNumber,
      date, customerId: customerId || null, customerName: customerName || 'Walk-in Customer',
      lines, grandTotal, note, is_deleted: false,
      created_at: order?.created_at ?? new Date().toISOString(),
    };
    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl border flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-700 text-foreground">{order ? `Edit ${order.orderNumber}` : `New Sale Order — ${nextNumber}`}</h2>
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
              <label className="block text-xs font-600 text-muted-foreground mb-1">Customer</label>
              <select value={customerId} onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option value="">Walk-in Customer</option>
                {mockCustomers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-600 text-muted-foreground">Items *</label>
              <button onClick={addLine} className="flex items-center gap-1 text-xs font-600 text-primary hover:underline">
                <Plus size={12} /> Add Item
              </button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-3 py-2 font-600 text-muted-foreground">Product</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground w-20">Qty</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground w-24">Rate</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground w-20">Disc%</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground w-20">GST%</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground w-28">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
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
                      <td className="px-3 py-2">
                        <input type="number" min={1} value={l.quantity} onChange={(e) => updateLine(l.id, 'quantity', Number(e.target.value))}
                          className="w-full text-xs border rounded px-2 py-1 text-right bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min={0} value={l.rate} onChange={(e) => updateLine(l.id, 'rate', Number(e.target.value))}
                          className="w-full text-xs border rounded px-2 py-1 text-right bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min={0} max={100} value={l.discountPct} onChange={(e) => updateLine(l.id, 'discountPct', Number(e.target.value))}
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
                        <button onClick={() => removeLine(l.id)} className="p-1 hover:bg-red-50 rounded transition-colors">
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
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Grand Total (incl. GST)</p>
                <p className="text-xl font-800 text-foreground font-tabular">{formatIndianCurrency(grandTotal)}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-1">Note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              placeholder="Optional note or delivery instructions…"
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 transition-all">
            {order ? 'Update Order' : 'Save Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SaleOrderPage() {
  const [orders, setOrders] = useState<SaleOrder[]>(mockSaleOrders);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SaleOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SaleOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<SaleOrder | null>(null);

  const filtered = useMemo(() =>
    orders.filter((o) => !o.is_deleted).filter((o) => {
      const q = search.toLowerCase();
      return o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q);
    }), [orders, search]);

  const nextNumber = `SO-${String(orders.filter((o) => !o.is_deleted).length + 1).padStart(4, '0')}`;

  const handleSave = (order: SaleOrder) => {
    const exists = orders.find((o) => o.id === order.id);
    if (exists) {
      setOrders((prev) => prev.map((o) => o.id === order.id ? order : o));
      toast.success(`${order.orderNumber} updated.`);
    } else {
      setOrders((prev) => [order, ...prev]);
      toast.success(`${order.orderNumber} saved.`);
    }
    setFormOpen(false);
    setEditingOrder(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setOrders((prev) => prev.map((o) => o.id === deleteTarget.id ? { ...o, is_deleted: true } : o));
    toast.success(`${deleteTarget.orderNumber} deleted.`);
    setDeleteTarget(null);
  };

  const handleConvertToInvoice = (order: SaleOrder) => {
    toast.success(`${order.orderNumber} items copied to new invoice. Open Sale Invoice to complete.`);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-700 text-foreground">Sale Orders</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} orders · Does not affect stock or balances</p>
          </div>
          <button onClick={() => { setEditingOrder(null); setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all">
            <Plus size={16} /> New Order
          </button>
        </div>

        <div className="bg-card rounded-xl border shadow-card p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search order number or customer…" value={search}
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
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Order #</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Customer</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Items</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Note</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}>
                    <EmptyState icon={ShoppingCart} title="No sale orders" description="Create a sale order to book customer orders without affecting stock."
                      actionLabel="New Order" onAction={() => { setEditingOrder(null); setFormOpen(true); }} />
                  </td></tr>
                ) : filtered.map((order, i) => (
                  <tr key={order.id} className={`border-b last:border-b-0 row-hover transition-colors group ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => setViewingOrder(order)} className="font-700 text-primary text-xs font-mono hover:underline">{order.orderNumber}</button>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(order.date)}</td>
                    <td className="px-4 py-3 text-xs font-500 text-foreground">{order.customerName}</td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground font-tabular">{order.lines.length}</td>
                    <td className="px-4 py-3 text-right text-sm font-700 text-foreground font-tabular">{formatIndianCurrency(order.grandTotal)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{order.note || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewingOrder(order)} title="View" className="p-1.5 rounded hover:bg-muted transition-colors"><Eye size={14} className="text-muted-foreground" /></button>
                        <button onClick={() => { setEditingOrder(order); setFormOpen(true); }} title="Edit" className="p-1.5 rounded hover:bg-muted transition-colors"><Edit2 size={14} className="text-muted-foreground" /></button>
                        <button onClick={() => handleConvertToInvoice(order)} title="Convert to Invoice" className="p-1.5 rounded hover:bg-green-50 transition-colors"><FileText size={14} className="text-accent" /></button>
                        <button onClick={() => setDeleteTarget(order)} title="Delete" className="p-1.5 rounded hover:bg-red-50 transition-colors"><Trash2 size={14} className="text-danger" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {formOpen && (
          <OrderForm order={editingOrder} onSave={handleSave} onClose={() => { setFormOpen(false); setEditingOrder(null); }} nextNumber={nextNumber} />
        )}

        {viewingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-700 text-foreground">{viewingOrder.orderNumber}</h2>
                <button onClick={() => setViewingOrder(null)} className="p-1.5 rounded hover:bg-muted transition-colors"><X size={16} /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-600">{formatDate(viewingOrder.date)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-600">{viewingOrder.customerName}</span></div>
                {viewingOrder.note && <div className="flex justify-between"><span className="text-muted-foreground">Note</span><span className="font-600 text-right max-w-[200px]">{viewingOrder.note}</span></div>}
                <div className="border rounded-lg overflow-hidden mt-3">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40"><tr>
                      <th className="text-left px-3 py-2 font-600 text-muted-foreground">Product</th>
                      <th className="text-right px-3 py-2 font-600 text-muted-foreground">Qty</th>
                      <th className="text-right px-3 py-2 font-600 text-muted-foreground">Rate</th>
                      <th className="text-right px-3 py-2 font-600 text-muted-foreground">Total</th>
                    </tr></thead>
                    <tbody>
                      {viewingOrder.lines.map((l) => (
                        <tr key={l.id} className="border-t">
                          <td className="px-3 py-2">{l.productName}</td>
                          <td className="px-3 py-2 text-right font-tabular">{l.quantity}</td>
                          <td className="px-3 py-2 text-right font-tabular">{formatIndianCurrency(l.rate)}</td>
                          <td className="px-3 py-2 text-right font-700 font-tabular">{formatIndianCurrency(l.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-700 text-foreground">Grand Total</span>
                  <span className="font-800 text-lg text-foreground font-tabular">{formatIndianCurrency(viewingOrder.grandTotal)}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setViewingOrder(null); setEditingOrder(viewingOrder); setFormOpen(true); }}
                  className="flex-1 px-4 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors">Edit</button>
                <button onClick={() => { handleConvertToInvoice(viewingOrder); setViewingOrder(null); }}
                  className="flex-1 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 transition-all">Convert to Invoice</button>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal isOpen={!!deleteTarget} title="Delete Sale Order"
          message={`Delete ${deleteTarget?.orderNumber}? This cannot be undone.`}
          confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      </div>
    </AppLayout>
  );
}
