// Base API Response Types
export interface ApiResponse<T> {
  status: number;
  data?: T;
  result?: T;
  stats?: T;
  message?: string;
}

// Student Types
export interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomNumber?: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Graduated';
  joinDate: string;
  enrollmentDate?: string;
  address?: string;
  balance?: number;
  room?: {
    id: string;
    roomNumber: string;
    name: string;
  };
  // Additional fields from real API
  guardianName?: string;
  guardianPhone?: string;
  baseMonthlyFee?: number;
  course?: string;
  institution?: string;
  emergencyContact?: string;
  currentBalance?: number;
  advanceBalance?: number;
}

export interface CreateStudentDto {
  name: string;
  phone: string;
  email: string;
  roomNumber?: string;
  address?: string;
  enrollmentDate?: string;
}

export interface UpdateStudentDto {
  name?: string;
  phone?: string;
  email?: string;
  roomNumber?: string;
  status?: 'Active' | 'Inactive' | 'Suspended' | 'Graduated';
  address?: string;
}

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  totalDues: number;
  totalAdvances: number;
}

export interface StudentFilters {
  search?: string;
  status?: string;
  roomNumber?: string;
  page?: number;
  limit?: number;
}

// Dashboard Types
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  pendingPayments: number;
  occupancyRate: number;
  monthlyCollection: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  collections: number;
  pending: number;
}

// Payment Types
export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Card' | 'Online' | 'Cheque' | 'UPI' | 'Mobile Wallet';
  paymentDate: string;
  reference?: string;
  notes?: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Cancelled' | 'Refunded';
  transactionId?: string;
  receiptNumber?: string;
  processedBy?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  invoiceIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePaymentDto {
  studentId: string;
  amount: number;
  paymentMethod: Payment['paymentMethod'];
  paymentDate?: string;
  reference?: string;
  notes?: string;
  status?: Payment['status'];
  transactionId?: string;
  receiptNumber?: string;
  processedBy?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  invoiceIds?: string[];
}

export interface UpdatePaymentDto {
  amount?: number;
  paymentMethod?: Payment['paymentMethod'];
  paymentDate?: string;
  reference?: string;
  notes?: string;
  status?: Payment['status'];
  transactionId?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
}

export interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalAmount: number;
  averagePaymentAmount: number;
  paymentMethods: Record<string, { count: number; amount: number }>;
  successRate: number;
  todayPayments: number;
  todayAmount: number;
  thisMonthPayments: number;
  thisMonthAmount: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  requiresReference?: boolean;
  icon?: string;
}

// Ledger Types
export interface LedgerEntry {
  id: string;
  studentId: string;
  date: string;
  type: 'Invoice' | 'Payment' | 'Discount' | 'Adjustment' | 'Refund' | 'Penalty';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  balanceType: 'Dr' | 'Cr' | 'Nil';
  referenceId?: string;
}

// Room Types
export interface Room {
  id: string;
  name: string;
  roomNumber: string;
  bedCount: number;
  occupancy: number;
  gender?: 'Male' | 'Female' | 'Mixed';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  monthlyRate?: number;
}

// Booking Types
export interface BookingRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  guardianName?: string;
  guardianPhone?: string;
  preferredRoom?: string;
  course?: string;
  institution?: string;
  requestDate: string;
  checkInDate?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  notes?: string;
}

// Analytics Types
export interface AnalyticsData {
  revenue: {
    monthly: number[];
    labels: string[];
  };
  occupancy: {
    rate: number;
    trend: number[];
  };
  collections: {
    rate: number;
    amount: number;
  };
}

// Error Types
export interface ApiErrorResponse {
  status: number;
  message: string;
  error?: string;
  details?: any;
}