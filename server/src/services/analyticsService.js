/**
 * Get dashboard analytics data
 * In a real implementation, this would aggregate data from other services
 * (booking, student, invoice services) to calculate real-time analytics
 * @returns {Promise<Object>} Dashboard analytics data
 */
async function getDashboardData() {
    // Mock data based on the Updated API Blueprint section 2.3
    // In a full system, this data would be calculated from booking/student/invoice services.
    const mockData = {
        summary: {
            monthlyRevenue: 320000,
            revenueGrowth: 12,
            totalBookings: 78,
            bookingsGrowth: 8,
            avgOccupancy: 88,
            occupancyGrowth: 5,
            growthRate: 15
        },
        monthlyData: [
            { month: "Jan", revenue: 180000, bookings: 45, occupancy: 65 },
            { month: "Feb", revenue: 220000, bookings: 52, occupancy: 72 },
            { month: "Mar", revenue: 280000, bookings: 68, occupancy: 78 },
            { month: "Apr", revenue: 245000, bookings: 58, occupancy: 70 },
            { month: "May", revenue: 290000, bookings: 72, occupancy: 82 },
            { month: "Jun", revenue: 320000, bookings: 78, occupancy: 88 }
        ],
        guestTypeData: [
            { name: "Tourist", value: 35, count: 156 },
            { name: "Backpacker", value: 28, count: 124 },
            { name: "Student", value: 20, count: 89 },
            { name: "Digital Nomad", value: 12, count: 53 },
            { name: "Volunteer", value: 5, count: 22 }
        ],
        performanceMetrics: {
            averageDailyRate: 1250,
            revenuePerAvailableBed: 989990,
            averageLengthOfStay: 2.4,
            repeatGuestRate: 18
        }
    };

    return mockData;
}

module.exports = {
    getDashboardData
};