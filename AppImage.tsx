'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, Upload, X, Filter, Edit2, Trash2, Boxes, BarChart2 } from 'lucide-react';
import { mockProducts, Product, GSTRate, computeStockForProduct, getStockStatus } from '@/lib/mockData';
import { formatIndianCurrency } from '@/lib/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import ProductFormModal from './ProductFormModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

const ALL_CATEGORIES = ['All', ...Array.from(new Set(mockProducts.map((p) => p.category)))];
const ALL_STOCK_STATUSES = ['All', 'Available', 'Low Stock', 'Out of Stock'];
const GST_RATES: GSTRate[] = [0, 5, 12, 18, 28];

export default function ProductManagementClient() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All');
  const [gstFilter, setGstFilter] = useState<GSTRate | 'All'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'name' | 'salePrice' | 'purchasePrice' | 'currentStock'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const withStock = useMemo(() =>
    products
      .filter((p) => !p.is_deleted)
      .map((p) => ({
        ...p,
        currentStock: computeStockForProduct(p.id, p.openingStock),
        stockStatus: getStockStatus(computeStockForProduct(p.id, p.openingStock)),
      })),
    [products]
  );

  const filtered = useMemo(() => {
    return withStock
      .filter((p) => {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.qr.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      })
      .filter((p) => categoryFilter === 'All' || p.category === categoryFilter)
      .filter((p) => stockStatusFilter === 'All' || p.stockStatus === stockStatusFilter)
      .filter((p) => gstFilter === 'All' || p.gstRate === gstFilter)
      .sort((a, b) => {
        let av: string | number = a[sortField] ?? '';
        let bv: string | number = b[sortField] ?? '';
        if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
        return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
      });
  }, [withStock, search, categoryFilter, stockStatusFilter, gstFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <span className={`ml-1 text-xs ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`}>
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const handleSaveProduct = (product: Product) => {
    const exists = products.find((p) => p.id === product.id);
    if (exists) {
      setProducts((prev) => prev.map((p) => p.id === product.id ? product : p));
      toast.success(`Product "${product.name}" updated.`);
    } else {
      setProducts((prev) => [product, ...prev]);
      toast.success(`Product "${product.name}" added.`);
    }
    setModalOpen(false);
    setEditingProduct(null);
    // Backend integration: Upsert to Supabase products table with user_id
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    // Backend integration: Check for linked invoices/purchase bills before delete
    setProducts((prev) => prev.map((p) => p.id === deleteTarget.id ? { ...p, is_deleted: true } : p));
    toast.success(`Product "${deleteTarget.name}" deleted.`);
    setDeleteTarget(null);
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
    else setSelectedIds(new Set(paginated.map((p) => p.id)));
  };

  const summaryStats = useMemo(() => {
    const total = withStock.length;
    const available = withStock.filter((p) => p.stockStatus === 'Available').length;
    const low = withStock.filter((p) => p.stockStatus === 'Low Stock').length;
    const out = withStock.filter((p) => p.stockStatus === 'Out of Stock').length;
    const inventoryValue = withStock.reduce((s, p) => s + p.currentStock * p.purchasePrice, 0);
    return { total, available, low, out, inventoryValue };
  }, [withStock]);

  const categories = Array.from(new Set(withStock.map((p) => p.category)));

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {summaryStats.total} products · Inventory value: {formatIndianCurrency(summaryStats.inventoryValue)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors">
            <Upload size={14} />
            <span className="hidden sm:inline">Import CSV</span>
          </button>
          <button
            onClick={() => { setEditingProduct(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border shadow-card p-3">
          <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Total Products</p>
          <p className="text-2xl font-800 text-foreground font-tabular">{summaryStats.total}</p>
        </div>
        <div className="bg-card rounded-xl border shadow-card p-3">
          <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Available</p>
          <p className="text-2xl font-800 text-accent font-tabular">{summaryStats.available}</p>
        </div>
        <div className={`bg-card rounded-xl border shadow-card p-3 ${summaryStats.low > 0 ? 'border-l-4 border-l-warning' : ''}`}>
          <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Low Stock</p>
          <p className={`text-2xl font-800 font-tabular ${summaryStats.low > 0 ? 'text-warning' : 'text-muted-foreground'}`}>{summaryStats.low}</p>
        </div>
        <div className={`bg-card rounded-xl border shadow-card p-3 ${summaryStats.out > 0 ? 'border-l-4 border-l-danger' : ''}`}>
          <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Out of Stock</p>
          <p className={`text-2xl font-800 font-tabular ${summaryStats.out > 0 ? 'text-danger' : 'text-muted-foreground'}`}>{summaryStats.out}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card rounded-xl border shadow-card p-3 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, QR code, category, description…"
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

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-600 border rounded-lg transition-colors ${
              showFilters || categoryFilter !== 'All' || stockStatusFilter !== 'All' || gstFilter !== 'All' ?'border-primary bg-primary/5 text-primary' :'hover:bg-muted text-muted-foreground'
            }`}
          >
            <Filter size={14} />
            Filters
            {(categoryFilter !== 'All' || stockStatusFilter !== 'All' || gstFilter !== 'All') && (
              <span className="w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {[categoryFilter !== 'All', stockStatusFilter !== 'All', gstFilter !== 'All'].filter(Boolean).length}
              </span>
            )}
          </button>

          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <BarChart2 size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t animate-slide-up">
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 text-xs border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={`cat-filter-${c}`} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Stock Status</label>
              <select
                value={stockStatusFilter}
                onChange={(e) => { setStockStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 text-xs border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {ALL_STOCK_STATUSES.map((s) => (
                  <option key={`stock-filter-${s}`} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">GST Rate</label>
              <select
                value={gstFilter}
                onChange={(e) => { setGstFilter(e.target.value === 'All' ? 'All' : Number(e.target.value) as GSTRate); setCurrentPage(1); }}
                className="px-3 py-1.5 text-xs border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">All GST Rates</option>
                {GST_RATES.map((r) => (
                  <option key={`gst-filter-${r}`} value={r}>{r}%</option>
                ))}
              </select>
            </div>
            {(categoryFilter !== 'All' || stockStatusFilter !== 'All' || gstFilter !== 'All') && (
              <div className="flex items-end">
                <button
                  onClick={() => { setCategoryFilter('All'); setStockStatusFilter('All'); setGstFilter('All'); setCurrentPage(1); }}
                  className="px-3 py-1.5 text-xs font-600 text-danger hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stock status filter chips */}
      <div className="flex flex-wrap gap-2">
        {(['All', 'Available', 'Low Stock', 'Out of Stock'] as const).map((s) => {
          const count = s === 'All' ? filtered.length : filtered.filter((p) => p.stockStatus === s).length;
          return (
            <button
              key={`stock-chip-${s}`}
              onClick={() => { setStockStatusFilter(s); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-600 border transition-all btn-press ${
                stockStatusFilter === s
                  ? 'bg-primary text-white border-primary' :'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              {s} <span className="font-tabular">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5 animate-slide-up">
          <span className="text-sm font-600 text-primary">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 border rounded-lg hover:bg-muted transition-colors">
              Print Barcodes
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 text-danger border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={12} /> Delete Selected
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
                  className="text-left px-4 py-3 text-xs font-600 text-muted-foreground cursor-pointer hover:text-foreground select-none min-w-[160px]"
                  onClick={() => toggleSort('name')}
                >
                  Product Name <SortIcon field="name" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground min-w-[100px]">Category</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground min-w-[120px]">QR / Barcode</th>
                <th
                  className="text-right px-4 py-3 text-xs font-600 text-muted-foreground cursor-pointer hover:text-foreground select-none min-w-[110px]"
                  onClick={() => toggleSort('salePrice')}
                >
                  Sale Price (MRP) <SortIcon field="salePrice" />
                </th>
                <th
                  className="text-right px-4 py-3 text-xs font-600 text-muted-foreground cursor-pointer hover:text-foreground select-none min-w-[110px]"
                  onClick={() => toggleSort('purchasePrice')}
                >
                  Purchase Price <SortIcon field="purchasePrice" />
                </th>
                <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground w-16">GST%</th>
                <th
                  className="text-right px-4 py-3 text-xs font-600 text-muted-foreground cursor-pointer hover:text-foreground select-none w-20"
                  onClick={() => toggleSort('currentStock')}
                >
                  Stock <SortIcon field="currentStock" />
                </th>
                <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground min-w-[100px]">Status</th>
                <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <EmptyState
                      icon={Boxes}
                      title="No products found"
                      description="No products match your search or filters. Add a new product or clear your filters."
                      actionLabel="Add Product"
                      onAction={() => { setEditingProduct(null); setModalOpen(true); }}
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((product, i) => {
                  const stockVariant = product.stockStatus === 'Available' ? 'available' : product.stockStatus === 'Low Stock' ? 'low' : 'out';
                  const margin = product.purchasePrice > 0
                    ? ((product.salePrice / (1 + product.gstRate / 100) - product.purchasePrice) / product.purchasePrice * 100)
                    : null;

                  return (
                    <tr
                      key={`prod-row-${product.id}`}
                      className={`border-b last:border-b-0 row-hover transition-colors group ${
                        i % 2 === 1 ? 'bg-muted/20' : ''
                      } ${selectedIds.has(product.id) ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-600 text-foreground truncate max-w-[180px]">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{product.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 bg-secondary text-secondary-foreground">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{product.qr}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-700 text-foreground font-tabular">{formatIndianCurrency(product.salePrice)}</span>
                        <p className="text-xs text-muted-foreground">incl. GST</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-600 text-foreground font-tabular">{formatIndianCurrency(product.purchasePrice)}</span>
                        <p className="text-xs text-muted-foreground">before tax</p>
                        {margin !== null && (
                          <p className={`text-xs font-600 font-tabular ${margin >= 0 ? 'text-accent' : 'text-danger'}`}>
                            {margin >= 0 ? '+' : ''}{margin.toFixed(1)}% margin
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 bg-blue-50 text-blue-700">
                          {product.gstRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-800 font-tabular ${
                          product.currentStock === 0 ? 'text-danger' :
                          product.currentStock <= 5 ? 'text-warning' : 'text-foreground'
                        }`}>
                          {product.currentStock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={stockVariant} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditingProduct(product); setModalOpen(true); }}
                            title="Edit product"
                            className="p-1.5 rounded hover:bg-muted transition-colors"
                          >
                            <Edit2 size={14} className="text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            title="Delete product — only allowed if no linked invoices"
                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                  <option key={`prod-pagesize-${n}`} value={n}>{n}</option>
                ))}
              </select>
              <span>of {filtered.length} products</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-muted transition-colors"
              >«</button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-muted transition-colors"
              >‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={`prod-page-${page}`}
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
              >›</button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-muted transition-colors"
              >»</button>
            </div>
          </div>
        )}
      </div>

      {/* Product form modal */}
      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          existingQRCodes={products.filter((p) => !p.is_deleted && p.id !== editingProduct?.id).map((p) => p.qr)}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => { setModalOpen(false); setEditingProduct(null); }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Product"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone. Products with linked invoices, purchase bills, or stock records cannot be deleted.`}
        confirmLabel="Delete Product"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}