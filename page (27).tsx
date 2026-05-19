import React from 'react';
import AppLayout from '@/components/AppLayout';
import KPICard from '@/app/components/KPICard';
import RecentInvoicesTable from '@/app/components/RecentInvoicesTable';
import LowStockTable from '@/app/components/LowStockTable';
import DashboardChartSection from '@/app/components/DashboardChartSection';
import {
  getTodaysSales, computeTotalCustomerDues,
  computeCashBalance, computeUPIBalance, computeBankBalance,
  mockProducts, computeStockForProduct,
} from '@/lib/mockData';
import { formatIndianCurrency } from '@/lib/formatters';
import { IndianRupee, Users, Banknote, Smartphone, Building2, AlertTriangle, Plus, Package } from 'lucide-react';

export default function DashboardPage() {
  // Backend integration: Replace these with Supabase queries filtered by user_id and is_deleted=false
  const todaysSales = getTodaysSales();
  const customerDues = computeTotalCustomerDues();
  const cashBalance = computeCashBalance();
  const upiBalance = computeUPIBalance();
  const bankBalance = computeBankBalance();

  const allProducts = mockProducts?.filter((p) => !p?.is_deleted);
  const lowStockCount = allProducts?.filter((p) => {
    const s = computeStockForProduct(p?.id, p?.openingStock);
    return s >= 1 && s <= 5;
  })?.length;
  const outOfStockCount = allProducts?.filter((p) => {
    const s = computeStockForProduct(p?.id, p?.openingStock);
    return s <= 0;
  })?.length;

  return (
    <AppLayout invoiceCount={43}>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Saturday, 17 May 2026 — Today&apos;s business summary</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/product-management"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-600 border rounded-lg hover:bg-muted transition-colors"
          >
            <Package size={14} />
            <span className="hidden sm:inline">Add Product</span>
          </a>
          <a
            href="/sales-invoice-management"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all"
          >
            <Plus size={14} />
            New Invoice
          </a>
        </div>
      </div>

      {/* KPI Bento Grid
          Plan: 5 cards → grid-cols-4
          Row 1: hero (Today's Sales, spans 2 cols) + Customer Dues (1 col) + Cash Balance (1 col)
          Row 2: UPI Balance (1 col) + Bank Balance (1 col) + Low Stock Alert (spans 2 cols)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mb-6">
        {/* Hero: Today's Sales — spans 2 cols */}
        <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
          <KPICard
            label="Today's Sales"
            value={formatIndianCurrency(todaysSales)}
            subValue="3 invoices raised today"
            icon={IndianRupee}
            iconBg="bg-blue-50"
            iconColor="text-primary"
            trend={{ value: '+12.4% vs yesterday', positive: true }}
            className="h-full"
          />
        </div>

        {/* Customer Dues */}
        <KPICard
          label="Customer Dues"
          value={formatIndianCurrency(customerDues)}
          subValue="Across 5 customers"
          icon={Users}
          iconBg="bg-red-50"
          iconColor="text-danger"
          trend={{ value: '₹4,371 new today', positive: false }}
        />

        {/* Cash Balance */}
        <KPICard
          label="Cash Balance"
          value={formatIndianCurrency(cashBalance)}
          subValue="In hand"
          icon={Banknote}
          iconBg="bg-green-50"
          iconColor="text-accent"
          trend={{ value: '+₹5,060 today', positive: true }}
        />

        {/* UPI Balance */}
        <KPICard
          label="UPI Balance"
          value={formatIndianCurrency(upiBalance)}
          subValue="Collected via UPI"
          icon={Smartphone}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />

        {/* Bank Balance */}
        <KPICard
          label="Bank Balance"
          value={formatIndianCurrency(bankBalance)}
          subValue="Current account"
          icon={Building2}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          trend={{ value: '+₹5,880 yesterday', positive: true }}
        />

        {/* Low Stock Alert — spans 2 cols */}
        <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
          <div className="bg-card rounded-xl border shadow-card border-l-4 border-l-warning p-4 h-full card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle size={20} className="text-warning" />
              </div>
              <span className="text-xs font-600 text-warning bg-amber-50 px-2 py-0.5 rounded-full">Needs Attention</span>
            </div>
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">Stock Alerts</p>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-2xl font-800 text-warning font-tabular">{lowStockCount}</p>
                <p className="text-xs text-muted-foreground">Low stock</p>
              </div>
              {outOfStockCount > 0 && (
                <div>
                  <p className="text-2xl font-800 text-danger font-tabular">{outOfStockCount}</p>
                  <p className="text-xs text-muted-foreground">Out of stock</p>
                </div>
              )}
            </div>
            <a href="/product-management" className="mt-2 inline-block text-xs font-600 text-warning hover:underline">
              View inventory →
            </a>
          </div>
        </div>
      </div>

      {/* Chart section */}
      <DashboardChartSection />

      {/* Tables row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
        <RecentInvoicesTable />
        <LowStockTable />
      </div>
    </AppLayout>
  );
}