'use client';

import React from 'react';
import { X, Edit2, Printer, Share2, ReceiptText } from 'lucide-react';
import { Invoice } from '@/lib/mockData';
import { formatIndianCurrency, formatDate } from '@/lib/formatters';
import StatusBadge from '@/components/ui/StatusBadge';

interface InvoiceDetailPanelProps {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
  onReceiveBalance: () => void;
}

export default function InvoiceDetailPanel({ invoice, onClose, onEdit, onReceiveBalance }: InvoiceDetailPanelProps) {
  const statusVariant = invoice.status === 'Paid' ? 'paid' : invoice.status === 'Partial' ? 'partial' : 'pending';

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="w-full max-w-xl bg-card h-full overflow-y-auto shadow-modal flex flex-col animate-slide-up scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base font-700 text-foreground font-mono">{invoice.invoiceNumber}</h2>
              <p className="text-xs text-muted-foreground">{formatDate(invoice.date)}</p>
            </div>
            <StatusBadge status={statusVariant} />
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Edit invoice">
              <Edit2 size={15} className="text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Print invoice">
              <Printer size={15} className="text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Share as PDF">
              <Share2 size={15} className="text-muted-foreground" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-5">
          {/* Customer info */}
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-2">Customer</p>
            <p className="text-sm font-700 text-foreground">{invoice.customerName}</p>
          </div>

          {/* Line items */}
          <div>
            <p className="text-xs font-700 text-foreground mb-2">Items ({invoice.lines.length})</p>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-left px-3 py-2 font-600 text-muted-foreground">Product</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground">Qty</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground">Rate</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground">Disc%</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground">GST%</th>
                    <th className="text-right px-3 py-2 font-600 text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line) => (
                    <tr key={`detail-line-${line.id}`} className="border-b last:border-b-0">
                      <td className="px-3 py-2 font-500 text-foreground">{line.productName}</td>
                      <td className="px-3 py-2 text-right font-tabular text-muted-foreground">{line.quantity}</td>
                      <td className="px-3 py-2 text-right font-tabular text-muted-foreground">{formatIndianCurrency(line.rate)}</td>
                      <td className="px-3 py-2 text-right font-tabular text-muted-foreground">{line.discountPct}%</td>
                      <td className="px-3 py-2 text-right font-tabular text-muted-foreground">{line.gstPct}%</td>
                      <td className="px-3 py-2 text-right font-700 font-tabular text-foreground">{formatIndianCurrency(line.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subtotal (Taxable)</span>
              <span className="font-tabular text-foreground">{formatIndianCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Discount</span>
              <span className="font-tabular text-danger">−{formatIndianCurrency(invoice.totalDiscount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total GST</span>
              <span className="font-tabular text-foreground">{formatIndianCurrency(invoice.totalGST)}</span>
            </div>
            <div className="flex justify-between text-sm font-700 border-t pt-2">
              <span>Grand Total</span>
              <span className="font-tabular">{formatIndianCurrency(invoice.grandTotal)}</span>
            </div>
            {invoice.finalDiscount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Final Discount</span>
                <span className="font-tabular text-danger">−{formatIndianCurrency(invoice.finalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-800 bg-primary/5 rounded-lg px-3 py-2">
              <span className="text-primary">Grand Total after Discount</span>
              <span className="font-tabular text-primary">{formatIndianCurrency(invoice.grandTotalAfterDiscount)}</span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="border rounded-xl p-4 space-y-2">
            <p className="text-xs font-700 text-foreground mb-3">Payment Breakdown</p>
            {invoice.cashPaid > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Cash Paid</span>
                <span className="font-tabular text-accent font-600">{formatIndianCurrency(invoice.cashPaid)}</span>
              </div>
            )}
            {invoice.upiPaid > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">UPI Paid</span>
                <span className="font-tabular text-accent font-600">{formatIndianCurrency(invoice.upiPaid)}</span>
              </div>
            )}
            {invoice.bankPaid > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Bank Paid</span>
                <span className="font-tabular text-accent font-600">{formatIndianCurrency(invoice.bankPaid)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-700 border-t pt-2">
              <span>Balance Due</span>
              <span className={`font-tabular ${invoice.balanceDue > 0 ? 'text-danger' : 'text-accent'}`}>
                {formatIndianCurrency(invoice.balanceDue)}
              </span>
            </div>
          </div>

          {/* Receive balance CTA */}
          {invoice.balanceDue > 0 && (
            <button
              onClick={onReceiveBalance}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-600 bg-accent text-white rounded-xl hover:opacity-90 btn-press transition-all"
            >
              <ReceiptText size={16} />
              Receive Balance — {formatIndianCurrency(invoice.balanceDue)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}