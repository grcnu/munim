import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface KPICardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; positive: boolean };
  alert?: boolean;
  className?: string;
}

export default function KPICard({
  label, value, subValue, icon: Icon, iconBg, iconColor,
  trend, alert, className = '',
}: KPICardProps) {
  return (
    <div
      className={`bg-card rounded-xl border shadow-card p-4 flex flex-col gap-3 card-hover ${
        alert ? 'border-l-4 border-l-danger' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-600 ${trend.positive ? 'text-accent' : 'text-danger'}`}>
            {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}
          </div>
        )}
        {alert && (
          <span className="text-xs font-600 text-danger bg-red-50 px-2 py-0.5 rounded-full">Alert</span>
        )}
      </div>
      <div>
        <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-800 text-foreground font-tabular leading-none">{value}</p>
        {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
      </div>
    </div>
  );
}