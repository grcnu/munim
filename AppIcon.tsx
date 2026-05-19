'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, AlertCircle, Info } from 'lucide-react';
import { Product, GSTRate } from '@/lib/mockData';
import { formatIndianCurrency } from '@/lib/formatters';
import { v4 as uuidv4 } from 'uuid';

interface ProductFormModalProps {
  product: (Product & { currentStock?: number }) | null;
  existingQRCodes: string[];
  categories: string[];
  onSave: (product: Product) => void;
  onClose: () => void;
}

interface FormData {
  name: string;
  qr: string;
  category: string;
  customCategory: string;
  description: string;
  salePrice: number;
  purchasePrice: number;
  gstRate: GSTRate;
  defaultDiscount: number;
  openingStock: number;
}

const GST_RATES: GSTRate[] = [0, 5, 12, 18, 28];

export default function ProductFormModal({ product, existingQRCodes, categories, onSave, onClose }: ProductFormModalProps) {
  const [saving, setSaving] = useState(false);
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  const defaultValues: FormData = product ? {
    name: product.name,
    qr: product.qr,
    category: product.category,
    customCategory: '',
    description: product.description,
    salePrice: product.salePrice,
    purchasePrice: product.purchasePrice,
    gstRate: product.gstRate,
    defaultDiscount: product.defaultDiscount,
    openingStock: product.openingStock,
  } : {
    name: '',
    qr: '',
    category: categories[0] || '',
    customCategory: '',
    description: '',
    salePrice: 0,
    purchasePrice: 0,
    gstRate: 18,
    defaultDiscount: 0,
    openingStock: 0,
  };

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({ defaultValues });

  const watchedSalePrice = watch('salePrice') || 0;
  const watchedGstRate = watch('gstRate') || 0;
  const watchedPurchasePrice = watch('purchasePrice') || 0;

  // GST-inclusive sale price → taxable
  const salePriceTaxable = Number(watchedSalePrice) / (1 + Number(watchedGstRate) / 100);
  const salePriceGST = Number(watchedSalePrice) - salePriceTaxable;
  const marginAmount = salePriceTaxable - Number(watchedPurchasePrice);
  const marginPct = Number(watchedPurchasePrice) > 0 ? (marginAmount / Number(watchedPurchasePrice)) * 100 : null;

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const now = new Date().toISOString();
    const finalCategory = useCustomCategory && data.customCategory.trim() ? data.customCategory.trim() : data.category;
    const saved: Product = {
      id: product?.id ?? uuidv4(),
      name: data.name.trim(),
      qr: data.qr.trim(),
      category: finalCategory,
      description: data.description.trim(),
      salePrice: Math.round(Number(data.salePrice) * 100) / 100,
      purchasePrice: Math.round(Number(data.purchasePrice) * 100) / 100,
      gstRate: Number(data.gstRate) as GSTRate,
      defaultDiscount: Math.round(Number(data.defaultDiscount) * 100) / 100,
      openingStock: Math.round(Number(data.openingStock) * 100) / 100,
      is_deleted: false,
      created_at: product?.created_at ?? now,
      updated_at: now,
    };
    setSaving(false);
    onSave(saved);
    // Backend integration: Upsert to Supabase products table with user_id
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 modal-overlay">
      <div className="bg-card rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-content scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-base font-700 text-foreground">
              {product ? `Edit Product — ${product.name}` : 'Add New Product'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {product ? 'Update product details. Sale Price is always GST-inclusive.' : 'All Sale Prices are GST-inclusive (MRP). Purchase Price is before tax.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

          {/* Pricing rule notice */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <strong>Pricing Rule:</strong> Sale Price (MRP) always includes GST. Purchase Price is always before tax — GST is added on top during purchase billing. There is no toggle.
            </p>
          </div>

          {/* Basic info */}
          <div>
            <h3 className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-600 text-foreground mb-1">
                  Product Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Basmati Rice 5kg"
                  {...register('name', { required: 'Product name is required', validate: (v) => v.trim().length > 0 || 'Name cannot be blank' })}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {errors.name && <p className="mt-1 text-xs text-danger flex items-center gap-1"><AlertCircle size={10} />{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground mb-1">
                  QR / Barcode Value <span className="text-danger">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-1.5">Must be unique across all products. Used for scanning.</p>
                <input
                  type="text"
                  placeholder="e.g. RICE-BASMATI-5KG"
                  {...register('qr', {
                    required: 'QR/Barcode value is required',
                    validate: (v) => {
                      if (!v.trim()) return 'QR code cannot be blank';
                      if (existingQRCodes.includes(v.trim())) return 'This QR/barcode value is already used by another product';
                      return true;
                    },
                  })}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
                />
                {errors.qr && <p className="mt-1 text-xs text-danger flex items-center gap-1"><AlertCircle size={10} />{errors.qr.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground mb-1">Category</label>
                <p className="text-xs text-muted-foreground mb-1.5">Group similar products for filtering and reports.</p>
                {!useCustomCategory ? (
                  <div className="flex gap-2">
                    <select
                      {...register('category')}
                      className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      {categories.map((c) => (
                        <option key={`cat-opt-${c}`} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setUseCustomCategory(true)}
                      className="px-3 py-2 text-xs font-600 border border-dashed rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    >
                      + New
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter new category name"
                      {...register('customCategory')}
                      className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setUseCustomCategory(false)}
                      className="px-3 py-2 text-xs font-600 border rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    >
                      Existing
                    </button>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-600 text-foreground mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Premium aged basmati rice, 5kg pack"
                  {...register('description')}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-3">Pricing & Tax</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-600 text-foreground mb-1">
                  Sale Price / MRP (₹) <span className="text-danger">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-1.5">Customer-facing price. Always GST-inclusive.</p>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('salePrice', {
                    required: 'Sale price is required',
                    min: { value: 0, message: 'Sale price must be >= 0' },
                  })}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-tabular"
                />
                {errors.salePrice && <p className="mt-1 text-xs text-danger flex items-center gap-1"><AlertCircle size={10} />{errors.salePrice.message}</p>}
                {Number(watchedSalePrice) > 0 && (
                  <div className="mt-1.5 text-xs text-muted-foreground space-y-0.5">
                    <p>Taxable: <span className="font-tabular font-600 text-foreground">{formatIndianCurrency(salePriceTaxable)}</span></p>
                    <p>GST ({watchedGstRate}%): <span className="font-tabular font-600 text-foreground">{formatIndianCurrency(salePriceGST)}</span></p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground mb-1">Purchase Price (₹)</label>
                <p className="text-xs text-muted-foreground mb-1.5">Your cost from supplier. Before tax. GST added on top in bills.</p>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('purchasePrice', { min: { value: 0, message: 'Must be >= 0' } })}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-tabular"
                />
                {errors.purchasePrice && <p className="mt-1 text-xs text-danger flex items-center gap-1"><AlertCircle size={10} />{errors.purchasePrice.message}</p>}
                {marginPct !== null && (
                  <p className={`mt-1.5 text-xs font-600 font-tabular ${marginPct >= 0 ? 'text-accent' : 'text-danger'}`}>
                    Margin: {marginPct >= 0 ? '+' : ''}{marginPct.toFixed(1)}% ({marginPct >= 0 ? '+' : ''}{formatIndianCurrency(marginAmount)})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground mb-1">
                  GST Rate <span className="text-danger">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-1.5">Applicable GST slab for this product.</p>
                <select
                  {...register('gstRate', { required: true })}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {GST_RATES.map((r) => (
                    <option key={`gst-modal-${r}`} value={r}>{r}% GST</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-600 text-foreground mb-1">Default Discount %</label>
                <p className="text-xs text-muted-foreground mb-1.5">Pre-filled on invoice lines. Can be edited per invoice.</p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  {...register('defaultDiscount', {
                    min: { value: 0, message: 'Min 0%' },
                    max: { value: 100, message: 'Max 100%' },
                  })}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-tabular"
                />
                {errors.defaultDiscount && <p className="mt-1 text-xs text-danger flex items-center gap-1"><AlertCircle size={10} />{errors.defaultDiscount.message}</p>}
              </div>
            </div>
          </div>

          {/* Stock */}
          <div>
            <h3 className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-3">Opening Stock</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-600 text-foreground mb-1">Opening Stock Quantity</label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Stock count before you started using Gonabhavi. Current stock is always calculated live from all transactions.
                </p>
                <input
                  type="number"
                  min="0"
                  step="1"
                  {...register('openingStock', { min: { value: 0, message: 'Opening stock must be >= 0' } })}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-tabular"
                />
                {errors.openingStock && <p className="mt-1 text-xs text-danger flex items-center gap-1"><AlertCircle size={10} />{errors.openingStock.message}</p>}
              </div>
              <div className="flex flex-col justify-end">
                <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground">
                  <p className="font-600 text-foreground mb-1">Stock Calculation</p>
                  <p>Current Stock = Opening Stock + Purchased − Sold + Sales Returns − Purchase Returns + Adjustments</p>
                  <p className="mt-1 text-xs">Stock is never stored — computed live from all transactions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing summary preview */}
          {Number(watchedSalePrice) > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-xs font-700 text-primary mb-3">Pricing Summary Preview</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Sale Price (MRP)</p>
                  <p className="font-800 text-foreground font-tabular">{formatIndianCurrency(Number(watchedSalePrice))}</p>
                  <p className="text-muted-foreground">incl. GST</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taxable Amount</p>
                  <p className="font-700 text-foreground font-tabular">{formatIndianCurrency(salePriceTaxable)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">GST @ {watchedGstRate}%</p>
                  <p className="font-700 text-foreground font-tabular">{formatIndianCurrency(salePriceGST)}</p>
                </div>
                {marginPct !== null && (
                  <div>
                    <p className="text-muted-foreground">Gross Margin</p>
                    <p className={`font-700 font-tabular ${marginPct >= 0 ? 'text-accent' : 'text-danger'}`}>
                      {marginPct >= 0 ? '+' : ''}{marginPct.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-card border-t px-6 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all disabled:opacity-60 disabled:cursor-not-allowed min-w-[140px] justify-center"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : (
              product ? 'Update Product' : 'Save Product'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}