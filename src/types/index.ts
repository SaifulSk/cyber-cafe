export type ServiceCategory =
  | 'recharge'
  | 'aeps'
  | 'electric_bill'
  | 'ration_card'
  | 'voter_card'
  | 'pan_card'
  | 'money_transfer'
  | 'aadhaar_services'
  | 'certificates'
  | 'printing_xerox'
  | 'ticket_booking'
  | 'pm_kisan'
  | 'other';

export type TaskStatus = 'completed' | 'in_progress' | 'pending' | 'delivered' | 'cancelled';

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'credit';

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  serviceCategory: ServiceCategory;
  serviceId?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
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
  phone: string;
  email?: string;
  aadhaarLast4?: string;
  address?: string;
  villageOrArea?: string;
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
  category: ServiceCategory;
  defaultIncurredCost: number;
  defaultFee: number;
  icon: string;
  color: string;
  description?: string;
  isActive: boolean;
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
