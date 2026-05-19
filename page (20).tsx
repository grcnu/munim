'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Search, X, Users, Phone, Mail, MapPin, Edit2 } from 'lucide-react';
import { mockCustomers, Customer } from '@/lib/mockData';
import { formatIndianCurrency } from '@/lib/formatters';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

interface CustomerFormProps {
  customer: Customer | null;
  onSave: (c: Customer) => void;
  onClose: () => void;
}

function CustomerForm({ customer, onSave, onClose }: CustomerFormProps) {
  const [name, setName] = useState(customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [email, setEmail] = useState(customer?.email ?? '');
  const [address, setAddress] = useState(customer?.address ?? '');
  const [gstin, setGstin] = useState(customer?.gstin ?? '');
  const [openingBalance, setOpeningBalance] = useState(customer?.openingBalance ?? 0);

  const handleSave = () => {
    if (!name.trim()) { toast.error('Customer name is required'); return; }
    if (phone && phone.length !== 10) { toast.error('Phone must be 10 digits'); return; }
    if (gstin && gstin.length !== 15) { toast.error('GSTIN must be 15 characters'); return; }
    onSave({
      id: customer?.id ?? `cust-${Date.now()}`,
      name: name.trim(), phone, email, address, gstin,
      openingBalance: Number(openingBalance), is_deleted: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-700 text-foreground">{customer ? 'Edit Customer' : 'Add Customer'}</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-1">Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name"
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number"
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com"
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-1">Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder="Full address"
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">GSTIN</label>
              <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="15-char GSTIN"
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono" />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Opening Balance (₹)</label>
              <input type="number" min={0} value={openingBalance} onChange={(e) => setOpeningBalance(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-right font-tabular" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 transition-all">
            {customer ? 'Update Customer' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const filtered = useMemo(() =>
    customers.filter((c) => !c.is_deleted).filter((c) => {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || c.gstin.toLowerCase().includes(q);
    }), [customers, search]);

  const totalReceivables = filtered.reduce((s, c) => s + c.openingBalance, 0);

  const handleSave = (customer: Customer) => {
    const exists = customers.find((c) => c.id === customer.id);
    if (exists) {
      setCustomers((prev) => prev.map((c) => c.id === customer.id ? customer : c));
      toast.success(`${customer.name} updated.`);
    } else {
      setCustomers((prev) => [customer, ...prev]);
      toast.success(`${customer.name} added.`);
    }
    setFormOpen(false);
    setEditingCustomer(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.openingBalance > 0) {
      toast.error('Cannot delete customer with non-zero opening balance.');
      setDeleteTarget(null);
      return;
    }
    setCustomers((prev) => prev.map((c) => c.id === deleteTarget.id ? { ...c, is_deleted: true } : c));
    toast.success(`${deleteTarget.name} deleted.`);
    setDeleteTarget(null);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-700 text-foreground">Customers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} customers · {formatIndianCurrency(totalReceivables)} opening receivables</p>
          </div>
          <button onClick={() => { setEditingCustomer(null); setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all">
            <Plus size={16} /> Add Customer
          </button>
        </div>

        <div className="bg-card rounded-xl border shadow-card p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search by name, phone, email, GSTIN…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"><X size={12} className="text-muted-foreground" /></button>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-3">
              <EmptyState icon={Users} title="No customers found" description="Add customers to manage their invoices and payments."
                actionLabel="Add Customer" onAction={() => { setEditingCustomer(null); setFormOpen(true); }} />
            </div>
          ) : filtered.map((c) => (
            <div key={c.id} className="bg-card rounded-xl border shadow-card p-4 group hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-700 text-primary">{c.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-700 text-foreground">{c.name}</p>
                    {c.gstin && <p className="text-xs text-muted-foreground font-mono">{c.gstin}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingCustomer(c); setFormOpen(true); }} className="p-1.5 rounded hover:bg-muted transition-colors"><Edit2 size={13} className="text-muted-foreground" /></button>
                  <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded hover:bg-red-50 transition-colors"><X size={13} className="text-danger" /></button>
                </div>
              </div>
              <div className="space-y-1.5">
                {c.phone && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone size={11} /><span>{c.phone}</span></div>}
                {c.email && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail size={11} /><span className="truncate">{c.email}</span></div>}
                {c.address && <div className="flex items-start gap-2 text-xs text-muted-foreground"><MapPin size={11} className="mt-0.5 flex-shrink-0" /><span className="line-clamp-2">{c.address}</span></div>}
              </div>
              {c.openingBalance > 0 && (
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Opening Balance</span>
                  <span className="text-sm font-700 text-danger font-tabular">{formatIndianCurrency(c.openingBalance)}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {formOpen && <CustomerForm customer={editingCustomer} onSave={handleSave} onClose={() => { setFormOpen(false); setEditingCustomer(null); }} />}

        <ConfirmModal isOpen={!!deleteTarget} title="Delete Customer"
          message={`Delete ${deleteTarget?.name}? This cannot be undone. Customers with invoices or non-zero balance cannot be deleted.`}
          confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      </div>
    </AppLayout>
  );
}
