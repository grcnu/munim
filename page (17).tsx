import React from 'react';
import { mockProducts, computeStockForProduct, getStockStatus } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import { AlertTriangle } from 'lucide-react';

export default function LowStockTable() {
  const lowItems = mockProducts?.filter((p) => !p?.is_deleted)?.map((p) => ({ ...p, currentStock: computeStockForProduct(p?.id, p?.openingStock) }))?.filter((p) => p?.currentStock <= 5)?.sort((a, b) => a?.currentStock - b?.currentStock)?.slice(0, 8);

  if (lowItems?.length === 0) {
    return (
      <div className="bg-card rounded-xl border shadow-card p-6 text-center">
        <p className="text-sm text-muted-foreground">All products have sufficient stock.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-warning" />
          <h2 className="text-sm font-700 text-foreground">Low & Out-of-Stock Items</h2>
        </div>
        <a href="/product-management" className="text-xs font-600 text-primary hover:underline">
          View inventory
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-4 py-2.5 text-xs font-600 text-muted-foreground">Product</th>
              <th className="text-left px-4 py-2.5 text-xs font-600 text-muted-foreground hidden sm:table-cell">Category</th>
              <th className="text-right px-4 py-2.5 text-xs font-600 text-muted-foreground">Stock</th>
              <th className="text-center px-4 py-2.5 text-xs font-600 text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {lowItems?.map((product, i) => {
              const status = getStockStatus(product?.currentStock);
              return (
                <tr
                  key={`lowstock-${product?.id}`}
                  className={`border-b last:border-b-0 row-hover transition-colors ${i % 2 === 1 ? 'bg-muted/20' : ''}`}
                >
                  <td className="px-4 py-2.5">
                    <p className="text-xs font-600 text-foreground">{product?.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{product?.qr}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">{product?.category}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`text-sm font-800 font-tabular ${product?.currentStock === 0 ? 'text-danger' : 'text-warning'}`}>
                      {product?.currentStock}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <StatusBadge status={status === 'Low Stock' ? 'low' : 'out'} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}