
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LedgerEntry {
  id: string;
  date: string;
  type: 'invoice' | 'payment' | 'discount' | 'advance';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
}

export const StudentLedgerView = () => {
  const [selectedStudent, setSelectedStudent] = useState("");

  const students = [
    { id: "1", name: "Ram Sharma", room: "A-101" },
    { id: "2", name: "Sita Poudel", room: "B-205" },
    { id: "3", name: "Hari Thapa", room: "C-301" }
  ];

  // Mock ledger data for Ram Sharma
  const ledgerEntries: LedgerEntry[] = [
    {
      id: "1",
      date: "2024-01-15",
      type: "advance",
      description: "Initial advance payment",
      debit: 0,
      credit: 25000,
      balance: -25000,
      reference: "ADV-001"
    },
    {
      id: "2",
      date: "2024-02-01",
      type: "invoice",
      description: "February 2024 - Monthly charges",
      debit: 21500,
      credit: 0,
      balance: -3500,
      reference: "INV-2024-001"
    },
    {
      id: "3",
      date: "2024-03-01",
      type: "invoice",
      description: "March 2024 - Monthly charges",
      debit: 21500,
      credit: 0,
      balance: 18000,
      reference: "INV-2024-002"
    },
    {
      id: "4",
      date: "2024-03-05",
      type: "payment",
      description: "Cash payment",
      debit: 0,
      credit: 10000,
      balance: 8000,
      reference: "PAY-001"
    },
    {
      id: "5",
      date: "2024-03-10",
      type: "discount",
      description: "Good behavior discount",
      debit: 0,
      credit: 1000,
      balance: 7000,
      reference: "DISC-001"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice': return '🧾';
      case 'payment': return '💰';
      case 'discount': return '🏷️';
      case 'advance': return '⬆️';
      default: return '📋';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'invoice':
        return <Badge className="bg-red-100 text-red-800">Invoice</Badge>;
      case 'payment':
        return <Badge className="bg-green-100 text-green-800">Payment</Badge>;
      case 'discount':
        return <Badge className="bg-blue-100 text-blue-800">Discount</Badge>;
      case 'advance':
        return <Badge className="bg-purple-100 text-purple-800">Advance</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const currentBalance = ledgerEntries[ledgerEntries.length - 1]?.balance || 0;
  const totalDebits = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">📋 Student Ledger View</h2>
        <div className="flex space-x-2">
          <Button variant="outline">🖨️ Print Ledger</Button>
          <Button variant="outline">📄 Download PDF</Button>
        </div>
      </div>

      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle>👤 Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Choose student to view ledger" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} - Room {student.room}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedStudent && (
        <>
          {/* Student Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  ₨{Math.abs(currentBalance).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Current {currentBalance >= 0 ? 'Outstanding' : 'Advance'}
                </div>
                <div className="text-xs mt-1">
                  {currentBalance >= 0 ? '🔴 Amount Due' : '🟢 Credit Balance'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  ₨{totalDebits.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Charges</div>
                <div className="text-xs mt-1 text-red-600">📈 All invoices</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  ₨{totalCredits.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Payments</div>
                <div className="text-xs mt-1 text-green-600">💰 All credits</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">
                  {ledgerEntries.length}
                </div>
                <div className="text-sm text-gray-500">Total Transactions</div>
                <div className="text-xs mt-1 text-gray-600">📋 All entries</div>
              </CardContent>
            </Card>
          </div>

          {/* Ledger Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                📊 Ledger for {students.find(s => s.id === selectedStudent)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Debit (₨)</TableHead>
                    <TableHead className="text-right">Credit (₨)</TableHead>
                    <TableHead className="text-right">Balance (₨)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{getTypeIcon(entry.type)}</span>
                          {getTypeBadge(entry.type)}
                        </div>
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {entry.reference}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.debit > 0 && (
                          <span className="text-red-600 font-medium">
                            ₨{entry.debit.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.credit > 0 && (
                          <span className="text-green-600 font-medium">
                            ₨{entry.credit.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        <span className={entry.balance >= 0 ? 'text-red-600' : 'text-green-600'}>
                          ₨{Math.abs(entry.balance).toLocaleString()}
                          {entry.balance >= 0 ? ' Dr' : ' Cr'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Running Balance Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Final Balance:</span>
                  <span className={`text-xl font-bold ${currentBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₨{Math.abs(currentBalance).toLocaleString()} {currentBalance >= 0 ? 'Outstanding' : 'Advance'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {currentBalance >= 0 
                    ? '🔴 Student has outstanding dues to pay'
                    : '🟢 Student has advance balance available'
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
