'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, AlertCircle } from 'lucide-react';
import { Invoice } from '@/lib/mockData';
import { formatIndianCurrency, todayISO } from '@/lib/formatters';

interface ReceiveBalanceModalProps {
  invoice: Invoice;
  onSave: (invoice: Invoice, amount: number, method: 'Cash' | 'UPI' | 'Bank', note: string) => void;
  onClose: () => void;
}

interface FormData {
  amount: number;
  method: 'Cash' | 'UPI' | 'Bank';
  date: string;
  note: string;
}

export default function ReceiveBalanceModal({ invoice, onSave, onClose }: ReceiveBalanceModalProps) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      amount: invoice.balanceDue,
      method: 'Cash',
      date: todayISO(),
      note: '',
    },
  });

  const watchedAmount = watch('amount');

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    onSave(invoice, Number(data.amount), data.method, data.note);
    // Backend integration: Insert into invoice_payments table, update invoice cashPaid/upiPaid/bankPaid
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 modal-overlay">
      <div className="bg-card rounded-xl shadow-modal w-full max-w-md modal-content">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-base font-700 text-foreground">Receive Balance Payment</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Invoice {invoice.invoiceNumber} · {invoice.customerName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Current balance */}
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-600 text-danger">Current Balance Due</span>
            <span className="text-lg font-800 text-danger font-tabular">{formatIndianCurrency(invoice.balanceDue)}</span>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-600 text-foreground mb-1">
              Amount to Receive (₹) <span className="text-danger">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-1.5">Defaults to full balance. Partial payment is allowed.</p>
            <input
              type="number"
              min="0.01"
              step="0.01"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
                max: { value: invoice.balanceDue, message: `Cannot exceed balance due of ${formatIndianCurrency(invoice.balanceDue)}` },
              })}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-tabular text-lg font-700"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-danger flex items-center gap-1">
                <AlertCircle size={10} />{errors.amount.message}
              </p>
            )}
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-xs font-600 text-foreground mb-1">
              Payment Method <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'UPI', 'Bank'] as const).map((m) => (
                <label
                  key={`method-${m}`}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-lg cursor-pointer transition-all text-sm font-600 ${
                    watch('method') === m ? 'border-primary bg-primary/5 text-primary' : 'hover:border-primary/40 text-muted-foreground'
                  }`}
                >
                  <input type="radio" {...register('method', { required: true })} value={m} className="sr-only" />
                  {m}
                </label>
              ))}
            </div>
            {errors.method && (
              <p className="mt-1 text-xs text-danger flex items-center gap-1"><AlertCircle size={10} />Select a payment method</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-600 text-foreground mb-1">Date</label>
            <input
              type="date"
              {...register('date', { required: true })}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-600 text-foreground mb-1">Note (optional)</label>
            <input
              type="text"
              placeholder="e.g. Received via NEFT, ref no. 12345"
              {...register('note')}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Remaining preview */}
          {Number(watchedAmount) > 0 && Number(watchedAmount) <= invoice.balanceDue && (
            <div className="bg-muted/30 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Remaining after this payment</span>
              <span className={`text-sm font-700 font-tabular ${invoice.balanceDue - Number(watchedAmount) <= 0 ? 'text-accent' : 'text-warning'}`}>
                {formatIndianCurrency(Math.max(0, invoice.balanceDue - Number(watchedAmount)))}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-600 bg-accent text-white rounded-lg hover:opacity-90 btn-press transition-all disabled:opacity-60 min-w-[120px] justify-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}