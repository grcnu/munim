'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download, Printer, Eye, Edit2, Trash2, ReceiptText, Share2, X } from 'lucide-react';
import { mockInvoices, mockCustomers, PaymentStatus, Invoice } from '@/lib/mockData';
import { formatIndianCurrency, formatDate } from '@/lib/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import InvoiceFormDrawer from './InvoiceFormDrawer';
import InvoiceDetailPanel from './InvoiceDetailPanel';
import ReceiveBalanceModal from './ReceiveBalanceModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

export default function SalesInvoiceManagementClient() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [receiveBalanceInvoice, setReceiveBalanceInvoice] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'date' | 'invoiceNumber' | 'grandTotalAfterDiscount' | 'balanceDue'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const statusVariant = (s: PaymentStatus) => {
    if (s === 'Paid') return 'paid' as const;
    if (s === 'Partial') return 'partial' as const;
    return 'pending' as const;
  };

  const filtered = useMemo(() => {
    return invoices
      .filter((inv) => !inv.is_deleted)
      .filter((inv) => {
        const q = search.toLowerCase();
        return (
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q)
        );
      })
      .filter((inv) => statusFilter === 'All' || inv.status === statusFilter)
      .filter((inv) => {
        if (dateFrom && inv.date < dateFrom) return false;
        if (dateTo && inv.date > dateTo) return false;
        return true;
      })
      .sort((a, b) => {
        let av: string | number = a[sortField] ?? '';
        let bv: string | number = b[sortField] ?? '';
        if (typeof av === 'string' && typeof bv === 'string') {
          return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
      });
  }, [invoices, search, statusFilter, dateFrom, dateTo, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <span className={`ml-1 text-xs ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`}>
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.cashPaid + deleteTarget.upiPaid + deleteTarget.bankPaid > 0) {
      toast.error('Cannot delete invoice with payments. Set all paid amounts to zero first.');
      setDeleteTarget(null);
      return;
    }
    setInvoices((prev) =>
      prev.map((inv) => inv.id === deleteTarget.id ? { ...inv, is_deleted: true } : inv)
    );
    toast.success(`Invoice ${deleteTarget.invoiceNumber} deleted.`);
    setDeleteTarget(null);
    // Backend integration: Update is_deleted=true in Supabase invoices table
  };

  const handleReceiveBalance = (invoice: Invoice, amount: number, method: 'Cash' | 'UPI' | 'Bank', note: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoice.id) return inv;
        const newCash = method === 'Cash' ? inv.cashPaid + amount : inv.cashPaid;
        const newUpi = method === 'UPI' ? inv.upiPaid + amount : inv.upiPaid;
        const newBank = method === 'Bank' ? inv.bankPaid + amount : inv.bankPaid;
        const newBalance = inv.grandTotalAfterDiscount - newCash - newUpi - newBank;
        const newStatus: PaymentStatus = newBalance <= 0 ? 'Paid' : newBalance < inv.grandTotalAfterDiscount ? 'Partial' : 'Pending';
        return { ...inv, cashPaid: newCash, upiPaid: newUpi, bankPaid: newBank, balanceDue: Math.max(0, newBalance), status: newStatus, updated_at: new Date().toISOString() };
      })
    );
    toast.success(`₹${new Intl.NumberFormat('en-IN').format(amount)} received via ${method}.`);
    setReceiveBalanceInvoice(null);
    // Backend integration: Save payment to invoice_payments table, update invoice record
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    const exists = invoices.find((i) => i.id === invoice.id);
    if (exists) {
      setInvoices((prev) => prev.map((i) => i.id === invoice.id ? invoice : i));
      toast.success(`Invoice ${invoice.invoiceNumber} updated.`);
    } else {
      setInvoices((prev) => [invoice, ...prev]);
      toast.success(`Invoice ${invoice.invoiceNumber} saved.`);
    }
    setDrawerOpen(false);
    setEditingInvoice(null);
    // Backend integration: Upsert invoice to Supabase invoices table with user_id
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map((i) => i.id)));
  };

  const summaryStats = useMemo(() => {
    const visible = filtered;
    const totalSales = visible.reduce((s, i) => s + i.grandTotalAfterDiscount, 0);
    const totalDue = visible.reduce((s, i) => s + i.balanceDue, 0);
    const paidCount = visible.filter((i) => i.status === 'Paid').length;
    return { totalSales, totalDue, paidCount, total: visible.length };
  }, [filtered]);

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Sale Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {summaryStats.total} invoices · {formatIndianCurrency(summaryStats.totalSales)} total · {formatIndianCurrency(summaryStats.totalDue)} pending
          </p>
        </div>
        <button
          onClick={() => { setEditingInvoice(null); setDrawerOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all"
        >
          <Plus size={16} />
          New Invoice
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {(['All', 'Paid', 'Partial', 'Pending'] as const).map((s) => {
          const count = s === 'All' ? filtered.length : filtered.filter((i) => i.status === s).length;
          return (
            <button
              key={`chip-status-${s}`}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-600 border transition-all btn-press ${
                statusFilter === s
                  ? 'bg-primary text-white border-primary' :'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              {s} <span className="font-tabular">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-card rounded-xl border shadow-card p-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoice no. or customer…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded">
              <X size={12} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground flex-shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
            className="px-2 py-2 text-xs border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
            className="px-2 py-2 text-xs border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-xs text-danger hover:underline">Clear</button>
          )}
        </div>

        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-600 border rounded-lg hover:bg-muted transition-colors ml-auto">
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5 animate-slide-up">
          <span className="text-sm font-600 text-primary">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 border rounded-lg hover:bg-muted transition-colors">
              <Printer size={12} /> Print Selected
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 border rounded-lg hover:bg-muted transition-colors">
              <Download size={12} /> Export PDF
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="p-1.5 hover:bg-muted rounded transition-colors">
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginated.length && paginated.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-600 text-muted-foreground cursor-pointer hover:text-foreground select-none"
                  onClick={() => toggleSort('invoiceNumber')}
                >
                  Invoice # <SortIcon field="invoiceNumber" />
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-600 text-muted-foreground cursor-pointer hover:text-foreground select-none"
                  onClick={() => toggleSort('date')}
                >
                  Date <SortIcon field="date" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Customer</th>
                <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Items</th>
                <th
                  className="text-right px-4 py-3 text-xs font-600 text-muted-foreground cursor-pointer hover:text-foreground select-none"
                  onClick={() => toggleSort('grandTotalAfterDiscount')}
                >
                  Grand Total <SortIcon field="grandTotalAfterDiscount" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Paid</th>
                <th
                  className="text-right px-4 py-3 text-xs font-600 text-muted-foreground cursor-pointer hover:text-foreground select-none"
                  onClick={() => toggleSort('balanceDue')}
                >
                  Balance Due <SortIcon field="balanceDue" />
                </th>
                <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Status</th>
                <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <EmptyState
                      icon={ReceiptText}
                      title="No invoices found"
                      description="No invoices match your current filters. Create a new invoice or clear the search."
                      actionLabel="Create Invoice"
                      onAction={() => { setEditingInvoice(null); setDrawerOpen(true); }}
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((inv, i) => (
                  <tr
                    key={`inv-row-${inv.id}`}
                    className={`border-b last:border-b-0 row-hover transition-colors group ${
                      i % 2 === 1 ? 'bg-muted/20' : ''
                    } ${selectedIds.has(inv.id) ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(inv.id)}
                        onChange={() => toggleSelect(inv.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setViewingInvoice(inv)}
                        className="font-700 text-primary text-xs font-mono hover:underline"
                      >
                        {inv.invoiceNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(inv.date)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-500 text-foreground truncate max-w-[160px]">{inv.customerName}</p>
                      {inv.customerId && (
                        <p className="text-xs text-muted-foreground">
                          {mockCustomers.find((c) => c.id === inv.customerId)?.gstin ? 'GST registered' : 'Unregistered'}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground font-tabular">
                      {inv.lines.length}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-700 text-foreground font-tabular">
                        {formatIndianCurrency(inv.grandTotalAfterDiscount)}
                      </span>
                      {inv.finalDiscount > 0 && (
                        <p className="text-xs text-muted-foreground font-tabular">
                          -₹{new Intl.NumberFormat('en-IN').format(inv.finalDiscount)} disc
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-600 text-accent font-tabular">
                        {formatIndianCurrency(inv.cashPaid + inv.upiPaid + inv.bankPaid)}
                      </span>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        {inv.cashPaid > 0 && <span className="text-xs text-muted-foreground">Cash</span>}
                        {inv.upiPaid > 0 && <span className="text-xs text-muted-foreground">UPI</span>}
                        {inv.bankPaid > 0 && <span className="text-xs text-muted-foreground">Bank</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-700 font-tabular ${inv.balanceDue > 0 ? 'text-danger' : 'text-muted-foreground'}`}>
                        {formatIndianCurrency(inv.balanceDue)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={statusVariant(inv.status)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          title="View invoice details"
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                        >
                          <Eye size={14} className="text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => { setEditingInvoice(inv); setDrawerOpen(true); }}
                          title="Edit invoice"
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                        >
                          <Edit2 size={14} className="text-muted-foreground" />
                        </button>
                        <button
                          title="Print invoice"
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                        >
                          <Printer size={14} className="text-muted-foreground" />
                        </button>
                        <button
                          title="Share invoice as PDF"
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                        >
                          <Share2 size={14} className="text-muted-foreground" />
                        </button>
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => setReceiveBalanceInvoice(inv)}
                            title="Receive balance payment"
                            className="p-1.5 rounded hover:bg-green-50 transition-colors"
                          >
                            <ReceiptText size={14} className="text-accent" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(inv)}
                          title="Delete invoice"
                          className="p-1.5 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="border rounded px-2 py-1 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {[10, 20, 50].map((n) => (
                  <option key={`pagesize-${n}`} value={n}>{n}</option>
                ))}
              </select>
              <span>of {filtered.length} invoices</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-muted transition-colors"
              >
                «
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-muted transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-1 text-xs border rounded transition-colors ${
                      currentPage === page ? 'bg-primary text-white border-primary' : 'hover:bg-muted'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-muted transition-colors"
              >
                ›
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-muted transition-colors"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice form drawer */}
      {drawerOpen && (
        <InvoiceFormDrawer
          invoice={editingInvoice}
          customers={mockCustomers}
          onSave={handleSaveInvoice}
          onClose={() => { setDrawerOpen(false); setEditingInvoice(null); }}
        />
      )}

      {/* Detail panel */}
      {viewingInvoice && (
        <InvoiceDetailPanel
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          onEdit={() => { setEditingInvoice(viewingInvoice); setViewingInvoice(null); setDrawerOpen(true); }}
          onReceiveBalance={() => { setReceiveBalanceInvoice(viewingInvoice); setViewingInvoice(null); }}
        />
      )}

      {/* Receive balance modal */}
      {receiveBalanceInvoice && (
        <ReceiveBalanceModal
          invoice={receiveBalanceInvoice}
          onSave={handleReceiveBalance}
          onClose={() => setReceiveBalanceInvoice(null)}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Invoice"
        message={`Delete invoice ${deleteTarget?.invoiceNumber}? This action sets the invoice as deleted and cannot be undone. Invoices with payments cannot be deleted.`}
        confirmLabel="Delete Invoice"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}