'use client';

import React, { useState } from 'react';
import { Bell, Sun, Moon, Cloud, CloudOff, User, FileText } from 'lucide-react';

interface TopbarProps {
  sidebarCollapsed: boolean;
  isDark: boolean;
  onThemeToggle: () => void;
  invoiceCount: number;
}

export default function Topbar({ sidebarCollapsed, isDark, onThemeToggle, invoiceCount }: TopbarProps) {
  const [showUser, setShowUser] = useState(false);
  const cloudConnected = false; // Backend integration: check Supabase session status

  return (
    <header
      className="fixed top-0 right-0 h-14 z-30 flex items-center px-4 gap-3 border-b bg-card"
      style={{ left: sidebarCollapsed ? '64px' : '240px', transition: 'left 300ms ease' }}
    >
      {/* Breadcrumb / Page context */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground hidden sm:block">
          <span className="font-600 text-foreground">Gonabhavi</span>
          <span className="mx-1.5">·</span>
          <span>Accounting & Billing</span>
        </p>
      </div>

      {/* Invoice count chip */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-600 text-muted-foreground">
        <FileText size={12} />
        <span className="font-tabular">{invoiceCount} invoices</span>
      </div>

      {/* Cloud status */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600 ${
          cloudConnected ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
        }`}
      >
        {cloudConnected ? <Cloud size={12} /> : <CloudOff size={12} />}
        <span className="hidden sm:inline">{cloudConnected ? 'Cloud' : 'Local only'}</span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={onThemeToggle}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={16} className="text-muted-foreground" /> : <Moon size={16} className="text-muted-foreground" />}
      </button>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Notifications">
        <Bell size={16} className="text-muted-foreground" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-danger" />
      </button>

      {/* User */}
      <div className="relative">
        <button
          onClick={() => setShowUser(!showUser)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <User size={12} className="text-white" />
          </div>
          <span className="text-sm font-600 hidden sm:block">Login</span>
        </button>
        {showUser && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-card border rounded-lg shadow-card-md z-50 py-1 animate-scale-in">
            <div className="px-3 py-2 border-b">
              <p className="text-xs font-600">Not signed in</p>
              <p className="text-xs text-muted-foreground">Local mode</p>
            </div>
            <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">Sign In / Sign Up</button>
            <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">Sync & Backup</button>
          </div>
        )}
      </div>
    </header>
  );
}