import React from 'react';

type StatusVariant = 'paid' | 'partial' | 'pending' | 'available' | 'low' | 'out' | 'expired' | 'active';

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
}

const statusConfig: Record<StatusVariant, { className: string; defaultLabel: string }> = {
  paid:      { className: 'status-paid',      defaultLabel: 'Paid' },
  partial:   { className: 'status-partial',   defaultLabel: 'Partial' },
  pending:   { className: 'status-pending',   defaultLabel: 'Pending' },
  available: { className: 'status-available', defaultLabel: 'Available' },
  low:       { className: 'status-low',       defaultLabel: 'Low Stock' },
  out:       { className: 'status-out',       defaultLabel: 'Out of Stock' },
  expired:   { className: 'status-pending',   defaultLabel: 'Expired' },
  active:    { className: 'status-available', defaultLabel: 'Active' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 ${config.className}`}>
      {label ?? config.defaultLabel}
    </span>
  );
}