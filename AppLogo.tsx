import React from 'react';
import AppLayout from '@/components/AppLayout';
import ProductManagementClient from './components/ProductManagementClient';

export default function ProductManagementPage() {
  return (
    <AppLayout invoiceCount={43}>
      <ProductManagementClient />
    </AppLayout>
  );
}