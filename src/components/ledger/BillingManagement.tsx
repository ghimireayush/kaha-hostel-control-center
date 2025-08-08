
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, DollarSign, Users, Eye, Download, FileText, TrendingUp, Clock, AlertTriangle, Receipt } from "lucide-react";
import { automatedBillingService } from "@/services/automatedBillingService.js";
import { invoiceGenerationService } from "@/services/invoiceGenerationService.js";
import { mockData } from "@/data/mockData.js";

export const BillingManagement = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedStudentCharges, setSelectedStudentCharges] = useState(null);
  const [showStudentChargesDialog, setShowStudentChargesDialog] = useState(false);
  const [billingStats, setBillingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load monthly invoice data
  useEffect(() => {
    // Use mock data directly instead of calling service
    try {
      setLoading(true);
      setError(null);

      // Create monthly summary data from mock invoices
      const decemberInvoices = mockData.billingData.monthlyInvoices.filter(inv => inv.month === "December 2024");
      const monthlySummary = [{
        monthKey: "2024-12",
        month: "December 2024",
        totalInvoices: decemberInvoices.length,
        totalAmount: decemberInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        students: mockData.students.filter(s => !s.isCheckedOut), // Active students
        paidInvoices: decemberInvoices.filter(inv => inv.status === 'Paid').length,
        pendingInvoices: decemberInvoices.filter(inv => inv.status !== 'Paid').length,
        invoices: decemberInvoices
      }];
      setMonthlyData(monthlySummary);
      setBillingStats({
        totalInvoices: mockData.billingData.monthlyInvoices.length,
        totalAmount: mockData.billingData.monthlyInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        paidAmount: mockData.billingData.monthlyInvoices
          .filter(inv => inv.status === 'Paid')
          .reduce((sum, inv) => sum + inv.totalAmount, 0),
        pendingAmount: mockData.billingData.monthlyInvoices
          .filter(inv => inv.status !== 'Paid')
          .reduce((sum, inv) => sum + inv.totalAmount, 0),
        currentMonth: {
          invoices: mockData.billingData.monthlyInvoices.length,
          amount: mockData.billingData.monthlyInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
          paid: mockData.billingData.monthlyInvoices.filter(inv => inv.status === 'Paid').length,
          pending: mockData.billingData.monthlyInvoices.filter(inv => inv.status !== 'Paid').length,
          students: mockData.students.filter(s => !s.isCheckedOut).length
        },
        allTime: {
          averageMonthlyAmount: 75000,
          totalRevenue: 900000,
          totalInvoices: 48
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading mock data:', error);
      setError(error.message);
      setLoading(false);
    }
  }, []);

  // Removed loadMonthlyData function since we're using mock data directly

  // Removed loadBillingStats function since we're setting stats directly with mock data

  const handleViewDetails = async (monthKey) => {
    try {
      // Filter invoices for the selected month
      const monthInvoices = mockData.billingData.monthlyInvoices.filter(inv =>
        inv.month === "December 2024"
      );

      // Use mock data for month details
      const details = {
        monthKey,
        month: "December 2024",
        invoices: monthInvoices,
        summary: {
          totalInvoices: monthInvoices.length,
          totalAmount: monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
          paidAmount: monthInvoices
            .filter(inv => inv.status === 'Paid')
            .reduce((sum, inv) => sum + inv.totalAmount, 0),
          pendingAmount: monthInvoices
            .filter(inv => inv.status !== 'Paid')
            .reduce((sum, inv) => sum + inv.totalAmount, 0)
        }
      };
      setSelectedMonthDetails(details);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Error loading month details:', error);
      toast.error('Failed to load month details');
    }
  };

  const handleDownloadReport = (monthData) => {
    // In a real app, this would generate and download a PDF report
    toast.success(`Report for ${monthData.month} will be downloaded`);
  };

  const handleViewStudentCharges = async (invoice) => {
    try {
      // Find the student data to get their configured charges
      const student = mockData.students.find(s => s.id === invoice.studentId);
      if (student) {
        const chargeDetails = {
          student: student,
          invoice: invoice,
          configuredCharges: {
            baseMonthlyFee: student.baseMonthlyFee || 0,
            laundryFee: student.laundryFee || 0,
            foodFee: student.foodFee || 0,
            additionalCharges: student.additionalCharges || [],
            configurationDate: student.configurationDate || student.joinDate,
            totalConfiguredAmount: (student.baseMonthlyFee || 0) + (student.laundryFee || 0) + (student.foodFee || 0)
          }
        };
        setSelectedStudentCharges(chargeDetails);
        setShowStudentChargesDialog(true);
      } else {
        toast.error('Student details not found');
      }
    } catch (error) {
      console.error('Error loading student charge details:', error);
      toast.error('Failed to load student charge details');
    }
  };

  const getNextBillingDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#07A64F]"></div>
        <span className="ml-2 text-gray-600">Loading billing data...</span>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Billing Management Error</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <Button
          onClick={() => {
            setError(null);
            window.location.reload();
          }}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#231F20]">📊 Automated Billing</h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={async () => {
              try {
                setLoading(true);
                const result = await invoiceGenerationService.testInvoiceGeneration();
                toast.success(`Generated ${result.successfulInvoices} invoices for ${result.month}`);
                // Refresh the data
                window.location.reload();
              } catch (error) {
                toast.error('Failed to generate invoices: ' + error.message);
              } finally {
                setLoading(false);
              }
            }}
            className="bg-[#07A64F] hover:bg-[#07A64F]/90 text-white"
            disabled={loading}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Test Invoices
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            Next billing: {getNextBillingDate()}
          </div>
        </div>
      </div>

      {/* Billing Statistics */}
      {billingStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-[#1295D0] to-[#1295D0]/80 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">
                    {billingStats?.currentMonth?.invoices || 0}
                  </div>
                  <div className="text-sm opacity-90">This Month Invoices</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#07A64F] to-[#07A64F]/80 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">
                    NPR {(billingStats?.currentMonth?.amount || 0).toLocaleString()}
                  </div>
                  <div className="text-sm opacity-90">This Month Amount</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#1295D0]/80 to-[#07A64F]/80 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">
                    {billingStats?.currentMonth?.students || 0}
                  </div>
                  <div className="text-sm opacity-90">Active Students</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#07A64F]/80 to-[#1295D0]/80 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">
                    NPR {(billingStats?.allTime?.averageMonthlyAmount || 0).toLocaleString()}
                  </div>
                  <div className="text-sm opacity-90">Avg Monthly</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Month-wise Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Month-wise Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No monthly invoices found</p>
              <p className="text-sm text-gray-400">Invoice data will appear here once billing is generated</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-center">Total Invoices</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(monthlyData || []).map((monthData) => (
                    <TableRow key={monthData.monthKey} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#1295D0]" />
                          <span className="font-medium">{monthData.month}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {monthData.totalInvoices || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {monthData.students?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#07A64F]">
                        NPR {(monthData.totalAmount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(monthData.monthKey)}
                            className="text-[#1295D0] border-[#1295D0]/30 hover:bg-[#1295D0]/10"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReport(monthData)}
                            className="text-[#07A64F] border-[#07A64F]/30 hover:bg-[#07A64F]/10"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Month Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#1295D0]" />
              Invoice Details - {selectedMonthDetails?.month}
            </DialogTitle>
          </DialogHeader>

          {selectedMonthDetails && (
            <div className="space-y-6">
              {/* Month Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {selectedMonthDetails?.summary?.totalInvoices || 0}
                      </div>
                      <div className="text-sm text-blue-600">Total Invoices</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {selectedMonthDetails?.invoices?.length || 0}
                      </div>
                      <div className="text-sm text-green-600">Students Billed</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-700">
                        NPR {(selectedMonthDetails?.summary?.totalAmount || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-orange-600">Total Amount</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Student-wise Invoice Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Student-wise Invoice Breakdown</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedMonthDetails?.invoices || []).map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {invoice.studentName.charAt(0)}
                            </div>
                            <span className="font-medium">{invoice.studentName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{invoice.roomNumber}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#07A64F]">
                          NPR {(invoice.totalAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {invoice.date ? new Date(invoice.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'Dec 1, 2024'}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {invoice.referenceId}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewStudentCharges(invoice)}
                              className="text-[#1295D0] border-[#1295D0]/30 hover:bg-[#1295D0]/10"
                            >
                              <Receipt className="h-3 w-3 mr-1" />
                              View Charges
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student Charge Details Dialog */}
      <Dialog open={showStudentChargesDialog} onOpenChange={setShowStudentChargesDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#1295D0]" />
              Charge Breakdown - {selectedStudentCharges?.student?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedStudentCharges && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Student Name</div>
                    <div className="font-medium">{selectedStudentCharges.student.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Room Number</div>
                    <div className="font-medium">{selectedStudentCharges.student.roomNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Configuration Date</div>
                    <div className="font-medium">
                      {new Date(selectedStudentCharges.configuredCharges.configurationDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Invoice ID</div>
                    <code className="text-xs bg-white px-2 py-1 rounded border">
                      {selectedStudentCharges.invoice.referenceId}
                    </code>
                  </div>
                </div>
              </div>

              {/* Configured Charges Breakdown */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#07A64F]" />
                  Pre-Configured Charges Breakdown
                </h4>

                <div className="space-y-3">
                  {/* Base Monthly Fee */}
                  <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#1295D0] to-[#1295D0]/80 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🏠</span>
                      </div>
                      <div>
                        <div className="font-medium">Base Monthly Fee</div>
                        <div className="text-sm text-gray-600">Standard accommodation charges</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#1295D0]">
                        NPR {selectedStudentCharges.configuredCharges.baseMonthlyFee.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Laundry Fee */}
                  <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#07A64F] to-[#07A64F]/80 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🧺</span>
                      </div>
                      <div>
                        <div className="font-medium">Laundry Service</div>
                        <div className="text-sm text-gray-600">Monthly laundry package</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#07A64F]">
                        NPR {selectedStudentCharges.configuredCharges.laundryFee.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Food Fee */}
                  <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🍽️</span>
                      </div>
                      <div>
                        <div className="font-medium">Food Service</div>
                        <div className="text-sm text-gray-600">Monthly meal plan</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-600">
                        NPR {selectedStudentCharges.configuredCharges.foodFee.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Additional Charges */}
                  {selectedStudentCharges.configuredCharges.additionalCharges.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 mt-4 mb-2">Additional Charges:</div>
                      {selectedStudentCharges.configuredCharges.additionalCharges.map((charge, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">⚠️</span>
                            </div>
                            <div>
                              <div className="font-medium">{charge.type}</div>
                              <div className="text-sm text-gray-600">
                                Applied: {new Date(charge.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-yellow-700">
                              NPR {charge.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-[#1295D0]/10 to-[#07A64F]/10 border-2 border-dashed border-[#1295D0]/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg text-gray-900">Total Monthly Amount</div>
                      <div className="text-sm text-gray-600">
                        Based on configuration from {new Date(selectedStudentCharges.configuredCharges.configurationDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#07A64F]">
                        NPR {selectedStudentCharges.invoice.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Invoice: {selectedStudentCharges.invoice.referenceId}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};