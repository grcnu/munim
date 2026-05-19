'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Search, X, Truck, Phone, Mail, MapPin, Edit2 } from 'lucide-react';
import { formatIndianCurrency } from '@/lib/formatters';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  openingBalance: number;
  is_deleted: boolean;
}

const mockSuppliersData: Supplier[] = [
  { id: 'sup-001', name: 'Agro Traders Pvt Ltd', phone: '9876500001', email: 'agro@traders.in', address: '45, APMC Yard, Bengaluru, Karnataka 560002', gstin: '29AAAAA0001A1Z5', openingBalance: 15000, is_deleted: false },
  { id: 'sup-002', name: 'National Foods Distributor', phone: '9876500002', email: 'nfd@nationalfoods.co.in', address: '12, Wholesale Market, Delhi 110006', gstin: '07BBBBB0002B2Z6', openingBalance: 0, is_deleted: false },
  { id: 'sup-003', name: 'Sunrise FMCG Wholesale', phone: '9876500003', email: '', address: '78, Industrial Area, Pune, Maharashtra 411019', gstin: '27CCCCC0003C3Z7', openingBalance: 8500, is_deleted: false },
  { id: 'sup-004', name: 'Karnataka Oils & Fats', phone: '9876500004', email: 'kof@karnatakaols.in', address: '22, Oil Mill Road, Mysuru, Karnataka 570001', gstin: '29DDDDD0004D4Z8', openingBalance: 0, is_deleted: false },
];

interface SupplierFormProps {
  supplier: Supplier | null;
  onSave: (s: Supplier) => void;
  onClose: () => void;
}

function SupplierForm({ supplier, onSave, onClose }: SupplierFormProps) {
  const [name, setName] = useState(supplier?.name ?? '');
  const [phone, setPhone] = useState(supplier?.phone ?? '');
  const [email, setEmail] = useState(supplier?.email ?? '');
  const [address, setAddress] = useState(supplier?.address ?? '');
  const [gstin, setGstin] = useState(supplier?.gstin ?? '');
  const [openingBalance, setOpeningBalance] = useState(supplier?.openingBalance ?? 0);

  const handleSave = () => {
    if (!name.trim()) { toast.error('Supplier name is required'); return; }
    if (phone && phone.length !== 10) { toast.error('Phone must be 10 digits'); return; }
    if (gstin && gstin.length !== 15) { toast.error('GSTIN must be 15 characters'); return; }
    onSave({
      id: supplier?.id ?? `sup-${Date.now()}`,
      name: name.trim(), phone, email, address, gstin,
      openingBalance: Number(openingBalance), is_deleted: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-700 text-foreground">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-600 text-muted-foreground mb-1">Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Supplier name"
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
            {supplier ? 'Update Supplier' : 'Add Supplier'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliersData);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const filtered = useMemo(() =>
    suppliers.filter((s) => !s.is_deleted).filter((s) => {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.email.toLowerCase().includes(q) || s.gstin.toLowerCase().includes(q);
    }), [suppliers, search]);

  const totalPayables = filtered.reduce((s, sup) => s + sup.openingBalance, 0);

  const handleSave = (supplier: Supplier) => {
    const exists = suppliers.find((s) => s.id === supplier.id);
    if (exists) {
      setSuppliers((prev) => prev.map((s) => s.id === supplier.id ? supplier : s));
      toast.success(`${supplier.name} updated.`);
    } else {
      setSuppliers((prev) => [supplier, ...prev]);
      toast.success(`${supplier.name} added.`);
    }
    setFormOpen(false);
    setEditingSupplier(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.openingBalance > 0) {
      toast.error('Cannot delete supplier with non-zero opening balance.');
      setDeleteTarget(null);
      return;
    }
    setSuppliers((prev) => prev.map((s) => s.id === deleteTarget.id ? { ...s, is_deleted: true } : s));
    toast.success(`${deleteTarget.name} deleted.`);
    setDeleteTarget(null);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-700 text-foreground">Suppliers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} suppliers · {formatIndianCurrency(totalPayables)} opening payables</p>
          </div>
          <button onClick={() => { setEditingSupplier(null); setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all">
            <Plus size={16} /> Add Supplier
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
              <EmptyState icon={Truck} title="No suppliers found" description="Add suppliers to manage purchase bills and payments."
                actionLabel="Add Supplier" onAction={() => { setEditingSupplier(null); setFormOpen(true); }} />
            </div>
          ) : filtered.map((s) => (
            <div key={s.id} className="bg-card rounded-xl border shadow-card p-4 group hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-700 text-warning">{s.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-700 text-foreground">{s.name}</p>
                    {s.gstin && <p className="text-xs text-muted-foreground font-mono">{s.gstin}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingSupplier(s); setFormOpen(true); }} className="p-1.5 rounded hover:bg-muted transition-colors"><Edit2 size={13} className="text-muted-foreground" /></button>
                  <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded hover:bg-red-50 transition-colors"><X size={13} className="text-danger" /></button>
                </div>
              </div>
              <div className="space-y-1.5">
                {s.phone && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone size={11} /><span>{s.phone}</span></div>}
                {s.email && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail size={11} /><span className="truncate">{s.email}</span></div>}
                {s.address && <div className="flex items-start gap-2 text-xs text-muted-foreground"><MapPin size={11} className="mt-0.5 flex-shrink-0" /><span className="line-clamp-2">{s.address}</span></div>}
              </div>
              {s.openingBalance > 0 && (
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Opening Balance</span>
                  <span className="text-sm font-700 text-danger font-tabular">{formatIndianCurrency(s.openingBalance)}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {formOpen && <SupplierForm supplier={editingSupplier} onSave={handleSave} onClose={() => { setFormOpen(false); setEditingSupplier(null); }} />}

        <ConfirmModal isOpen={!!deleteTarget} title="Delete Supplier"
          message={`Delete ${deleteTarget?.name}? Suppliers with purchase bills or non-zero balance cannot be deleted.`}
          confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      </div>
    </AppLayout>
  );
}
