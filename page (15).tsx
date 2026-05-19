import React from 'react';
import DailySalesChart from './DailySalesChart';

export default function DashboardChartSection() {
  return (
    <div className="bg-card rounded-xl border shadow-card p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-700 text-foreground">Daily Sales — Last 7 Days</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Bar height = total sales (Grand Total after discount). Green bar = peak day.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />
            Daily sales
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" />
            Peak day
          </span>
        </div>
      </div>
      <DailySalesChart />
    </div>
  );
}