'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus, Trash2, ChevronDown, Search, AlertCircle } from 'lucide-react';
import { Customer, Invoice, InvoiceLine, GSTRate, mockProducts, getNextInvoiceNumber } from '@/lib/mockData';
import { formatIndianCurrency, todayISO } from '@/lib/formatters';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface InvoiceFormDrawerProps {
  invoice: Invoice | null;
  customers: Customer[];
  onSave: (invoice: Invoice) => void;
  onClose: () => void;
}

interface LineFormData {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  discountPct: number;
  gstPct: GSTRate;
}

interface FormData {
  invoiceNumber: string;
  date: string;
  customerId: string;
  lines: LineFormData[];
  finalDiscount: number;
  cashPaid: number;
  upiPaid: number;
  bankPaid: number;
}

const GST_RATES: GSTRate[] = [0, 5, 12, 18, 28];

function calcLine(qty: number, rate: number, discPct: number, gstPct: number) {
  const gross = qty * rate;
  const discountAmount = gross * (discPct / 100);
  const afterDiscount = gross - discountAmount;
  const taxableAmount = afterDiscount / (1 + gstPct / 100);
  const gstAmount = afterDiscount - taxableAmount;
  return { gross, discountAmount, afterDiscount, taxableAmount: Math.round(taxableAmount * 100) / 100, gstAmount: Math.round(gstAmount * 100) / 100, lineTotal: Math.round(afterDiscount * 100) / 100 };
}

export default function InvoiceFormDrawer({ invoice, customers, onSave, onClose }: InvoiceFormDrawerProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerDropOpen, setCustomerDropOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productDropOpenIdx, setProductDropOpenIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const defaultValues: FormData = invoice ? {
    invoiceNumber: invoice.invoiceNumber,
    date: invoice.date,
    customerId: invoice.customerId ?? '',
    lines: invoice.lines.map((l) => ({
      productId: l.productId,
      productName: l.productName,
      quantity: l.quantity,
      rate: l.rate,
      discountPct: l.discountPct,
      gstPct: l.gstPct
    })),
    finalDiscount: invoice.finalDiscount,
    cashPaid: invoice.cashPaid,
    upiPaid: invoice.upiPaid,
    bankPaid: invoice.bankPaid
  } : {
    invoiceNumber: getNextInvoiceNumber(),
    date: todayISO(),
    customerId: '',
    lines: [],
    finalDiscount: 0,
    cashPaid: 0,
    upiPaid: 0,
    bankPaid: 0
  };

  const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm<FormData>({ defaultValues });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  const watchedLines = watch('lines');
  const watchedFinalDiscount = watch('finalDiscount') || 0;
  const watchedCash = watch('cashPaid') || 0;
  const watchedUpi = watch('upiPaid') || 0;
  const watchedBank = watch('bankPaid') || 0;
  const watchedCustomerId = watch('customerId');

  const selectedCustomer = customers.find((c) => c.id === watchedCustomerId);

  const lineCalcs = watchedLines.map((l) =>
  calcLine(Number(l.quantity) || 0, Number(l.rate) || 0, Number(l.discountPct) || 0, Number(l.gstPct) || 0)
  );

  const subtotal = lineCalcs.reduce((s, c) => s + c.taxableAmount, 0);
  const totalDiscount = lineCalcs.reduce((s, c) => s + c.discountAmount, 0);
  const totalGST = lineCalcs.reduce((s, c) => s + c.gstAmount, 0);
  const grandTotal = lineCalcs.reduce((s, c) => s + c.lineTotal, 0);
  const finalDiscountNum = Math.min(Number(watchedFinalDiscount) || 0, grandTotal);
  const grandTotalAfterDiscount = grandTotal - finalDiscountNum;
  const totalPaid = (Number(watchedCash) || 0) + (Number(watchedUpi) || 0) + (Number(watchedBank) || 0);
  const balanceDue = Math.max(0, grandTotalAfterDiscount - totalPaid);
  const paymentStatus = balanceDue <= 0 ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Pending';

  const addProduct = useCallback((productId: string, idx?: number) => {
    const product = mockProducts.find((p) => p.id === productId);
    if (!product) return;
    if (idx !== undefined) {
      setValue(`lines.${idx}.productId`, product.id);
      setValue(`lines.${idx}.productName`, product.name);
      setValue(`lines.${idx}.rate`, product.salePrice);
      setValue(`lines.${idx}.discountPct`, product.defaultDiscount);
      setValue(`lines.${idx}.gstPct`, product.gstRate);
      setProductDropOpenIdx(null);
    } else {
      append({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        rate: product.salePrice,
        discountPct: product.defaultDiscount,
        gstPct: product.gstRate
      });
    }
    setProductSearch('');
  }, [append, setValue]);

  const onSubmit = async (data: FormData) => {
    if (data.lines.length === 0) {
      toast.error('Add at least one product line to save the invoice.');
      return;
    }
    if (totalPaid > grandTotalAfterDiscount) {
      toast.error('Total paid cannot exceed Grand Total. Overpayment is not allowed.');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const builtLines: InvoiceLine[] = data.lines.map((l, i) => {
      const c = lineCalcs[i];
      return {
        id: invoice?.lines[i]?.id ?? `il-${uuidv4().slice(0, 8)}`,
        productId: l.productId,
        productName: l.productName,
        quantity: Number(l.quantity),
        rate: Number(l.rate),
        discountPct: Number(l.discountPct),
        gstPct: l.gstPct,
        ...c
      };
    });

    const now = new Date().toISOString();
    const saved: Invoice = {
      id: invoice?.id ?? uuidv4(),
      invoiceNumber: data.invoiceNumber,
      date: data.date,
      customerId: data.customerId || null,
      customerName: selectedCustomer?.name ?? 'Walk-in Customer',
      lines: builtLines,
      subtotal: Math.round(subtotal * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      totalGST: Math.round(totalGST * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      finalDiscount: finalDiscountNum,
      grandTotalAfterDiscount: Math.round(grandTotalAfterDiscount * 100) / 100,
      cashPaid: Number(data.cashPaid) || 0,
      upiPaid: Number(data.upiPaid) || 0,
      bankPaid: Number(data.bankPaid) || 0,
      balanceDue: Math.round(balanceDue * 100) / 100,
      status: paymentStatus as 'Paid' | 'Partial' | 'Pending',
      is_deleted: false,
      created_at: invoice?.created_at ?? now,
      updated_at: now
    };

    setSaving(false);
    onSave(saved);
    // Backend integration: Upsert invoice and lines to Supabase with user_id
  };

  const filteredCustomers = customers.filter((c) =>
  !c.is_deleted && (c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch))
  );

  const filteredProducts = mockProducts.filter((p) =>
  !p.is_deleted && (
  p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
  p.qr.toLowerCase().includes(productSearch.toLowerCase()) ||
  p.category.toLowerCase().includes(productSearch.toLowerCase()))

  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40 animate-fade-in" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-2xl bg-card h-full overflow-y-auto shadow-modal flex flex-col animate-slide-up scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-base font-700 text-foreground">
              {invoice ? `Edit Invoice — ${invoice.invoiceNumber}` : 'New Sale Invoice'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {invoice ? 'Update invoice details and recalculate totals' : 'Create a GST-compliant invoice'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="flex-1 p-5 space-y-5">

            {/* Invoice details row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-600 text-foreground mb-1">
                  Invoice Number <span className="text-danger">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-1.5">Auto-generated. Edit if needed.</p>
                <input
                  {...register('invoiceNumber', { required: 'Invoice number is required' })}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono" />

                {errors.invoiceNumber &&
                <p className="mt-1 text-xs text-danger flexitems-center gap-1"><AlertCircle size={10} />{errors.invoiceNumber.message}</p>
                }
              </div>
              <div>
                <label className="block text-xs font-600 text-foreground mb-1">
                  Invoice Date <span className="text-danger">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-1.5">Date of sale transaction.</p>
                <input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />

                {errors.date &&
                <p className="mt-1 text-xs text-danger flex items-center gap-1"><AlertCircle size={10} />{errors.date.message}</p>
                }
              </div>
            </div>

            {/* Customer selection */}
            <div>
              <label className="block text-xs font-600 text-foreground mb-1">Customer</label>
              <p className="text-xs text-muted-foreground mb-1.5">Leave blank for walk-in / cash sale.</p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCustomerDropOpen(!customerDropOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg bg-background hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30">

                  <span className={selectedCustomer ? 'text-foreground font-500' : 'text-muted-foreground'}>
                    {selectedCustomer ? selectedCustomer.name : 'Select customer or leave blank for cash sale'}
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />
                </button>
                {customerDropOpen &&
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-card-md z-20 max-h-56 overflow-y-auto scrollbar-thin animate-scale-in">
                    <div className="p-2 border-b sticky top-0 bg-card">
                      <div className="relative">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                        autoFocus
                        type="text"
                        placeholder="Search customer…"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary" />

                      </div>
                    </div>
                    <button
                    type="button"
                    onClick={() => {setValue('customerId', '');setCustomerDropOpen(false);setCustomerSearch('');}}
                    className="w-full text-left px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors">

                      Walk-in / Cash Sale (no customer)
                    </button>
                    {filteredCustomers.map((c) =>
                  <button
                    key={`cust-opt-${c.id}`}
                    type="button"
                    onClick={() => {setValue('customerId', c.id);setCustomerDropOpen(false);setCustomerSearch('');}}
                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors">

                        <p className="text-xs font-600 text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone}{c.gstin ? ` · ${c.gstin}` : ''}</p>
                      </button>
                  )}
                    {filteredCustomers.length === 0 &&
                  <p className="px-3 py-4 text-xs text-muted-foreground text-center">No customers found</p>
                  }
                  </div>
                }
              </div>
              {selectedCustomer &&
              <div className="mt-2 p-2.5 bg-muted/40 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs font-600 text-foreground">{selectedCustomer.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedCustomer.phone} · {selectedCustomer.address || 'No address'}</p>
                  </div>
                  {selectedCustomer.gstin &&
                <span className="text-xs font-mono text-muted-foreground bg-card border px-2 py-0.5 rounded">{selectedCustomer.gstin}</span>
                }
                </div>
              }
            </div>

            {/* Line items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-600 text-foreground">
                  Invoice Items <span className="text-danger">*</span>
                </label>
                <span className="text-xs text-muted-foreground">{fields.length} item{fields.length !== 1 ? 's' : ''}</span>
              </div>

              {fields.length === 0 &&
              <div className="border border-dashed rounded-lg p-6 text-center mb-3">
                  <p className="text-xs text-muted-foreground">No items added yet. Add a product below.</p>
                </div>
              }

              {fields.length > 0 &&
              <div className="border rounded-lg overflow-hidden mb-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/40 border-b">
                          <th className="text-left px-3 py-2 font-600 text-muted-foreground min-w-[140px]">Product</th>
                          <th className="text-right px-3 py-2 font-600 text-muted-foreground w-16">Qty</th>
                          <th className="text-right px-3 py-2 font-600 text-muted-foreground w-24">Rate (MRP)</th>
                          <th className="text-right px-3 py-2 font-600 text-muted-foreground w-16">Disc%</th>
                          <th className="text-right px-3 py-2 font-600 text-muted-foreground w-16">GST%</th>
                          <th className="text-right px-3 py-2 font-600 text-muted-foreground w-24">Taxable</th>
                          <th className="text-right px-3 py-2 font-600 text-muted-foreground w-20">GST Amt</th>
                          <th className="text-right px-3 py-2 font-600 text-muted-foreground w-24">Line Total</th>
                          <th className="w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((field, idx) => {
                        const calc = lineCalcs[idx] || { taxableAmount: 0, gstAmount: 0, lineTotal: 0 };
                        return (
                          <tr key={`line-${field.id}`} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                              <td className="px-3 py-2">
                                <div className="relative">
                                  <button
                                  type="button"
                                  onClick={() => {setProductDropOpenIdx(productDropOpenIdx === idx ? null : idx);setProductSearch('');}}
                                  className="w-full text-left text-xs font-500 text-foreground hover:text-primary transition-colors truncate max-w-[130px] block">

                                    {watchedLines[idx]?.productName || 'Select product'}
                                  </button>
                                  {productDropOpenIdx === idx &&
                                <div className="absolute top-full left-0 w-64 mt-1 bg-card border rounded-lg shadow-card-md z-30 max-h-48 overflow-y-auto scrollbar-thin animate-scale-in">
                                      <div className="p-2 border-b sticky top-0 bg-card">
                                        <input
                                      autoFocus
                                      type="text"
                                      placeholder="Search product…"
                                      value={productSearch}
                                      onChange={(e) => setProductSearch(e.target.value)}
                                      className="w-full px-2 py-1.5 text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary" />

                                      </div>
                                      {filteredProducts.map((p) =>
                                  <button
                                    key={`prod-opt-${p.id}-${idx}`}
                                    type="button"
                                    onClick={() => addProduct(p.id, idx)}
                                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors">

                                          <p className="text-xs font-600 text-foreground">{p.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {formatIndianCurrency(p.salePrice)} · GST {p.gstRate}% · {p.category}
                                          </p>
                                        </button>
                                  )}
                                    </div>
                                }
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                {...register(`lines.${idx}.quantity`, { min: { value: 0.01, message: 'Qty > 0' } })}
                                className="w-full text-right px-1.5 py-1 text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary font-tabular" />

                              </td>
                              <td className="px-3 py-2">
                                <input
                                type="number"
                                min="0"
                                step="0.01"
                                {...register(`lines.${idx}.rate`, { min: { value: 0, message: 'Rate >= 0' } })}
                                className="w-full text-right px-1.5 py-1 text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary font-tabular" />

                              </td>
                              <td className="px-3 py-2">
                                <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                {...register(`lines.${idx}.discountPct`, { min: 0, max: 100 })}
                                className="w-full text-right px-1.5 py-1 text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary font-tabular pr-[13px]" />

                              </td>
                              <td className="px-3 py-2">
                                <select
                                {...register(`lines.${idx}.gstPct`)}
                                className="w-full text-right px-1 py-1 text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary">

                                  {GST_RATES.map((r) =>
                                <option key={`gst-opt-${r}-${idx}`} value={r}>{r}%</option>
                                )}
                                </select>
                              </td>
                              <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                                {formatIndianCurrency(calc.taxableAmount)}
                              </td>
                              <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                                {formatIndianCurrency(calc.gstAmount)}
                              </td>
                              <td className="px-3 py-2 text-right font-700 font-tabular text-foreground">
                                {formatIndianCurrency(calc.lineTotal)}
                              </td>
                              <td className="px-3 py-2">
                                <button
                                type="button"
                                onClick={() => remove(idx)}
                                className="p-1 rounded hover:bg-red-50 transition-colors"
                                title="Remove line">

                                  <Trash2 size={12} className="text-danger" />
                                </button>
                              </td>
                            </tr>);

                      })}
                      </tbody>
                    </table>
                  </div>
                </div>
              }

              {/* Add product quick-picker */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Type product name or QR to add…"
                      value={productSearch}
                      onChange={(e) => {setProductSearch(e.target.value);setProductDropOpenIdx(-1);}}
                      onFocus={() => setProductDropOpenIdx(-1)}
                      className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />

                  </div>
                  <button
                    type="button"
                    onClick={() => append({ productId: '', productName: '', quantity: 1, rate: 0, discountPct: 0, gstPct: 18 })}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-600 border border-dashed rounded-lg hover:bg-muted transition-colors text-muted-foreground">

                    <Plus size={12} />
                    Blank line
                  </button>
                </div>
                {productDropOpenIdx === -1 && productSearch &&
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-card-md z-20 max-h-48 overflow-y-auto scrollbar-thin animate-scale-in">
                    {filteredProducts.length === 0 ?
                  <p className="px-3 py-4 text-xs text-muted-foreground text-center">No products match &quot;{productSearch}&quot;</p> :

                  filteredProducts.map((p) =>
                  <button
                    key={`add-prod-${p.id}`}
                    type="button"
                    onClick={() => {addProduct(p.id);setProductDropOpenIdx(null);}}
                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors border-b last:border-b-0">

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-600 text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.category} · QR: {p.qr}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-700 text-foreground font-tabular">{formatIndianCurrency(p.salePrice)}</p>
                              <p className="text-xs text-muted-foreground">GST {p.gstRate}%</p>
                            </div>
                          </div>
                        </button>
                  )
                  }
                  </div>
                }
              </div>
            </div>

            {/* GST Breakdown */}
            {fields.length > 0 &&
            <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p className="text-xs font-700 text-foreground mb-3">GST Breakdown</p>
                {GST_RATES.filter((rate) => watchedLines.some((l) => Number(l.gstPct) === rate)).map((rate) => {
                const rateLines = watchedLines.map((l, i) => ({ l, calc: lineCalcs[i] })).filter(({ l }) => Number(l.gstPct) === rate);
                const taxable = rateLines.reduce((s, { calc }) => s + calc.taxableAmount, 0);
                const gst = rateLines.reduce((s, { calc }) => s + calc.gstAmount, 0);
                return (
                  <div key={`gst-breakdown-${rate}`} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">GST @ {rate}%</span>
                      <div className="flex items-center gap-6">
                        <span className="text-muted-foreground font-tabular">Taxable: {formatIndianCurrency(taxable)}</span>
                        <span className="font-600 text-foreground font-tabular">Tax: {formatIndianCurrency(gst)}</span>
                      </div>
                    </div>);

              })}
                <div className="border-t pt-2 mt-2 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subtotal (Taxable)</span>
                    <span className="font-tabular text-foreground">{formatIndianCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total Discount</span>
                    <span className="font-tabular text-danger">−{formatIndianCurrency(totalDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total GST</span>
                    <span className="font-tabular text-foreground">{formatIndianCurrency(totalGST)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-700 border-t pt-2">
                    <span className="text-foreground">Grand Total</span>
                    <span className="font-tabular text-foreground">{formatIndianCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            }

            {/* Final discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-600 text-foreground mb-1">Final Discount (₹)</label>
                <p className="text-xs text-muted-foreground mb-1.5">Extra discount on whole invoice. Cannot exceed Grand Total.</p>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('finalDiscount', { min: 0 })}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-tabular" />

              </div>
              <div className="flex flex-col justify-end">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Grand Total after Discount</p>
                  <p className="text-xl font-800 text-primary font-tabular">{formatIndianCurrency(grandTotalAfterDiscount)}</p>
                </div>
              </div>
            </div>

            {/* Payment split */}
            <div>
              <label className="block text-xs font-700 text-foreground mb-2">Payment Received</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Cash (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('cashPaid', { min: 0 })}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-tabular" />

                </div>
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">UPI (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('upiPaid', { min: 0 })}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-tabular" />

                </div>
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Bank (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('bankPaid', { min: 0 })}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-tabular" />

                </div>
              </div>
              {totalPaid > grandTotalAfterDiscount &&
              <p className="mt-2 text-xs text-danger flex items-center gap-1">
                  <AlertCircle size={12} /> Total paid ({formatIndianCurrency(totalPaid)}) exceeds Grand Total. Overpayment is not allowed.
                </p>
              }
            </div>

            {/* Balance due summary */}
            <div className={`rounded-xl p-4 flex items-center justify-between ${balanceDue > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <div>
                <p className="text-xs font-600 text-muted-foreground">Balance Due</p>
                <p className={`text-2xl font-800 font-tabular ${balanceDue > 0 ? 'text-danger' : 'text-accent'}`}>
                  {formatIndianCurrency(balanceDue)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Payment Status</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-700 mt-1 ${
                paymentStatus === 'Paid' ? 'status-paid' : paymentStatus === 'Partial' ? 'status-partial' : 'status-pending'}`
                }>
                  {paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 bg-card border-t px-5 py-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors">

              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5">

                Preview
              </button>
              <button
                type="submit"
                disabled={saving || totalPaid > grandTotalAfterDiscount}
                className="flex items-center gap-2 px-5 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all disabled:opacity-60 disabled:cursor-not-allowed min-w-[120px] justify-center">

                {saving ?
                <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </> :

                invoice ? 'Update Invoice' : 'Save Invoice'
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>);

}