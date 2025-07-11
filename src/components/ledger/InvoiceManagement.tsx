
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  // Mock invoice data
  const [invoices] = useState<Invoice[]>([
    {
      id: "INV-2024-001",
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
      id: "INV-2024-002",
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
      id: "INV-2024-003",
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
                      <Button size="sm" variant="outline">👁️</Button>
                      <Button size="sm" variant="outline">🖨️</Button>
                      <Button size="sm" variant="outline">✏️</Button>
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
    </div>
  );
};
