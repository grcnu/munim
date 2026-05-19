'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Settings, Building2, FileText, Save } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


interface CompanyProfile {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  pan: string;
  stateName: string;
  stateCode: string;
  bankName: string;
  bankAccount: string;
  ifsc: string;
  upiId: string;
  invoiceTerms: string;
}

interface InvoiceSettings {
  prefix: string;
  suffix: string;
  separator: string;
  startNumber: number;
  padding: number;
  financialYearReset: boolean;
}

const defaultProfile: CompanyProfile = {
  companyName: 'Gonabhavi Traders',
  phone: '9876543210',
  email: 'info@gonabhavi.in',
  address: '12, Main Road, Bengaluru, Karnataka 560001',
  gstin: '29GONAB1234G1Z5',
  pan: 'GONAB1234G',
  stateName: 'Karnataka',
  stateCode: '29',
  bankName: 'State Bank of India',
  bankAccount: '1234567890',
  ifsc: 'SBIN0001234',
  upiId: 'gonabhavi@sbi',
  invoiceTerms: 'Thank you for your business. Payment due within 30 days.',
};

const defaultInvoiceSettings: InvoiceSettings = {
  prefix: 'INV',
  suffix: '',
  separator: '-',
  startNumber: 1,
  padding: 4,
  financialYearReset: false,
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(defaultInvoiceSettings);
  const [activeTab, setActiveTab] = useState<'company' | 'invoice'>('company');

  const updateProfile = (field: keyof CompanyProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const updateInvoiceSettings = (field: keyof InvoiceSettings, value: string | number | boolean) => {
    setInvoiceSettings((prev) => ({ ...prev, [field]: value }));
  };

  const previewInvoiceNumber = () => {
    const num = String(invoiceSettings.startNumber).padStart(invoiceSettings.padding, '0');
    const parts = [invoiceSettings.prefix, num].filter(Boolean);
    let result = parts.join(invoiceSettings.separator);
    if (invoiceSettings.suffix) result += invoiceSettings.separator + invoiceSettings.suffix;
    return result;
  };

  const handleSave = () => {
    toast.success('Settings saved successfully.');
  };

  const tabs = [
    { id: 'company' as const, label: 'Company Profile', icon: Building2 },
    { id: 'invoice' as const, label: 'Invoice Settings', icon: FileText },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-700 text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Company profile and invoice configuration</p>
          </div>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-600 bg-primary text-white rounded-lg hover:opacity-90 btn-press transition-all">
            <Save size={16} /> Save Changes
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-600 rounded-lg transition-all ${activeTab === id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'company' && (
          <div className="bg-card rounded-xl border shadow-card p-6 space-y-5">
            <h2 className="text-sm font-700 text-foreground">Company Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Company Name *</label>
                <input type="text" value={profile.companyName} onChange={(e) => updateProfile('companyName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Phone</label>
                <input type="tel" value={profile.phone} onChange={(e) => updateProfile('phone', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Email</label>
                <input type="email" value={profile.email} onChange={(e) => updateProfile('email', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">GSTIN</label>
                <input type="text" value={profile.gstin} onChange={(e) => updateProfile('gstin', e.target.value.toUpperCase())} maxLength={15}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono" />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">PAN Number</label>
                <input type="text" value={profile.pan} onChange={(e) => updateProfile('pan', e.target.value.toUpperCase())} maxLength={10}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono" />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">State Name</label>
                <input type="text" value={profile.stateName} onChange={(e) => updateProfile('stateName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">State Code</label>
                <input type="text" value={profile.stateCode} onChange={(e) => updateProfile('stateCode', e.target.value)} maxLength={2}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Full Address</label>
              <textarea value={profile.address} onChange={(e) => updateProfile('address', e.target.value)} rows={2}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-700 text-foreground mb-3">Bank Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Bank Name</label>
                  <input type="text" value={profile.bankName} onChange={(e) => updateProfile('bankName', e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Account Number</label>
                  <input type="text" value={profile.bankAccount} onChange={(e) => updateProfile('bankAccount', e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">IFSC Code</label>
                  <input type="text" value={profile.ifsc} onChange={(e) => updateProfile('ifsc', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-600 text-muted-foreground mb-1">UPI ID</label>
                <input type="text" value={profile.upiId} onChange={(e) => updateProfile('upiId', e.target.value)}
                  className="w-full sm:w-1/2 px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-xs font-600 text-muted-foreground mb-1">Invoice Terms</label>
              <textarea value={profile.invoiceTerms} onChange={(e) => updateProfile('invoiceTerms', e.target.value)} rows={2}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
            </div>
          </div>
        )}

        {activeTab === 'invoice' && (
          <div className="bg-card rounded-xl border shadow-card p-6 space-y-5">
            <h2 className="text-sm font-700 text-foreground">Invoice Numbering</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Prefix</label>
                <input type="text" value={invoiceSettings.prefix} onChange={(e) => updateInvoiceSettings('prefix', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Separator</label>
                <input type="text" value={invoiceSettings.separator} onChange={(e) => updateInvoiceSettings('separator', e.target.value)} maxLength={3}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Suffix (optional)</label>
                <input type="text" value={invoiceSettings.suffix} onChange={(e) => updateInvoiceSettings('suffix', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Start Number</label>
                <input type="number" min={1} value={invoiceSettings.startNumber} onChange={(e) => updateInvoiceSettings('startNumber', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Padding (digits)</label>
                <input type="number" min={1} max={8} value={invoiceSettings.padding} onChange={(e) => updateInvoiceSettings('padding', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="fy-reset" checked={invoiceSettings.financialYearReset}
                onChange={(e) => updateInvoiceSettings('financialYearReset', e.target.checked)}
                className="rounded border-border" />
              <label htmlFor="fy-reset" className="text-sm text-foreground">Reset invoice number each financial year (April 1st)</label>
            </div>

            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-xs font-600 text-muted-foreground mb-1">Preview</p>
              <p className="text-2xl font-800 text-primary font-mono">{previewInvoiceNumber()}</p>
              <p className="text-xs text-muted-foreground mt-1">This is how your next invoice number will look</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
