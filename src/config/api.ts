export const API_ENDPOINTS = {
  STUDENTS: {
    BASE: '/students',
    BY_ID: (id: string) => `/students/${id}`,
    STATS: '/students/stats',
    SEARCH: '/students/search',
    BALANCE: (id: string) => `/students/${id}/balance`,
    LEDGER: (id: string) => `/students/${id}/ledger`,
    PAYMENTS: (id: string) => `/students/${id}/payments`,
    INVOICES: (id: string) => `/students/${id}/invoices`,
    CHECKOUT: (id: string) => `/students/${id}/checkout`,
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITY: '/dashboard/recent-activity',
    MONTHLY_REVENUE: '/dashboard/monthly-revenue',
  },
  PAYMENTS: {
    BASE: '/payments',
    BY_ID: (id: string) => `/payments/${id}`,
    BY_STUDENT: (studentId: string) => `/payments/student/${studentId}`,
    STATS: '/payments/stats',
  },
  LEDGER: {
    BASE: '/ledger',
    BY_STUDENT: (studentId: string) => `/ledger/student/${studentId}`,
    ENTRIES: '/ledger/entries',
  },
  INVOICES: {
    BASE: '/invoices',
    BY_ID: (id: string) => `/invoices/${id}`,
    BY_STUDENT: (studentId: string) => `/invoices/student/${studentId}`,
    GENERATE: '/invoices/generate',
  },
  ROOMS: {
    BASE: '/rooms',
    BY_ID: (id: string) => `/rooms/${id}`,
    OCCUPANTS: '/rooms/occupants',
    LAYOUTS: '/rooms/layouts',
  },
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    APPROVE: (id: string) => `/bookings/${id}/approve`,
    REJECT: (id: string) => `/bookings/${id}/reject`,
  },
  ANALYTICS: {
    REVENUE: '/analytics/revenue',
    OCCUPANCY: '/analytics/occupancy',
    MONTHLY: '/analytics/monthly',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
  },
  ADMIN_CHARGES: {
    BASE: '/admin/charges',
    BY_ID: (id: string) => `/admin/charges/${id}`,
    BY_STUDENT: (studentId: string) => `/admin/charges/student/${studentId}`,
  },
} as const;