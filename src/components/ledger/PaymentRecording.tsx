
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  studentName: string;
  room: string;
  amount: number;
  paymentMode: string;
  referenceId?: string;
  date: string;
  appliedTo: string;
  advanceBalance: number;
}

export const PaymentRecording = () => {
  const { state } = useAppContext();
  const location = useLocation();
  const { toast } = useToast();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [referenceId, setReferenceId] = useState("");

  // Handle URL parameters to auto-select student and show payment form
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentParam = params.get('student');
    const amountParam = params.get('amount');
    const typeParam = params.get('type');
    
    if (studentParam && state.students.find(s => s.id === studentParam)) {
      setSelectedStudent(studentParam);
      setShowPaymentForm(true);
      
      // Pre-fill amount if provided
      if (amountParam) {
        setPaymentAmount(amountParam);
      }
      
      // Set default payment mode for outstanding dues
      if (typeParam === 'outstanding') {
        setPaymentMode('cash');
      }
      
      const student = state.students.find(s => s.id === studentParam);
      toast({
        title: "Payment Form Ready",
        description: `Payment form opened for ${student?.name}${amountParam ? ` with amount NPR ${Number(amountParam).toLocaleString()}` : ''}.`,
      });
    }
  }, [location.search, state.students, toast]);

  // Mock payment data
  const [payments] = useState<Payment[]>([
    {
      id: "PAY-001",
      studentName: "Ram Sharma",
      room: "A-101",
      amount: 10000,
      paymentMode: "Cash",
      date: "2024-03-05",
      appliedTo: "March 2024 Invoice",
      advanceBalance: 0
    },
    {
      id: "PAY-002",
      studentName: "Sita Poudel",
      room: "B-205",
      amount: 18000,
      paymentMode: "eSewa",
      referenceId: "ESW12345",
      date: "2024-03-03",
      appliedTo: "March 2024 Invoice",
      advanceBalance: 2000
    }
  ]);

  // Use real student data from context
  const students = state.students.map(student => ({
    id: student.id,
    name: student.name,
    room: student.roomNumber,
    outstandingDue: student.currentBalance || 0,
    advanceBalance: student.advanceBalance || 0
  }));

  const paymentModes = [
    { value: "cash", label: "💵 Cash" },
    { value: "bank", label: "🏦 Bank Transfer" },
    { value: "esewa", label: "📱 eSewa" },
    { value: "khalti", label: "📱 Khalti" },
    { value: "cheque", label: "📝 Cheque" }
  ];

  const needsReference = paymentMode === "esewa" || paymentMode === "khalti" || paymentMode === "bank";

  const handlePaymentSubmit = () => {
    console.log("Payment submitted:", {
      student: selectedStudent,
      amount: paymentAmount,
      mode: paymentMode,
      reference: referenceId
    });
    setShowPaymentForm(false);
    // Reset form
    setSelectedStudent("");
    setPaymentAmount("");
    setPaymentMode("");
    setReferenceId("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">💰 Payment Recording</h2>
        <Button onClick={() => setShowPaymentForm(true)}>
          ➕ Record New Payment
        </Button>
      </div>

      {/* Outstanding Dues Summary */}
      <Card>
        <CardHeader>
          <CardTitle>🚨 Students with Outstanding Dues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {students.filter(s => s.outstandingDue > 0).map((student) => (
              <div key={student.id} className="p-4 border rounded-lg bg-red-50 border-red-200">
                <div className="font-medium">{student.name}</div>
                <div className="text-sm text-gray-600">Room: {student.room}</div>
                <div className="text-lg font-bold text-red-600 mt-2">
                  ₨{student.outstandingDue.toLocaleString()}
                </div>
                <Button 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => {
                    setSelectedStudent(student.id);
                    setShowPaymentForm(true);
                  }}
                >
                  💰 Record Payment
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Applied To</TableHead>
                <TableHead>Advance Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.studentName}</div>
                      <div className="text-sm text-gray-500">Room: {payment.room}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    ₨{payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.paymentMode}</Badge>
                  </TableCell>
                  <TableCell>{payment.referenceId || "-"}</TableCell>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.appliedTo}</TableCell>
                  <TableCell>
                    {payment.advanceBalance > 0 ? (
                      <span className="text-blue-600 font-medium">
                        ₨{payment.advanceBalance.toLocaleString()}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Recording Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg m-4">
            <CardHeader>
              <CardTitle>💰 Record New Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="student">Select Student *</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - Room {student.room}
                        {student.outstandingDue > 0 && (
                          <span className="text-red-600 ml-2">
                            (Due: ₨{student.outstandingDue.toLocaleString()})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Payment Amount (₨) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="mode">Payment Mode *</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {needsReference && (
                <div>
                  <Label htmlFor="reference">
                    Reference ID * 
                    {paymentMode === "esewa" && " (eSewa Transaction ID)"}
                    {paymentMode === "khalti" && " (Khalti Transaction ID)"}
                    {paymentMode === "bank" && " (Bank Reference Number)"}
                  </Label>
                  <Input
                    id="reference"
                    placeholder="Enter reference ID"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                  />
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">💡 Payment Application Rules:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Payments are applied to oldest dues first</li>
                  <li>• Excess amount becomes advance balance</li>
                  <li>• Advance balance auto-applies to future invoices</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePaymentSubmit}
                  disabled={!selectedStudent || !paymentAmount || !paymentMode || (needsReference && !referenceId)}
                >
                  💾 Record Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
