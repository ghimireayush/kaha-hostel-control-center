
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

interface Invoice {
  id: string;
  studentName: string;
  room: string;
  month: string;
  baseFee: number;
  extraServices: number;
  previousDue: number;
  discount: number;
  totalAmount: number;
  status: 'unpaid' | 'partially_paid' | 'paid';
  createdDate: string;
  dueDate: string;
}

export const InvoiceManagement = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    baseFee: number;
    extraServices: number;
    previousDue: number;
    discount: number;
    status: string;
    dueDate: string;
  } | null>(null);
  const { toast } = useToast();

  // Mock invoice data
  const [invoices] = useState<Invoice[]>([
    {
      id: "BL-2024-03-123401",
      studentName: "Ram Sharma",
      room: "A-101",
      month: "March 2024",
      baseFee: 12000,
      extraServices: 2500,
      previousDue: 5000,
      discount: 0,
      totalAmount: 19500,
      status: "partially_paid",
      createdDate: "2024-03-01",
      dueDate: "2024-03-10"
    },
    {
      id: "BL-2024-03-123402",
      studentName: "Sita Poudel",
      room: "B-205",
      month: "March 2024",
      baseFee: 15000,
      extraServices: 2000,
      previousDue: 0,
      discount: 1000,
      totalAmount: 16000,
      status: "paid",
      createdDate: "2024-03-01",
      dueDate: "2024-03-10"
    },
    {
      id: "BL-2024-03-123403",
      studentName: "Hari Thapa",
      room: "C-301",
      month: "March 2024",
      baseFee: 10000,
      extraServices: 1500,
      previousDue: 3000,
      discount: 500,
      totalAmount: 14000,
      status: "unpaid",
      createdDate: "2024-03-01",
      dueDate: "2024-03-10"
    }
  ]);

  const filteredInvoices = invoices.filter(invoice => {
    const statusMatch = filterStatus === "all" || invoice.status === filterStatus;
    const monthMatch = filterMonth === "all" || invoice.month.includes(filterMonth);
    return statusMatch && monthMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">✅ Paid</Badge>;
      case "partially_paid":
        return <Badge className="bg-yellow-100 text-yellow-800">⚠️ Partially Paid</Badge>;
      case "unpaid":
        return <Badge className="bg-red-100 text-red-800">❌ Unpaid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowViewDialog(true);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    toast({
      title: "Printing Invoice",
      description: `Printing invoice ${invoice.id} for ${invoice.studentName}`,
    });
    // In a real app, this would trigger the print functionality
    window.print();
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditFormData({
      baseFee: invoice.baseFee,
      extraServices: invoice.extraServices,
      previousDue: invoice.previousDue,
      discount: invoice.discount,
      status: invoice.status,
      dueDate: invoice.dueDate
    });
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">🧾 Invoice Management</h2>
        <Button>➕ Generate Bulk Invoices</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Filter Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">✅ Paid</SelectItem>
                  <SelectItem value="partially_paid">⚠️ Partially Paid</SelectItem>
                  <SelectItem value="unpaid">❌ Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="March">March 2024</SelectItem>
                  <SelectItem value="February">February 2024</SelectItem>
                  <SelectItem value="January">January 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List ({filteredInvoices.length} invoices)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount Breakdown</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.studentName}</div>
                      <div className="text-sm text-gray-500">Room: {invoice.room}</div>
                    </div>
                  </TableCell>
                  <TableCell>{invoice.month}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Base Fee: ₨{invoice.baseFee.toLocaleString()}</div>
                      {invoice.extraServices > 0 && (
                        <div>Extra Services: ₨{invoice.extraServices.toLocaleString()}</div>
                      )}
                      {invoice.previousDue > 0 && (
                        <div className="text-red-600">Previous Due: ₨{invoice.previousDue.toLocaleString()}</div>
                      )}
                      {invoice.discount > 0 && (
                        <div className="text-green-600">Discount: -₨{invoice.discount.toLocaleString()}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-lg">
                    ₨{invoice.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className={`${new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' ? 'text-red-600 font-medium' : ''}`}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewInvoice(invoice)}
                        title="View Invoice"
                      >
                        👁️
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePrintInvoice(invoice)}
                        title="Print Invoice"
                      >
                        🖨️
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditInvoice(invoice)}
                        title="Edit Invoice"
                      >
                        ✏️
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              ₨{invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Paid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              ₨{invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + i.totalAmount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Unpaid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              ₨{invoices.filter(i => i.status === 'partially_paid').reduce((sum, i) => sum + i.totalAmount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Partially Paid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {invoices.filter(i => new Date(i.dueDate) < new Date() && i.status !== 'paid').length}
            </div>
            <div className="text-sm text-gray-500">Overdue Invoices</div>
          </CardContent>
        </Card>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.id}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Student Information</h4>
                  <p>Name: {selectedInvoice.studentName}</p>
                  <p>Room: {selectedInvoice.room}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Invoice Information</h4>
                  <p>Month: {selectedInvoice.month}</p>
                  <p>Status: {selectedInvoice.status}</p>
                  <p>Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Amount Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Fee:</span>
                    <span>₨{selectedInvoice.baseFee.toLocaleString()}</span>
                  </div>
                  {selectedInvoice.extraServices > 0 && (
                    <div className="flex justify-between">
                      <span>Extra Services:</span>
                      <span>₨{selectedInvoice.extraServices.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedInvoice.previousDue > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Previous Due:</span>
                      <span>₨{selectedInvoice.previousDue.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₨{selectedInvoice.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₨{selectedInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handlePrintInvoice(selectedInvoice)} className="flex-1">
                  🖨️ Print Invoice
                </Button>
                <Button variant="outline" onClick={() => setShowViewDialog(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice - {selectedInvoice?.id}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && editFormData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseFee">Base Fee (₨)</Label>
                  <Input
                    id="baseFee"
                    type="number"
                    value={editFormData.baseFee}
                    onChange={(e) => setEditFormData({...editFormData, baseFee: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="extraServices">Extra Services (₨)</Label>
                  <Input
                    id="extraServices"
                    type="number"
                    value={editFormData.extraServices}
                    onChange={(e) => setEditFormData({...editFormData, extraServices: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="previousDue">Previous Due (₨)</Label>
                  <Input
                    id="previousDue"
                    type="number"
                    value={editFormData.previousDue}
                    onChange={(e) => setEditFormData({...editFormData, previousDue: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount (₨)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={editFormData.discount}
                    onChange={(e) => setEditFormData({...editFormData, discount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">❌ Unpaid</SelectItem>
                      <SelectItem value="partially_paid">⚠️ Partially Paid</SelectItem>
                      <SelectItem value="paid">✅ Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={editFormData.dueDate}
                    onChange={(e) => setEditFormData({...editFormData, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">
                    ₨{(editFormData.baseFee + editFormData.extraServices + editFormData.previousDue - editFormData.discount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => {
                  const updatedInvoice = {
                    ...selectedInvoice,
                    ...editFormData,
                    totalAmount: editFormData.baseFee + editFormData.extraServices + editFormData.previousDue - editFormData.discount
                  };
                  
                  toast({
                    title: "Invoice Updated",
                    description: `Invoice ${updatedInvoice.id} has been updated successfully.`,
                  });
                  setShowEditDialog(false);
                }} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
