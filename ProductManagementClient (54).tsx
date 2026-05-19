'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  invoiceCount?: number;
}

export default function AppLayout({ children, invoiceCount = 43 }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const effectiveCollapsed = isMobile ? true : sidebarCollapsed;
  const sidebarWidth = isMobile ? 0 : (effectiveCollapsed ? 64 : 240);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — hidden on mobile unless menu open */}
      <div className={isMobile ? (mobileMenuOpen ? 'block' : 'hidden') : 'block'}>
        <Sidebar
          collapsed={effectiveCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className="flex flex-col min-h-screen content-transition"
        style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
      >
        <Topbar
          sidebarCollapsed={effectiveCollapsed}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
          invoiceCount={invoiceCount}
        />
        <main className="flex-1 mt-14 p-4 lg:p-6 max-w-screen-2xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile FAB */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-white shadow-card-lg flex items-center justify-center btn-press"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}
    </div>
  );
}