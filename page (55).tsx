'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard, FileText, ShoppingCart, List, ArrowDownCircle,
  RotateCcw, FileQuestion, Package, Users, Truck, Boxes, Sliders,
  Receipt, ArrowLeftRight, ClipboardList, FileOutput, BarChart2,
  PieChart, TrendingUp, Scale, Clock, BookOpen, BookMarked, Wallet,
  QrCode, Activity, CloudCog, Settings, ChevronLeft, ChevronRight,
  AlertTriangle, RefreshCw,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupLabel: 'SALE',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Sale Invoice', href: '/sales-invoice-management', icon: FileText, badge: 2 },
      { label: 'Sale Order', href: '/sale-order', icon: ShoppingCart },
      { label: 'Invoices', href: '/purchase-bill', icon: List },
      { label: 'Payment-In', href: '/payment-in', icon: ArrowDownCircle },
      { label: 'Sales Return', href: '/sales-return', icon: RotateCcw },
      { label: 'Quotation', href: '/quotation', icon: FileQuestion },
    ],
  },
  {
    groupLabel: 'PURCHASE',
    items: [
      { label: 'Purchase Bill', href: '/purchase-bill', icon: Package },
      { label: 'Payment-Out', href: '/payment-out', icon: Receipt },
      { label: 'Purchase Return', href: '/purchase-return', icon: RefreshCw },
    ],
  },
  {
    groupLabel: 'BUSINESS',
    items: [
      { label: 'Products', href: '/product-management', icon: Boxes },
      { label: 'Customers', href: '/customers', icon: Users },
      { label: 'Suppliers', href: '/suppliers', icon: Truck },
      { label: 'Inventory', href: '/inventory', icon: Sliders },
      { label: 'Stock Adjustment', href: '', icon: AlertTriangle },
      { label: 'Expenses', href: '/expenses', icon: Receipt },
      { label: 'Fund Transfer', href: '', icon: ArrowLeftRight },
      { label: 'Estimates', href: '', icon: ClipboardList },
      { label: 'Delivery Challans', href: '', icon: FileOutput },
    ],
  },
  {
    groupLabel: 'REPORTS',
    items: [
      { label: 'Reports', href: '/reports', icon: BarChart2 },
      { label: 'GST Summary', href: '/gst-summary', icon: PieChart },
      { label: 'Profit & Loss', href: '/profit-loss', icon: TrendingUp },
      { label: 'Balance Sheet', href: '/balance-sheet', icon: Scale },
      { label: 'Receivables/Payables', href: '/receivables-payables', icon: Clock },
      { label: 'Customer Ledger', href: '/customer-ledger', icon: BookOpen },
      { label: 'Supplier Ledger', href: '/supplier-ledger', icon: BookMarked },
      { label: 'Money Ledger', href: '/money-ledger', icon: Wallet },
    ],
  },
  {
    groupLabel: 'OTHER',
    items: [
      { label: 'Barcode Labels', href: '', icon: QrCode },
      { label: 'Audit Log', href: '', icon: Activity },
      { label: 'Sync & Backup', href: '', icon: CloudCog },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col sidebar-transition overflow-hidden ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-14 px-3 flex-shrink-0 border-b"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AppLogo size={32} />
          {!collapsed && (
            <span className="font-bold text-white text-base tracking-tight truncate">
              Gonabhavi
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1 rounded sidebar-item flex-shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="flex items-center justify-center h-8 mx-2 mt-2 rounded sidebar-item"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={`group-${group.groupLabel}`} className="mb-1">
            {!collapsed && (
              <p
                className="px-3 py-1.5 text-xs font-600 tracking-widest uppercase"
                style={{ color: 'var(--sidebar-group-label)' }}
              >
                {group.groupLabel}
              </p>
            )}
            {collapsed && <div className="my-1 mx-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }} />}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const hasRoute = item.href !== '';
              const commonClass = `flex items-center gap-2.5 mx-2 my-0.5 px-2.5 py-2 text-sm font-500 relative ${
                isActive ? 'sidebar-item-active' : 'sidebar-item'
              } ${!hasRoute ? 'opacity-50 cursor-not-allowed' : ''}`;
              const content = (
                <>
                  <Icon size={16} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && item.badge > 0 && (
                    <span className="ml-auto text-xs font-700 px-1.5 py-0.5 rounded-full bg-danger text-white min-w-[18px] text-center leading-none">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && item.badge > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-danger" />
                  )}
                </>
              );
              return hasRoute ? (
                <Link
                  key={`nav-${item.label}`}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={commonClass}
                >
                  {content}
                </Link>
              ) : (
                <span
                  key={`nav-${item.label}`}
                  title={collapsed ? item.label : undefined}
                  className={commonClass}
                >
                  {content}
                </span>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="flex-shrink-0 border-t p-2"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-700 text-white">G</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-600 text-white truncate">Gonabhavi Store</p>
              <p className="text-xs truncate" style={{ color: 'var(--sidebar-group-label)' }}>v2.4.1</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}