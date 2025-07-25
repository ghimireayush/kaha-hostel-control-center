// Report Service - Generate and manage system reports
import reportsData from '../data/reports.json' with { type: 'json' };

let reports = [...reportsData];

export const reportService = {
  // READ Operations
  async getAllReports() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...reports]), 100);
    });
  },

  async getReportById(id) {
    return new Promise((resolve) => {
      const report = reports.find(r => r.id === id);
      setTimeout(() => resolve(report), 100);
    });
  },

  async getReportsByType(type) {
    return new Promise((resolve) => {
      const typeReports = reports.filter(r => r.type === type);
      setTimeout(() => resolve(typeReports), 100);
    });
  },

  async getReportsByUser(userId) {
    return new Promise((resolve) => {
      const userReports = reports.filter(r => r.generatedBy === userId);
      setTimeout(() => resolve(userReports), 100);
    });
  },

  async getScheduledReports() {
    return new Promise((resolve) => {
      const scheduledReports = reports.filter(r => r.isScheduled);
      setTimeout(() => resolve(scheduledReports), 100);
    });
  },

  // CREATE Operations
  async generateReport(reportData) {
    return new Promise((resolve) => {
      const newReport = {
        id: `RPT${String(reports.length + 1).padStart(3, '0')}`,
        ...reportData,
        generatedAt: new Date().toISOString(),
        filePath: `/reports/${reportData.type}/${reportData.name.toLowerCase().replace(/\s+/g, '-')}.${reportData.format}`,
        isScheduled: reportData.isScheduled || false
      };
      
      reports.push(newReport);
      
      console.log(`📊 Report generated: ${newReport.name}`);
      
      setTimeout(() => resolve(newReport), 500); // Simulate report generation time
    });
  },

  async generateFinancialReport(parameters) {
    const reportData = {
      name: `Financial Report - ${parameters.month}`,
      type: 'financial',
      description: 'Monthly financial summary including revenue, expenses, and outstanding dues',
      generatedBy: parameters.generatedBy || 'system',
      parameters,
      data: {
        // This would be calculated from actual data
        totalRevenue: 450000,
        totalExpenses: 125000,
        netIncome: 325000,
        outstandingDues: 85000,
        collectionRate: 84.2
      },
      format: parameters.format || 'pdf'
    };
    
    return this.generateReport(reportData);
  },

  async generateOccupancyReport(parameters) {
    const reportData = {
      name: `Occupancy Report - ${parameters.month}`,
      type: 'occupancy',
      description: 'Room occupancy statistics and utilization analysis',
      generatedBy: parameters.generatedBy || 'system',
      parameters,
      data: {
        totalRooms: 180,
        occupiedRooms: 157,
        availableRooms: 23,
        occupancyRate: 87.2,
        averageStayDuration: 8.5
      },
      format: parameters.format || 'excel'
    };
    
    return this.generateReport(reportData);
  },

  async generateStudentReport(parameters) {
    const reportData = {
      name: `Student Report - ${parameters.type}`,
      type: 'student',
      description: 'Student demographics and statistics analysis',
      generatedBy: parameters.generatedBy || 'system',
      parameters,
      data: {
        totalStudents: 156,
        activeStudents: 142,
        averageAge: 21.5,
        maleStudents: 89,
        femaleStudents: 67
      },
      format: parameters.format || 'excel'
    };
    
    return this.generateReport(reportData);
  },

  // UPDATE Operations
  async updateReport(id, updateData) {
    return new Promise((resolve, reject) => {
      const index = reports.findIndex(r => r.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('Report not found')), 100);
        return;
      }

      reports[index] = { ...reports[index], ...updateData };
      setTimeout(() => resolve(reports[index]), 100);
    });
  },

  async updateReportSchedule(id, scheduleConfig) {
    return new Promise((resolve, reject) => {
      const index = reports.findIndex(r => r.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('Report not found')), 100);
        return;
      }

      reports[index].scheduleConfig = scheduleConfig;
      reports[index].isScheduled = true;
      
      setTimeout(() => resolve(reports[index]), 100);
    });
  },

  // DELETE Operations
  async deleteReport(id) {
    return new Promise((resolve, reject) => {
      const index = reports.findIndex(r => r.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('Report not found')), 100);
        return;
      }

      const deletedReport = reports.splice(index, 1)[0];
      setTimeout(() => resolve(deletedReport), 100);
    });
  },

  // SEARCH Operations
  async searchReports(criteria) {
    return new Promise((resolve) => {
      const searchTerm = criteria.toLowerCase();
      const filteredReports = reports.filter(report => 
        report.name.toLowerCase().includes(searchTerm) ||
        report.description.toLowerCase().includes(searchTerm) ||
        report.type.toLowerCase().includes(searchTerm)
      );
      setTimeout(() => resolve(filteredReports), 100);
    });
  },

  async filterReports(filters) {
    return new Promise((resolve) => {
      let filteredReports = [...reports];
      
      if (filters.type) {
        filteredReports = filteredReports.filter(r => r.type === filters.type);
      }
      
      if (filters.generatedBy) {
        filteredReports = filteredReports.filter(r => r.generatedBy === filters.generatedBy);
      }
      
      if (filters.isScheduled !== undefined) {
        filteredReports = filteredReports.filter(r => r.isScheduled === filters.isScheduled);
      }
      
      if (filters.format) {
        filteredReports = filteredReports.filter(r => r.format === filters.format);
      }
      
      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        filteredReports = filteredReports.filter(r => {
          const reportDate = new Date(r.generatedAt);
          return reportDate >= startDate && reportDate <= endDate;
        });
      }
      
      setTimeout(() => resolve(filteredReports), 100);
    });
  },

  // STATISTICS Operations
  async getReportStats() {
    return new Promise((resolve) => {
      const stats = {
        total: reports.length,
        scheduled: reports.filter(r => r.isScheduled).length,
        byType: {},
        byFormat: {},
        recentReports: reports.filter(r => {
          const reportDate = new Date(r.generatedAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return reportDate > weekAgo;
        }).length
      };
      
      // Count by type
      reports.forEach(report => {
        stats.byType[report.type] = (stats.byType[report.type] || 0) + 1;
      });
      
      // Count by format
      reports.forEach(report => {
        stats.byFormat[report.format] = (stats.byFormat[report.format] || 0) + 1;
      });
      
      setTimeout(() => resolve(stats), 100);
    });
  },

  async getReportSummary() {
    return new Promise((resolve) => {
      const summary = {
        totalReports: reports.length,
        financialReports: reports.filter(r => r.type === 'financial').length,
        occupancyReports: reports.filter(r => r.type === 'occupancy').length,
        studentReports: reports.filter(r => r.type === 'student').length,
        maintenanceReports: reports.filter(r => r.type === 'maintenance').length,
        systemReports: reports.filter(r => r.type === 'system').length,
        scheduledReports: reports.filter(r => r.isScheduled).length,
        recentReports: reports.filter(r => {
          const reportDate = new Date(r.generatedAt);
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return reportDate > monthAgo;
        }).length
      };
      
      setTimeout(() => resolve(summary), 100);
    });
  },

  // UTILITY Operations
  async downloadReport(id) {
    return new Promise((resolve, reject) => {
      const report = reports.find(r => r.id === id);
      if (!report) {
        setTimeout(() => reject(new Error('Report not found')), 100);
        return;
      }
      
      // In a real app, this would handle file download
      const downloadInfo = {
        reportId: report.id,
        fileName: report.filePath.split('/').pop(),
        filePath: report.filePath,
        format: report.format,
        size: '2.5 MB' // Simulated file size
      };
      
      setTimeout(() => resolve(downloadInfo), 200);
    });
  },

  async scheduleReport(reportConfig) {
    return new Promise((resolve) => {
      const scheduledReport = {
        ...reportConfig,
        id: `RPT${String(reports.length + 1).padStart(3, '0')}`,
        isScheduled: true,
        generatedAt: new Date().toISOString(),
        status: 'scheduled'
      };
      
      reports.push(scheduledReport);
      
      console.log(`📅 Report scheduled: ${scheduledReport.name}`);
      
      setTimeout(() => resolve(scheduledReport), 100);
    });
  },

  async getReportTypes() {
    return new Promise((resolve) => {
      const types = [
        { value: 'financial', label: 'Financial Reports', description: 'Revenue, expenses, and payment analysis' },
        { value: 'occupancy', label: 'Occupancy Reports', description: 'Room utilization and availability' },
        { value: 'student', label: 'Student Reports', description: 'Student demographics and statistics' },
        { value: 'maintenance', label: 'Maintenance Reports', description: 'Maintenance requests and completion' },
        { value: 'system', label: 'System Reports', description: 'System performance and usage' }
      ];
      
      setTimeout(() => resolve(types), 100);
    });
  }
};