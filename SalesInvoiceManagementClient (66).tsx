/**
 * Mock data for all screens
 * Backend integration: Replace these with Supabase queries using user_id filter and is_deleted=false
 */

export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';
export type StockStatus = 'Available' | 'Low Stock' | 'Out of Stock';
export type GSTRate = 0 | 5 | 12 | 18 | 28;

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  openingBalance: number;
  is_deleted: boolean;
}

export interface Product {
  id: string;
  name: string;
  qr: string;
  category: string;
  description: string;
  salePrice: number;
  purchasePrice: number;
  gstRate: GSTRate;
  defaultDiscount: number;
  openingStock: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  discountPct: number;
  gstPct: GSTRate;
  gross: number;
  discountAmount: number;
  afterDiscount: number;
  taxableAmount: number;
  gstAmount: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string | null;
  customerName: string;
  lines: InvoiceLine[];
  subtotal: number;
  totalDiscount: number;
  totalGST: number;
  grandTotal: number;
  finalDiscount: number;
  grandTotalAfterDiscount: number;
  cashPaid: number;
  upiPaid: number;
  bankPaid: number;
  balanceDue: number;
  status: PaymentStatus;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export const mockCustomers: Customer[] = [
  { id: 'cust-001', name: 'Ramesh Agarwal Traders', phone: '9876543210', email: 'ramesh@agartrade.in', address: '14, Gandhi Nagar, Jaipur, Rajasthan 302001', gstin: '08AAAAA0000A1Z5', openingBalance: 5000, is_deleted: false },
  { id: 'cust-002', name: 'Priya Enterprises', phone: '9845001234', email: 'priya@penterp.co.in', address: '27-B, Koramangala, Bengaluru, Karnataka 560034', gstin: '29BBBBB1111B2Z6', openingBalance: 0, is_deleted: false },
  { id: 'cust-003', name: 'Suresh Kumar & Sons', phone: '9765432109', email: '', address: '5, Civil Lines, Allahabad, UP 211001', gstin: '', openingBalance: 12500, is_deleted: false },
  { id: 'cust-004', name: 'Meena Cloth House', phone: '9988776655', email: 'meena@clothhouse.in', address: '88, Chandni Chowk, Delhi 110006', gstin: '07CCCCC2222C3Z7', openingBalance: 0, is_deleted: false },
  { id: 'cust-005', name: 'Vijay Medical Store', phone: '9654321098', email: 'vijay.medical@gmail.com', address: '12, MG Road, Pune, Maharashtra 411001', gstin: '27DDDDD3333D4Z8', openingBalance: 3200, is_deleted: false },
  { id: 'cust-006', name: 'Anita General Store', phone: '9543210987', email: '', address: 'Shop 4, Main Market, Ludhiana, Punjab 141001', gstin: '', openingBalance: 0, is_deleted: false },
  { id: 'cust-007', name: 'Krishna Hardware', phone: '9432109876', email: 'krishna.hw@yahoo.com', address: '33, Industrial Area, Coimbatore, TN 641001', gstin: '33EEEEE4444E5Z9', openingBalance: 8750, is_deleted: false },
  { id: 'cust-008', name: 'Deepak Pharma', phone: '9321098765', email: 'deepak.pharma@gmail.com', address: '9, Sector 22, Chandigarh 160022', gstin: '04FFFFF5555F6Z1', openingBalance: 0, is_deleted: false },
];

export const mockProducts: Product[] = [
  { id: 'prod-001', name: 'Basmati Rice 5kg', qr: 'RICE-BASMATI-5KG', category: 'Grains', description: 'Premium aged basmati rice, 5kg pack', salePrice: 425.00, purchasePrice: 310.00, gstRate: 5, defaultDiscount: 0, openingStock: 50, is_deleted: false, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-05-10T14:22:00Z' },
  { id: 'prod-002', name: 'Toor Dal 1kg', qr: 'DAL-TOOR-1KG', category: 'Pulses', description: 'Washed toor dal, 1kg pack', salePrice: 148.00, purchasePrice: 112.00, gstRate: 5, defaultDiscount: 2, openingStock: 120, is_deleted: false, created_at: '2026-01-15T10:05:00Z', updated_at: '2026-05-12T09:10:00Z' },
  { id: 'prod-003', name: 'Sunflower Oil 1L', qr: 'OIL-SUNFLWR-1L', category: 'Oils', description: 'Refined sunflower cooking oil, 1 litre', salePrice: 162.00, purchasePrice: 128.00, gstRate: 5, defaultDiscount: 0, openingStock: 80, is_deleted: false, created_at: '2026-01-20T11:00:00Z', updated_at: '2026-05-14T16:00:00Z' },
  { id: 'prod-004', name: 'Detergent Powder 1kg', qr: 'DET-PWD-1KG', category: 'Household', description: 'Washing detergent powder, 1kg', salePrice: 89.00, purchasePrice: 62.00, gstRate: 18, defaultDiscount: 5, openingStock: 200, is_deleted: false, created_at: '2026-02-01T09:00:00Z', updated_at: '2026-05-15T11:30:00Z' },
  { id: 'prod-005', name: 'Atta 10kg', qr: 'ATTA-WHEAT-10KG', category: 'Grains', description: 'Whole wheat flour, 10kg bag', salePrice: 395.00, purchasePrice: 290.00, gstRate: 0, defaultDiscount: 0, openingStock: 30, is_deleted: false, created_at: '2026-02-05T10:00:00Z', updated_at: '2026-05-16T08:45:00Z' },
  { id: 'prod-006', name: 'Sugar 1kg', qr: 'SUGAR-1KG', category: 'Sweeteners', description: 'Refined white sugar, 1kg pack', salePrice: 48.00, purchasePrice: 36.00, gstRate: 5, defaultDiscount: 0, openingStock: 300, is_deleted: false, created_at: '2026-02-10T10:00:00Z', updated_at: '2026-05-17T07:30:00Z' },
  { id: 'prod-007', name: 'Soap Bar Pack (4)', qr: 'SOAP-BAR-4PK', category: 'Personal Care', description: 'Bathing soap bars, pack of 4', salePrice: 112.00, purchasePrice: 78.00, gstRate: 18, defaultDiscount: 0, openingStock: 4, is_deleted: false, created_at: '2026-02-15T10:00:00Z', updated_at: '2026-05-17T10:00:00Z' },
  { id: 'prod-008', name: 'Biscuit Assorted 1kg', qr: 'BISCUIT-ASST-1KG', category: 'Snacks', description: 'Assorted cream biscuits, 1kg tin', salePrice: 245.00, purchasePrice: 185.00, gstRate: 12, defaultDiscount: 0, openingStock: 0, is_deleted: false, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-05-16T15:00:00Z' },
  { id: 'prod-009', name: 'Toothpaste 150g', qr: 'TPASTE-150G', category: 'Personal Care', description: 'Fluoride toothpaste 150g tube', salePrice: 98.00, purchasePrice: 70.00, gstRate: 18, defaultDiscount: 3, openingStock: 3, is_deleted: false, created_at: '2026-03-05T10:00:00Z', updated_at: '2026-05-15T12:00:00Z' },
  { id: 'prod-010', name: 'Tea Leaves 500g', qr: 'TEA-LEAF-500G', category: 'Beverages', description: 'Premium CTC tea leaves, 500g pack', salePrice: 185.00, purchasePrice: 138.00, gstRate: 5, defaultDiscount: 0, openingStock: 60, is_deleted: false, created_at: '2026-03-10T10:00:00Z', updated_at: '2026-05-13T14:00:00Z' },
  { id: 'prod-011', name: 'Coconut Oil 500ml', qr: 'OIL-COCONUT-500ML', category: 'Oils', description: 'Pure coconut oil, 500ml bottle', salePrice: 225.00, purchasePrice: 172.00, gstRate: 5, defaultDiscount: 0, openingStock: 2, is_deleted: false, created_at: '2026-03-15T10:00:00Z', updated_at: '2026-05-17T09:00:00Z' },
  { id: 'prod-012', name: 'Shampoo 400ml', qr: 'SHAMP-400ML', category: 'Personal Care', description: 'Anti-dandruff shampoo 400ml bottle', salePrice: 285.00, purchasePrice: 210.00, gstRate: 18, defaultDiscount: 5, openingStock: 25, is_deleted: false, created_at: '2026-04-01T10:00:00Z', updated_at: '2026-05-10T11:00:00Z' },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001', invoiceNumber: 'INV-0043', date: '2026-05-17', customerId: 'cust-001', customerName: 'Ramesh Agarwal Traders',
    lines: [
      { id: 'il-001a', productId: 'prod-001', productName: 'Basmati Rice 5kg', quantity: 10, rate: 425, discountPct: 0, gstPct: 5, gross: 4250, discountAmount: 0, afterDiscount: 4250, taxableAmount: 4047.62, gstAmount: 202.38, lineTotal: 4250 },
      { id: 'il-001b', productId: 'prod-003', productName: 'Sunflower Oil 1L', quantity: 5, rate: 162, discountPct: 0, gstPct: 5, gross: 810, discountAmount: 0, afterDiscount: 810, taxableAmount: 771.43, gstAmount: 38.57, lineTotal: 810 },
    ],
    subtotal: 4819.05, totalDiscount: 0, totalGST: 240.95, grandTotal: 5060, finalDiscount: 0, grandTotalAfterDiscount: 5060,
    cashPaid: 5060, upiPaid: 0, bankPaid: 0, balanceDue: 0, status: 'Paid', is_deleted: false, created_at: '2026-05-17T09:15:00Z', updated_at: '2026-05-17T09:15:00Z',
  },
  {
    id: 'inv-002', invoiceNumber: 'INV-0042', date: '2026-05-17', customerId: 'cust-002', customerName: 'Priya Enterprises',
    lines: [
      { id: 'il-002a', productId: 'prod-004', productName: 'Detergent Powder 1kg', quantity: 20, rate: 89, discountPct: 5, gstPct: 18, gross: 1780, discountAmount: 89, afterDiscount: 1691, taxableAmount: 1432.20, gstAmount: 258.80, lineTotal: 1691 },
      { id: 'il-002b', productId: 'prod-007', productName: 'Soap Bar Pack (4)', quantity: 15, rate: 112, discountPct: 0, gstPct: 18, gross: 1680, discountAmount: 0, afterDiscount: 1680, taxableAmount: 1423.73, gstAmount: 256.27, lineTotal: 1680 },
    ],
    subtotal: 2855.93, totalDiscount: 89, totalGST: 515.07, grandTotal: 3371, finalDiscount: 0, grandTotalAfterDiscount: 3371,
    cashPaid: 2000, upiPaid: 0, bankPaid: 0, balanceDue: 1371, status: 'Partial', is_deleted: false, created_at: '2026-05-17T10:30:00Z', updated_at: '2026-05-17T10:30:00Z',
  },
  {
    id: 'inv-003', invoiceNumber: 'INV-0041', date: '2026-05-16', customerId: 'cust-003', customerName: 'Suresh Kumar & Sons',
    lines: [
      { id: 'il-003a', productId: 'prod-002', productName: 'Toor Dal 1kg', quantity: 50, rate: 148, discountPct: 2, gstPct: 5, gross: 7400, discountAmount: 148, afterDiscount: 7252, taxableAmount: 6906.67, gstAmount: 345.33, lineTotal: 7252 },
    ],
    subtotal: 6906.67, totalDiscount: 148, totalGST: 345.33, grandTotal: 7252, finalDiscount: 252, grandTotalAfterDiscount: 7000,
    cashPaid: 0, upiPaid: 0, bankPaid: 0, balanceDue: 7000, status: 'Pending', is_deleted: false, created_at: '2026-05-16T14:00:00Z', updated_at: '2026-05-16T14:00:00Z',
  },
  {
    id: 'inv-004', invoiceNumber: 'INV-0040', date: '2026-05-16', customerId: 'cust-004', customerName: 'Meena Cloth House',
    lines: [
      { id: 'il-004a', productId: 'prod-006', productName: 'Sugar 1kg', quantity: 100, rate: 48, discountPct: 0, gstPct: 5, gross: 4800, discountAmount: 0, afterDiscount: 4800, taxableAmount: 4571.43, gstAmount: 228.57, lineTotal: 4800 },
      { id: 'il-004b', productId: 'prod-010', productName: 'Tea Leaves 500g', quantity: 20, rate: 185, discountPct: 0, gstPct: 5, gross: 3700, discountAmount: 0, afterDiscount: 3700, taxableAmount: 3523.81, gstAmount: 176.19, lineTotal: 3700 },
    ],
    subtotal: 8095.24, totalDiscount: 0, totalGST: 404.76, grandTotal: 8500, finalDiscount: 0, grandTotalAfterDiscount: 8500,
    cashPaid: 4000, upiPaid: 4500, bankPaid: 0, balanceDue: 0, status: 'Paid', is_deleted: false, created_at: '2026-05-16T16:45:00Z', updated_at: '2026-05-16T16:45:00Z',
  },
  {
    id: 'inv-005', invoiceNumber: 'INV-0039', date: '2026-05-15', customerId: 'cust-005', customerName: 'Vijay Medical Store',
    lines: [
      { id: 'il-005a', productId: 'prod-009', productName: 'Toothpaste 150g', quantity: 30, rate: 98, discountPct: 3, gstPct: 18, gross: 2940, discountAmount: 88.20, afterDiscount: 2851.80, taxableAmount: 2416.78, gstAmount: 435.02, lineTotal: 2851.80 },
      { id: 'il-005b', productId: 'prod-012', productName: 'Shampoo 400ml', quantity: 12, rate: 285, discountPct: 5, gstPct: 18, gross: 3420, discountAmount: 171, afterDiscount: 3249, taxableAmount: 2753.39, gstAmount: 495.61, lineTotal: 3249 },
    ],
    subtotal: 5170.17, totalDiscount: 259.20, totalGST: 930.63, grandTotal: 6100.80, finalDiscount: 100.80, grandTotalAfterDiscount: 6000,
    cashPaid: 3000, upiPaid: 0, bankPaid: 0, balanceDue: 3000, status: 'Partial', is_deleted: false, created_at: '2026-05-15T11:00:00Z', updated_at: '2026-05-15T11:00:00Z',
  },
  {
    id: 'inv-006', invoiceNumber: 'INV-0038', date: '2026-05-15', customerId: 'cust-006', customerName: 'Anita General Store',
    lines: [
      { id: 'il-006a', productId: 'prod-005', productName: 'Atta 10kg', quantity: 8, rate: 395, discountPct: 0, gstPct: 0, gross: 3160, discountAmount: 0, afterDiscount: 3160, taxableAmount: 3160, gstAmount: 0, lineTotal: 3160 },
    ],
    subtotal: 3160, totalDiscount: 0, totalGST: 0, grandTotal: 3160, finalDiscount: 0, grandTotalAfterDiscount: 3160,
    cashPaid: 3160, upiPaid: 0, bankPaid: 0, balanceDue: 0, status: 'Paid', is_deleted: false, created_at: '2026-05-15T13:30:00Z', updated_at: '2026-05-15T13:30:00Z',
  },
  {
    id: 'inv-007', invoiceNumber: 'INV-0037', date: '2026-05-14', customerId: 'cust-007', customerName: 'Krishna Hardware',
    lines: [
      { id: 'il-007a', productId: 'prod-008', productName: 'Biscuit Assorted 1kg', quantity: 24, rate: 245, discountPct: 0, gstPct: 12, gross: 5880, discountAmount: 0, afterDiscount: 5880, taxableAmount: 5250, gstAmount: 630, lineTotal: 5880 },
    ],
    subtotal: 5250, totalDiscount: 0, totalGST: 630, grandTotal: 5880, finalDiscount: 0, grandTotalAfterDiscount: 5880,
    cashPaid: 0, upiPaid: 0, bankPaid: 5880, balanceDue: 0, status: 'Paid', is_deleted: false, created_at: '2026-05-14T09:00:00Z', updated_at: '2026-05-14T09:00:00Z',
  },
  {
    id: 'inv-008', invoiceNumber: 'INV-0036', date: '2026-05-14', customerId: 'cust-008', customerName: 'Deepak Pharma',
    lines: [
      { id: 'il-008a', productId: 'prod-011', productName: 'Coconut Oil 500ml', quantity: 15, rate: 225, discountPct: 0, gstPct: 5, gross: 3375, discountAmount: 0, afterDiscount: 3375, taxableAmount: 3214.29, gstAmount: 160.71, lineTotal: 3375 },
    ],
    subtotal: 3214.29, totalDiscount: 0, totalGST: 160.71, grandTotal: 3375, finalDiscount: 0, grandTotalAfterDiscount: 3375,
    cashPaid: 0, upiPaid: 3375, bankPaid: 0, balanceDue: 0, status: 'Paid', is_deleted: false, created_at: '2026-05-14T15:00:00Z', updated_at: '2026-05-14T15:00:00Z',
  },
  {
    id: 'inv-009', invoiceNumber: 'INV-0035', date: '2026-05-13', customerId: 'cust-001', customerName: 'Ramesh Agarwal Traders',
    lines: [
      { id: 'il-009a', productId: 'prod-001', productName: 'Basmati Rice 5kg', quantity: 20, rate: 425, discountPct: 0, gstPct: 5, gross: 8500, discountAmount: 0, afterDiscount: 8500, taxableAmount: 8095.24, gstAmount: 404.76, lineTotal: 8500 },
    ],
    subtotal: 8095.24, totalDiscount: 0, totalGST: 404.76, grandTotal: 8500, finalDiscount: 0, grandTotalAfterDiscount: 8500,
    cashPaid: 8500, upiPaid: 0, bankPaid: 0, balanceDue: 0, status: 'Paid', is_deleted: false, created_at: '2026-05-13T10:00:00Z', updated_at: '2026-05-13T10:00:00Z',
  },
  {
    id: 'inv-010', invoiceNumber: 'INV-0034', date: '2026-05-12', customerId: 'cust-003', customerName: 'Suresh Kumar & Sons',
    lines: [
      { id: 'il-010a', productId: 'prod-002', productName: 'Toor Dal 1kg', quantity: 30, rate: 148, discountPct: 2, gstPct: 5, gross: 4440, discountAmount: 88.80, afterDiscount: 4351.20, taxableAmount: 4144, gstAmount: 207.20, lineTotal: 4351.20 },
    ],
    subtotal: 4144, totalDiscount: 88.80, totalGST: 207.20, grandTotal: 4351.20, finalDiscount: 0, grandTotalAfterDiscount: 4351.20,
    cashPaid: 4351.20, upiPaid: 0, bankPaid: 0, balanceDue: 0, status: 'Paid', is_deleted: false, created_at: '2026-05-12T14:00:00Z', updated_at: '2026-05-12T14:00:00Z',
  },
];

export const mockDailySales = [
  { date: '11 May', day: 'Sun', total: 4250.00 },
  { date: '12 May', day: 'Mon', total: 11820.50 },
  { date: '13 May', day: 'Tue', total: 8500.00 },
  { date: '14 May', day: 'Wed', total: 9255.00 },
  { date: '15 May', day: 'Thu', total: 12160.00 },
  { date: '16 May', day: 'Fri', total: 15500.00 },
  { date: '17 May', day: 'Sat', total: 8431.00 },
];

export function computeStockForProduct(productId: string, openingStock: number): number {
  // Backend integration: Replace with live calculation from Supabase tables
  const stockMap: Record<string, number> = {
    'prod-001': 8, 'prod-002': 35, 'prod-003': 22, 'prod-004': 148,
    'prod-005': 14, 'prod-006': 185, 'prod-007': 4, 'prod-008': 0,
    'prod-009': 3, 'prod-010': 48, 'prod-011': 2, 'prod-012': 18,
  };
  return stockMap[productId] ?? openingStock;
}

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= 5) return 'Low Stock';
  return 'Available';
}

export function computeCashBalance(): number {
  // Backend integration: Compute from invoice payments + payment-in − expenses − payment-out − fund transfers
  return 24350.00;
}
export function computeUPIBalance(): number { return 12890.50; }
export function computeBankBalance(): number { return 87420.75; }
export function computeTotalCustomerDues(): number { return 29121.00; }
export function getTodaysSales(): number { return 8431.00; }
export function getNextInvoiceNumber(): string { return 'INV-0044'; }