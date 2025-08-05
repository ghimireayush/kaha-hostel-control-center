/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Get API base URL from environment variables with fallback
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3012/api/v1',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// API endpoints configuration
export const API_ENDPOINTS = {
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
  },
  
  // Students
  STUDENTS: {
    BASE: '/students',
    STATS: '/students/stats',
    ACTIVE: '/students/active',
    BY_ID: (id: string) => `/students/${id}`,
    CHECKOUT: (id: string) => `/students/${id}/checkout`,
    LEDGER: (id: string) => `/students/${id}/ledger`,
  },
  
  // Rooms
  ROOMS: {
    BASE: '/rooms',
    STATS: '/rooms/stats',
    AVAILABLE: '/rooms/available',
    BY_ID: (id: string) => `/rooms/${id}`,
    ASSIGN: (id: string) => `/rooms/${id}/assign`,
    VACATE: (id: string) => `/rooms/${id}/vacate`,
    MAINTENANCE: (id: string) => `/rooms/${id}/maintenance`,
  },
  
  // Payments
  PAYMENTS: {
    BASE: '/payments',
    STATS: '/payments/stats',
    RECENT: '/payments/recent',
    BY_ID: (id: string) => `/payments/${id}`,
    BY_STUDENT: (studentId: string) => `/payments/student/${studentId}`,
    BULK: '/payments/bulk',
    ALLOCATE: (id: string) => `/payments/${id}/allocate`,
  },
  
  // Invoices
  INVOICES: {
    BASE: '/invoices',
    STATS: '/invoices/stats',
    PENDING: '/invoices/pending',
    BY_ID: (id: string) => `/invoices/${id}`,
    GENERATE_MONTHLY: '/invoices/generate-monthly',
    SEND: (id: string) => `/invoices/${id}/send`,
  },
  
  // Ledgers
  LEDGERS: {
    BASE: '/ledgers',
    STATS: '/ledgers/stats',
    BY_ID: (id: string) => `/ledgers/${id}`,
    BY_STUDENT: (studentId: string) => `/ledgers/student/${studentId}`,
    BALANCE: (studentId: string) => `/ledgers/balance/${studentId}`,
    GENERATE: '/ledgers/generate',
    ADJUSTMENT: '/ledgers/adjustment',
    REVERSE: (entryId: string) => `/ledgers/${entryId}/reverse`,
  },
  
  // Reports
  REPORTS: {
    BASE: '/reports',
    STATS: '/reports/stats',
    TYPES: '/reports/types',
    BY_ID: (id: string) => `/reports/${id}`,
    DOWNLOAD: (id: string) => `/reports/download/${id}`,
    GENERATE: '/reports/generate',
    SCHEDULE: '/reports/schedule',
  },
  
  // Booking Requests
  BOOKING_REQUESTS: {
    BASE: '/booking-requests',
    STATS: '/booking-requests/stats',
    PENDING: '/booking-requests/pending',
    BY_ID: (id: string) => `/booking-requests/${id}`,
  },
} as const;

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get API config
export const getApiConfig = () => {
  return {
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

// Environment info
export const ENV_INFO = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiBaseUrl: API_CONFIG.BASE_URL,
  nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
} as const;

// Log API configuration in development
if (ENV_INFO.isDevelopment) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_CONFIG.BASE_URL,
    environment: ENV_INFO.nodeEnv,
    timeout: API_CONFIG.TIMEOUT,
  });
}