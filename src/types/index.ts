export type ServiceCategory = string;

export type TaskStatus = 'completed' | 'in_progress' | 'pending' | 'delivered' | 'cancelled';

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'credit';

export interface CategoryCustomField {
  id: string;
  name: string;
  required?: boolean;
}

export interface DuePaymentRecord {
  id: string;
  userId?: string;
  taskId?: string;
  taskTitle: string;
  customerName: string;
  amount: number;
  paidDate: string; // YYYY-MM-DD
  paidTime?: string; // HH:mm
  paymentMode: PaymentMode;
  notes?: string;
  createdAt: number;
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  serviceCategory: ServiceCategory;
  serviceId?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customFieldValues?: Record<string, string>;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  amountIncurred: number; // Cost / operator expense
  amountCharged: number;  // Price charged to customer
  amountPaid: number;     // Amount paid by customer
  profit: number;         // amountCharged - amountIncurred
  dueAmount: number;      // amountCharged - amountPaid
  paymentMode: PaymentMode;
  status: TaskStatus;
  referenceNo?: string;   // Transaction / Ack / Token / Application Number
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  residence?: string;
  address?: string;
  villageOrArea?: string;
  aadhaarLast4?: string;
  notes?: string;
  totalTransactions?: number;
  totalBilled?: number;
  totalPaid?: number;
  totalDue?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ServiceMasterItem {
  id: string;
  userId?: string;
  name: string;
  category?: ServiceCategory;
  customFields?: CategoryCustomField[];
  defaultIncurredCost?: number;
  defaultFee?: number;
  icon?: string;
  color?: string;
  description?: string;
  isActive?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  kendraName?: string;
  phone?: string;
  address?: string;
  cscId?: string;
}

export interface DaySummary {
  date: string;
  totalTasks: number;
  totalRevenue: number;
  totalIncurred: number;
  totalProfit: number;
  totalPaid: number;
  totalDue: number;
}
