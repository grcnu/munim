'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Search, X, Trash2, Receipt } from 'lucide-react';
import { formatIndianCurrency, formatDate, todayISO } from '@/lib/formatters';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

type PayMethod = 'Cash' | 'UPI' | 'Bank';

const EXPENSE_CATEGORIES = ['Rent', 'Electricity', 'Transport', 'Salaries', 'Packaging', 'Marketing', 'Maintenance', 'Miscellaneous'];

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  method: PayMethod;
  created_at: string;
}

const mockExpenses: Expense[] = [
  { id: 'exp-001', date: '2026-05-15', category: 'Rent', description: 'Monthly shop rent — May 2026', amount: 18000, method: 'Bank', created_at: '2026-05-15T09:00:00Z' },
  { id: 'exp-002', date: '2026-05-14', category: 'Electricity', description: 'BESCOM bill — April 2026', amount: 3450, method: 'UPI', created_at: '2026-05-14T11:00:00Z' },
  { id: 'exp-003', date: '2026-05-12', category: 'Transport', description: 'Delivery charges — Agro Traders', amount: 850, method: 'Cash', created_at: '2026-05-12T14:00:00Z' },
  { id: 'exp-004', date: '2026-05-10', category: 'Packaging', description: 'Carry bags and boxes', amount: 1200, method: 'Cash', created_at: '2026-05-10T10:00:00Z' },
  { id: 'exp-005', date: '2026-05-05', category: 'Salaries', description: 'Staff salary — April 2026', amount: 25000, method: 'Bank', created_at: '2026-05-05T09:00:00Z' },
];

interface ExpenseFormProps {
  onSave: (e: Expense) => void;
  onClose: () => void;
}

function ExpenseForm({ onSave, onClose }: ExpenseFormProps) {
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayMethod>('Cash');

  const handleSave = () => {
    if (!category) { toast.error('Category is required'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Amount must be greater than 0'); return; }
    onSave({
      id: `exp-${Date.now()}`, date, category, description, amount: amt, method,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-700 text-foreground">Add Expense</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option value="">Select category…</option>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-1">Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description…"
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-1">Amount (₹) *</label>
            <input type="number" min={0.01} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
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
          <div className="bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
            <p className="text-xs text-warning font-600">⚠ Expenses cannot be edited after saving. Delete and re-enter to correct.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 transition-all">Save Expense</button>
        </div>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const filtered = useMemo(() =>
    expenses.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = e.category.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'All' || e.category === categoryFilter;
      return matchSearch && matchCat;
    }), [expenses, search, categoryFilter]);

  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => { map[e.category] = (map[e.category] ?? 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const handleSave = (e: Expense) => {
    setExpenses((prev) => [e, ...prev]);
    toast.success(`Expense of ${formatIndianCurrency(e.amount)} (${e.category}) recorded.`);
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    toast.success('Expense deleted.');
    setDeleteTarget(null);
  };

  const methodBg = (m: PayMethod) => m === 'Cash' ? 'bg-accent/10 text-accent' : m === 'UPI' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning';

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-700 text-foreground">Expenses</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} entries · {formatIndianCurrency(totalAmount)} total</p>
          </div>
          <button onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all">
            <Plus size={16} /> Add Expense
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categoryTotals.slice(0, 4).map(([cat, total]) => (
            <div key={cat} className="bg-card rounded-xl border shadow-card p-3">
              <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1 truncate">{cat}</p>
              <p className="text-lg font-800 text-foreground font-tabular">{formatIndianCurrency(total)}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border shadow-card p-3 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search category or description…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"><X size={12} className="text-muted-foreground" /></button>}
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="All">All Categories</option>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Amount</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Method</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6}>
                    <EmptyState icon={Receipt} title="No expenses recorded" description="Track business expenses to monitor cash flow."
                      actionLabel="Add Expense" onAction={() => setFormOpen(true)} />
                  </td></tr>
                ) : filtered.map((e, i) => (
                  <tr key={e.id} className={`border-b last:border-b-0 row-hover transition-colors group ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(e.date)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 bg-muted text-foreground">{e.category}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{e.description || '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-700 text-danger font-tabular">{formatIndianCurrency(e.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 ${methodBg(e.method)}`}>{e.method}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDeleteTarget(e)} title="Delete" className="p-1.5 rounded hover:bg-red-50 transition-colors"><Trash2 size={14} className="text-danger" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {formOpen && <ExpenseForm onSave={handleSave} onClose={() => setFormOpen(false)} />}

        <ConfirmModal isOpen={!!deleteTarget} title="Delete Expense"
          message={`Delete ${deleteTarget?.category} expense of ${deleteTarget ? formatIndianCurrency(deleteTarget.amount) : ''}? This cannot be undone.`}
          confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      </div>
    </AppLayout>
  );
}
