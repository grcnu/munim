@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --primary: #1a56db;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #475569;
  --accent: #0e9f6e;
  --accent-foreground: #ffffff;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #1a56db;
  --radius: 8px;
  --font-sans: var(--font-plus-jakarta-sans), sans-serif;

  --warning: #f59e0b;
  --warning-foreground: #ffffff;
  --danger: #ef4444;
  --danger-foreground: #ffffff;
  --success: #0e9f6e;
  --success-foreground: #ffffff;

  --sidebar-bg: #0f172a;
  --sidebar-fg: #cbd5e1;
  --sidebar-active-bg: #1a56db;
  --sidebar-active-fg: #ffffff;
  --sidebar-hover-bg: #1e293b;
  --sidebar-group-label: #475569;
  --sidebar-border: #1e293b;
}

.dark {
  --background: #0f172a;
  --foreground: #f1f5f9;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --secondary: #1e293b;
  --secondary-foreground: #94a3b8;
  --accent: #10b981;
  --accent-foreground: #ffffff;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --card: #1e293b;
  --card-foreground: #f1f5f9;
  --border: #334155;
  --input: #334155;
  --ring: #3b82f6;

  --warning: #f59e0b;
  --danger: #ef4444;
  --success: #10b981;

  --sidebar-bg: #020617;
  --sidebar-fg: #94a3b8;
  --sidebar-active-bg: #1d4ed8;
  --sidebar-active-fg: #ffffff;
  --sidebar-hover-bg: #0f172a;
  --sidebar-group-label: #475569;
  --sidebar-border: #1e293b;
}

@layer base {
  * {
    box-sizing: border-box;
    border-color: var(--border);
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
  html {
    scroll-behavior: smooth;
  }
  h1, h2, h3, h4, h5, h6, p {
    margin: 0;
  }
}

@layer utilities {
  .font-tabular {
    font-variant-numeric: tabular-nums;
  }
  .text-rupee {
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
  }
  .sidebar-transition {
    transition: width 300ms ease, transform 300ms ease;
  }
  .content-transition {
    transition: margin-left 300ms ease;
  }
  .card-hover {
    transition: box-shadow 150ms ease, transform 150ms ease;
  }
  .card-hover:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    transform: translateY(-1px);
  }
  .row-hover:hover {
    background-color: var(--muted);
  }
  .btn-press:active {
    transform: scale(0.97);
    transition: transform 150ms ease;
  }
  .animate-fade-in {
    animation: fadeIn 200ms ease forwards;
  }
  .animate-slide-up {
    animation: slideUp 200ms ease forwards;
  }
  .animate-scale-in {
    animation: scaleIn 150ms ease forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 2px;
  }
  .indian-number {
    font-variant-numeric: tabular-nums;
  }
  .status-paid {
    background-color: #dcfce7;
    color: #15803d;
  }
  .status-partial {
    background-color: #fef9c3;
    color: #a16207;
  }
  .status-pending {
    background-color: #fee2e2;
    color: #b91c1c;
  }
  .status-available {
    background-color: #dcfce7;
    color: #15803d;
  }
  .status-low {
    background-color: #fef9c3;
    color: #a16207;
  }
  .status-out {
    background-color: #fee2e2;
    color: #b91c1c;
  }
  .dark .status-paid {
    background-color: #14532d;
    color: #86efac;
  }
  .dark .status-partial {
    background-color: #713f12;
    color: #fde047;
  }
  .dark .status-pending {
    background-color: #7f1d1d;
    color: #fca5a5;
  }
  .dark .status-available {
    background-color: #14532d;
    color: #86efac;
  }
  .dark .status-low {
    background-color: #713f12;
    color: #fde047;
  }
  .dark .status-out {
    background-color: #7f1d1d;
    color: #fca5a5;
  }
  .sidebar-item-active {
    background-color: var(--sidebar-active-bg);
    color: var(--sidebar-active-fg);
    border-radius: 6px;
  }
  .sidebar-item {
    color: var(--sidebar-fg);
    border-radius: 6px;
    transition: background-color 150ms ease, color 150ms ease;
  }
  .sidebar-item:hover {
    background-color: var(--sidebar-hover-bg);
    color: #ffffff;
  }
  .invoice-form-panel {
    transition: transform 300ms ease, opacity 300ms ease;
  }
  .modal-overlay {
    animation: fadeIn 150ms ease forwards;
  }
  .modal-content {
    animation: scaleIn 150ms ease forwards;
  }
}