import React from 'react';
import AppLayout from '@/components/AppLayout';
import SalesInvoiceManagementClient from './components/SalesInvoiceManagementClient';

export default function SalesInvoiceManagementPage() {
  return (
    <AppLayout invoiceCount={43}>
      <SalesInvoiceManagementClient />
    </AppLayout>
  );
}