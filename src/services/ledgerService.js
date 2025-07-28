const API_BASE_URL = "http://localhost:3001/api/v1";

// Helper function to handle API requests
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    // Handle the specific API response format: { status, result: { items, pagination } }
    if (data.result && data.result.items) {
      return data.result.items;
    }
    // For single item responses, return the result directly
    if (data.result && !data.result.items) {
      return data.result;
    }
    // Fallback for other formats
    return data.data || data;
  } catch (error) {
    console.error("Ledger API Request Error:", error);
    throw error;
  }
}

export const ledgerService = {
  // Get all ledger entries with filtering and pagination
  async getLedgerEntries(filters = {}) {
    try {
      console.log("📊 Fetching ledger entries from API...");
      const queryParams = new URLSearchParams();

      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/ledgers${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiRequest(endpoint);
      console.log("✅ Ledger entries API response:", response);

      return response.result?.items || response || []; // Handle different response formats
    } catch (error) {
      console.error("❌ Error fetching ledger entries:", error);
      throw error;
    }
  },

  // Get ledger statistics from API
  async getLedgerStats() {
    try {
      console.log("📊 Fetching ledger statistics from API...");
      const response = await fetch(`${API_BASE_URL}/ledgers/stats`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Ledger stats API response:", data);

      return data.stats || data;
    } catch (error) {
      console.error("❌ Error fetching ledger stats:", error);
      throw error;
    }
  },

  // Get ledger entries by student ID
  async getLedgerByStudentId(studentId) {
    try {
      console.log(`📊 Fetching ledger for student ${studentId}...`);
      const response = await fetch(
        `${API_BASE_URL}/ledgers/student/${studentId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Student ledger fetched");

      return data.data || [];
    } catch (error) {
      console.error("❌ Error fetching student ledger:", error);
      throw error;
    }
  },

  // Get student balance summary
  async getStudentBalance(studentId) {
    try {
      console.log(`📊 Fetching balance for student ${studentId}...`);
      const response = await fetch(
        `${API_BASE_URL}/ledgers/balance/${studentId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Student balance fetched");

      return data.data || {};
    } catch (error) {
      console.error("❌ Error fetching student balance:", error);
      throw error;
    }
  },

  // Add/Create ledger entry
  async addLedgerEntry(entryData) {
    try {
      console.log("📊 Creating new ledger entry via API...");
      const response = await fetch(`${API_BASE_URL}/ledgers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Ledger entry created successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error creating ledger entry:", error);
      throw error;
    }
  },

  // Update ledger entry
  async updateLedgerEntry(entryId, updateData) {
    try {
      console.log(`📊 Updating ledger entry ${entryId} via API...`);
      const response = await fetch(`${API_BASE_URL}/ledgers/${entryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Ledger entry updated successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error updating ledger entry:", error);
      throw error;
    }
  },

  // Generate ledger entries from invoices and payments
  async generateLedgerEntries(options = {}) {
    try {
      console.log("📊 Generating ledger entries from invoices/payments...");
      const response = await fetch(`${API_BASE_URL}/ledgers/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Ledger entries generated successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error generating ledger entries:", error);
      throw error;
    }
  },

  // Calculate student balance (using API)
  async calculateStudentBalance(studentId) {
    try {
      const balanceData = await this.getStudentBalance(studentId);
      return {
        balance: balanceData.currentBalance,
        balanceType: balanceData.balanceType,
        rawBalance: balanceData.rawBalance,
      };
    } catch (error) {
      console.error("❌ Error calculating student balance:", error);
      throw error;
    }
  },

  // Get ledger summary for all students
  async getLedgerSummary() {
    try {
      console.log("📊 Fetching ledger summary...");
      const stats = await this.getLedgerStats();

      // Transform stats into summary format
      const summary = {
        totalEntries: stats.totalEntries,
        totalDebits: stats.totalDebits,
        totalCredits: stats.totalCredits,
        outstandingAmount: stats.outstandingAmount,
        advanceAmount: stats.advanceAmount,
        studentsWithBalance: stats.studentsWithBalance,
        studentsWithCredit: stats.studentsWithCredit,
        studentsWithDebit: stats.studentsWithDebit,
      };

      return summary;
    } catch (error) {
      console.error("❌ Error fetching ledger summary:", error);
      throw error;
    }
  },

  // Search ledger entries
  async searchLedgerEntries(searchTerm, filters = {}) {
    try {
      console.log(`🔍 Searching ledger entries: ${searchTerm}`);
      return await this.getLedgerEntries({ search: searchTerm, ...filters });
    } catch (error) {
      console.error("❌ Error searching ledger entries:", error);
      throw error;
    }
  },

  // Filter ledger entries by type
  async filterLedgerEntriesByType(type) {
    try {
      console.log(`🔍 Filtering ledger entries by type: ${type}`);
      return await this.getLedgerEntries({ type });
    } catch (error) {
      console.error("❌ Error filtering ledger entries by type:", error);
      throw error;
    }
  },

  // Filter ledger entries by date range
  async filterLedgerEntriesByDateRange(dateFrom, dateTo) {
    try {
      console.log(
        `🔍 Filtering ledger entries by date range: ${dateFrom} to ${dateTo}`
      );
      return await this.getLedgerEntries({ dateFrom, dateTo });
    } catch (error) {
      console.error("❌ Error filtering ledger entries by date range:", error);
      throw error;
    }
  },
};
