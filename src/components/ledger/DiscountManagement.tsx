
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Discount {
  id: string;
  studentName: string;
  room: string;
  amount: number;
  reason: string;
  appliedTo: string;
  date: string;
  status: 'active' | 'expired';
}

export const DiscountManagement = () => {
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  // Mock discount data
  const [discounts] = useState<Discount[]>([
    {
      id: "DISC-001",
      studentName: "Ram Sharma",
      room: "A-101",
      amount: 1000,
      reason: "Good behavior discount",
      appliedTo: "March 2024 Invoice",
      date: "2024-03-10",
      status: "active"
    },
    {
      id: "DISC-002",
      studentName: "Sita Poudel",
      room: "B-205",
      amount: 2000,
      reason: "Early payment discount",
      appliedTo: "February 2024 Invoice",
      date: "2024-02-05",
      status: "active"
    },
    {
      id: "DISC-003",
      studentName: "Hari Thapa",
      room: "C-301",
      amount: 500,
      reason: "Referral bonus",
      appliedTo: "January 2024 Invoice",
      date: "2024-01-15",
      status: "expired"
    }
  ]);

  const students = [
    { id: "1", name: "Ram Sharma", room: "A-101" },
    { id: "2", name: "Sita Poudel", room: "B-205" },
    { id: "3", name: "Hari Thapa", room: "C-301" }
  ];

  const discountReasons = [
    "Good behavior discount",
    "Early payment discount", 
    "Referral bonus",
    "Financial hardship",
    "Long stay discount",
    "Sibling discount",
    "Academic excellence",
    "Custom reason"
  ];

  const totalActiveDiscounts = discounts
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + d.amount, 0);

  const handleDiscountSubmit = () => {
    console.log("Discount submitted:", {
      student: selectedStudent,
      amount: discountAmount,
      reason: discountReason,
      appliedTo: appliedTo
    });
    setShowDiscountForm(false);
    // Reset form
    setSelectedStudent("");
    setDiscountAmount("");
    setDiscountReason("");
    setAppliedTo("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">🏷️ Discount Management</h2>
        <Button onClick={() => setShowDiscountForm(true)}>
          ➕ Apply New Discount
        </Button>
      </div>

      {/* Discount Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              ₨{totalActiveDiscounts.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Active Discounts</div>
            <div className="text-xs mt-1 text-blue-600">💰 Currently applied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {discounts.filter(d => d.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Active Discount Records</div>
            <div className="text-xs mt-1 text-green-600">📊 Current count</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {discounts.length}
            </div>
            <div className="text-sm text-gray-500">Total Discount History</div>
            <div className="text-xs mt-1 text-gray-600">📋 All time</div>
          </CardContent>
        </Card>
      </div>

      {/* Discounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Discount ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Applied To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-medium">{discount.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{discount.studentName}</div>
                      <div className="text-sm text-gray-500">Room: {discount.room}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    ₨{discount.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{discount.reason}</TableCell>
                  <TableCell>{discount.appliedTo}</TableCell>
                  <TableCell>{new Date(discount.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={discount.status === 'active' ? 'default' : 'secondary'}>
                      {discount.status === 'active' ? '✅ Active' : '⏰ Expired'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">👁️</Button>
                      {discount.status === 'active' && (
                        <Button size="sm" variant="outline">❌</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Apply Discount Form Modal */}
      {showDiscountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg m-4">
            <CardHeader>
              <CardTitle>🏷️ Apply New Discount</CardTitle>
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
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Discount Amount (₨) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter discount amount"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="reason">Discount Reason *</Label>
                <Select value={discountReason} onValueChange={setDiscountReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {discountReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {discountReason === "Custom reason" && (
                <div>
                  <Label htmlFor="customReason">Custom Reason *</Label>
                  <Input
                    id="customReason"
                    placeholder="Enter custom reason"
                    onChange={(e) => setDiscountReason(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="appliedTo">Apply To *</Label>
                <Select value={appliedTo} onValueChange={setAppliedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice to apply discount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Month Invoice</SelectItem>
                    <SelectItem value="next">Next Month Invoice</SelectItem>
                    <SelectItem value="outstanding">Outstanding Dues</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important Notes:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Discount will be immediately applied to selected invoice</li>
                  <li>• This action cannot be undone easily</li>
                  <li>• Ensure the discount amount and reason are correct</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowDiscountForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDiscountSubmit}
                  disabled={!selectedStudent || !discountAmount || !discountReason || !appliedTo}
                >
                  💾 Apply Discount
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
