// Optimized data service with advanced caching and batching
import { performanceManager } from '../utils/performance.js';

class OptimizedDataService {
  constructor() {
    this.batcher = performanceManager.createBatcher(20, 50, 500);
    this.subscriptions = new Map();
    this.realTimeConnections = new Map();
    this.initializeOptimizations();
  }

  async initializeOptimizations() {
    // Preload critical data
    await performanceManager.preloadCriticalData();
    
    // Initialize real-time connections
    this.initializeWebSocket();
    
    // Setup background sync
    this.setupBackgroundSync();
  }

  // Optimized student data fetching
  async getStudents(options = {}) {
    const { 
      page = 0, 
      limit = 50, 
      filters = {}, 
      sortBy = 'name',
      useCache = true 
    } = options;

    const cacheKey = `students-${JSON.stringify({ page, limit, filters, sortBy })}`;
    
    if (useCache) {
      const cached = performanceManager.getCache(cacheKey);
      if (cached) return cached;
    }

    const fetchFn = async () => {
      // Simulate API call - replace with actual endpoint
      const response = await fetch('/src/data/students.json');
      const allStudents = await response.json();
      
      // Apply filters
      let filteredStudents = allStudents;
      if (filters.status) {
        filteredStudents = filteredStudents.filter(s => s.status === filters.status);
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredStudents = filteredStudents.filter(s => 
          s.name.toLowerCase().includes(searchTerm) ||
          s.roomNumber.toLowerCase().includes(searchTerm) ||
          s.course.toLowerCase().includes(searchTerm)
        );
      }

      // Apply sorting
      filteredStudents.sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'roomNumber') return a.roomNumber.localeCompare(b.roomNumber);
        if (sortBy === 'joinDate') return new Date(a.joinDate) - new Date(b.joinDate);
        return 0;
      });

      // Apply pagination
      const startIndex = page * limit;
      const paginatedStudents = filteredStudents.slice(startIndex, startIndex + limit);

      return {
        data: paginatedStudents,
        total: filteredStudents.length,
        page,
        limit,
        hasMore: startIndex + limit < filteredStudents.length
      };
    };

    const result = await performanceManager.dedupeRequest(cacheKey, fetchFn, 'high');
    performanceManager.setCache(cacheKey, result, 300000); // 5 min cache
    
    return result;
  }

  // Optimized ledger data fetching with batching
  async getLedgerEntries(studentIds, options = {}) {
    const { useCache = true, batchSize = 10 } = options;

    if (!Array.isArray(studentIds)) {
      studentIds = [studentIds];
    }

    // Batch requests for multiple students
    const results = {};
    const uncachedIds = [];

    // Check cache first
    if (useCache) {
      for (const studentId of studentIds) {
        const cacheKey = `ledger-${studentId}`;
        const cached = performanceManager.getCache(cacheKey);
        if (cached) {
          results[studentId] = cached;
        } else {
          uncachedIds.push(studentId);
        }
      }
    } else {
      uncachedIds.push(...studentIds);
    }

    // Fetch uncached data in batches
    if (uncachedIds.length > 0) {
      const batches = this.chunkArray(uncachedIds, batchSize);
      
      const batchPromises = batches.map(batch => 
        this.fetchLedgerBatch(batch)
      );

      const batchResults = await Promise.all(batchPromises);
      
      // Merge batch results
      batchResults.forEach(batchResult => {
        Object.assign(results, batchResult);
      });
    }

    return studentIds.length === 1 ? results[studentIds[0]] : results;
  }

  async fetchLedgerBatch(studentIds) {
    const cacheKey = `ledger-batch-${studentIds.join(',')}`;
    
    const fetchFn = async () => {
      // Simulate batch API call
      const response = await fetch('/src/data/ledger.json');
      const allLedgerEntries = await response.json();
      
      const results = {};
      studentIds.forEach(studentId => {
        results[studentId] = allLedgerEntries
          .filter(entry => entry.studentId === studentId)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
      });
      
      return results;
    };

    const batchResult = await performanceManager.dedupeRequest(cacheKey, fetchFn, 'high');
    
    // Cache individual results
    Object.entries(batchResult).forEach(([studentId, ledgerData]) => {
      performanceManager.setCache(`ledger-${studentId}`, ledgerData, 300000);
    });

    return batchResult;
  }

  // Optimized dashboard stats with smart caching
  async getDashboardStats(options = {}) {
    const { useCache = true, includeRealTime = true } = options;
    const cacheKey = 'dashboard-stats';

    if (useCache) {
      const cached = performanceManager.getCache(cacheKey);
      if (cached) {
        // Return cached data immediately, fetch fresh data in background
        this.refreshDashboardStatsBackground();
        return cached;
      }
    }

    const fetchFn = async () => {
      // Parallel data fetching for better performance
      const [studentsData, ledgerData, paymentsData] = await Promise.all([
        this.getStudents({ useCache: true }),
        fetch('/src/data/ledger.json').then(r => r.json()),
        this.getRecentPayments()
      ]);

      const stats = this.calculateDashboardStats(studentsData, ledgerData, paymentsData);
      
      if (includeRealTime) {
        stats.realTimeUpdates = await this.getRealTimeUpdates();
      }

      return stats;
    };

    const result = await performanceManager.dedupeRequest(cacheKey, fetchFn, 'high');
    performanceManager.setCache(cacheKey, result, 60000); // 1 min cache for dashboard
    
    return result;
  }

  calculateDashboardStats(studentsData, ledgerData, paymentsData) {
    const students = studentsData.data || studentsData;
    
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const checkedOutStudents = students.filter(s => s.isCheckedOut).length;
    
    const totalCollected = ledgerData
      .filter(entry => entry.type === 'Payment')
      .reduce((sum, entry) => sum + (entry.credit || 0), 0);
    
    const totalDues = ledgerData
      .reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0);

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const thisMonthCollection = ledgerData
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entry.type === 'Payment' && 
               entryDate.getMonth() === thisMonth && 
               entryDate.getFullYear() === thisYear;
      })
      .reduce((sum, entry) => sum + (entry.credit || 0), 0);

    return {
      totalStudents,
      activeStudents,
      checkedOutStudents,
      totalCollected,
      totalDues: Math.max(0, totalDues),
      thisMonthCollection,
      occupancyRate: (activeStudents / totalStudents * 100).toFixed(1),
      averageMonthlyFee: students.reduce((sum, s) => sum + s.baseMonthlyFee, 0) / students.length,
      lastUpdated: new Date().toISOString()
    };
  }

  async refreshDashboardStatsBackground() {
    // Use requestIdleCallback for background refresh
    if (window.requestIdleCallback) {
      window.requestIdleCallback(async () => {
        try {
          const freshStats = await this.getDashboardStats({ useCache: false });
          performanceManager.setCache('dashboard-stats', freshStats, 60000);
          
          // Notify subscribers of update
          this.notifySubscribers('dashboard-stats', freshStats);
        } catch (error) {
          console.error('Background stats refresh failed:', error);
        }
      });
    }
  }

  // Real-time updates via WebSocket (disabled for demo)
  initializeWebSocket() {
    // WebSocket disabled for demo - would connect to real backend in production
    console.log('WebSocket connection disabled for demo mode');
    return;
    
    /* Production WebSocket code:
    if (typeof WebSocket === 'undefined') return;

    try {
      const ws = new WebSocket('ws://localhost:3001/realtime');
      
      ws.onopen = () => {
        console.log('Real-time connection established');
        this.realTimeConnections.set('main', ws);
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          this.handleRealTimeUpdate(update);
        } catch (error) {
          console.error('Real-time message parse error:', error);
        }
      };

      ws.onclose = () => {
        console.log('Real-time connection closed, attempting reconnect...');
        setTimeout(() => this.initializeWebSocket(), 3000);
      };

    } catch (error) {
      console.error('WebSocket initialization failed:', error);
    }
    */
  }

  handleRealTimeUpdate(update) {
    const { type, data } = update;
    
    switch (type) {
      case 'student_updated':
        this.invalidateCache(`student-${data.id}`);
        this.invalidateCache('students-*');
        break;
      case 'payment_recorded':
        this.invalidateCache(`ledger-${data.studentId}`);
        this.invalidateCache('dashboard-stats');
        break;
      case 'checkout_processed':
        this.invalidateCache(`student-${data.studentId}`);
        this.invalidateCache('dashboard-stats');
        break;
    }

    // Notify subscribers
    this.notifySubscribers(type, data);
  }

  // Subscription system for real-time updates
  subscribe(key, callback) {
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(key);
        }
      }
    };
  }

  notifySubscribers(key, data) {
    const callbacks = this.subscriptions.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });
    }
  }

  // Background sync for offline support
  setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('background-sync');
      }).catch(error => {
        console.error('Background sync registration failed:', error);
      });
    }
  }

  // Utility methods
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  invalidateCache(pattern) {
    if (pattern.includes('*')) {
      const prefix = pattern.replace('*', '');
      for (const key of performanceManager.cache.keys()) {
        if (key.startsWith(prefix)) {
          performanceManager.cache.delete(key);
        }
      }
    } else {
      performanceManager.cache.delete(pattern);
    }
  }

  async getRecentPayments() {
    // Placeholder for recent payments data
    return [];
  }

  async getRealTimeUpdates() {
    // Placeholder for real-time updates
    return {
      lastUpdate: new Date().toISOString(),
      activeConnections: this.realTimeConnections.size
    };
  }

  // Performance metrics
  getPerformanceMetrics() {
    return {
      ...performanceManager.getMetrics(),
      subscriptions: this.subscriptions.size,
      realTimeConnections: this.realTimeConnections.size
    };
  }
}

// Export singleton instance
export const optimizedDataService = new OptimizedDataService();