import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, User, Bed, DollarSign, Calendar, CreditCard, LogOut, CheckCircle } from "lucide-react";
import { monthlyInvoiceService } from "@/services/monthlyInvoiceService.js";
import { ledgerService } from "@/services/ledgerService.js";
import { checkoutService } from "@/services/checkoutService.js";
import { mockData } from "@/data/mockData.js";
import { useAppContext } from "@/contexts/AppContext";

interface Student {
    id: string;
    name: string;
    phone: string;
    email: string;
    roomNumber: string;
    course: string;
    institution: string;
    baseMonthlyFee: number;
    laundryFee: number;
    foodFee: number;
    joinDate: string;
    status: string;
    isCheckedOut: boolean;
    checkoutDate: string | null;
    currentBalance: number;
    totalPaid: number;
    totalDue: number;
    lastPaymentDate: string;
    configurationDate?: string;
    additionalCharges?: any[];
}

interface LedgerEntry {
    id: string;
    studentId: string;
    date: string;
    type: string;
    description: string;
    referenceId: string | null;
    debit: number;
    credit: number;
    balance?: number;
    balanceType?: string;
    remark?: string;
}

interface CheckoutSettings {
    allowCheckoutWithoutPayment: boolean;
}

// Checkout Dialog Component
interface CheckoutDialogProps {
    student: Student;
    isOpen: boolean;
    onClose: () => void;
    onCheckoutComplete: (studentId: string) => void;
}

const CheckoutDialog = ({ student, isOpen, onClose, onCheckoutComplete }: CheckoutDialogProps) => {
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
    const [currentMonthBilling, setCurrentMonthBilling] = useState<any>(null);
    const [totalDueAmount, setTotalDueAmount] = useState(0);
    const [allowCheckoutWithoutPayment, setAllowCheckoutWithoutPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentRemark, setPaymentRemark] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && student) {
            loadCheckoutData();
        }
    }, [isOpen, student]);

    const loadCheckoutData = async () => {
        try {
            setLoading(true);

            // Load existing ledger entries using ledger service
            let studentLedger: LedgerEntry[] = [];

            try {
                // Try to get ledger by student ID directly
                studentLedger = await ledgerService.getLedgerByStudentId(student.id);

                // If no entries found, try with different ID formats
                if (studentLedger.length === 0) {
                    // Convert student_001 to STU001 format
                    const altId = student.id.replace('student_', 'STU');
                    studentLedger = await ledgerService.getLedgerByStudentId(altId);
                }

                // If still no entries, create some sample entries for demonstration
                if (studentLedger.length === 0) {
                    studentLedger = [
                        {
                            id: `LED${Date.now()}_1`,
                            studentId: student.id,
                            date: "2024-01-01",
                            type: "Invoice",
                            description: "Monthly fees - January 2024",
                            referenceId: "INV001",
                            debit: student.baseMonthlyFee + student.laundryFee + student.foodFee,
                            credit: 0,
                            remark: "Initial monthly invoice"
                        },
                        {
                            id: `LED${Date.now()}_2`,
                            studentId: student.id,
                            date: "2024-01-15",
                            type: "Payment",
                            description: "Payment received - Cash",
                            referenceId: "PAY001",
                            debit: 0,
                            credit: (student.baseMonthlyFee + student.laundryFee + student.foodFee) * 0.8,
                            remark: "Partial payment"
                        }
                    ];
                }
            } catch (error) {
                console.error('Error loading ledger data:', error);
                // Create sample ledger entries if service fails
                studentLedger = [
                    {
                        id: `LED${Date.now()}_1`,
                        studentId: student.id,
                        date: "2024-01-01",
                        type: "Invoice",
                        description: "Monthly fees - January 2024",
                        referenceId: "INV001",
                        debit: student.baseMonthlyFee + student.laundryFee + student.foodFee,
                        credit: 0,
                        remark: "Initial monthly invoice"
                    },
                    {
                        id: `LED${Date.now()}_2`,
                        studentId: student.id,
                        date: "2024-01-15",
                        type: "Payment",
                        description: "Payment received - Cash",
                        referenceId: "PAY001",
                        debit: 0,
                        credit: (student.baseMonthlyFee + student.laundryFee + student.foodFee) * 0.7,
                        remark: "Partial payment"
                    }
                ];
            }

            setLedgerEntries(studentLedger);

            // Calculate current month's partial billing
            const today = new Date().toISOString().split('T')[0];
            const monthlyFee = student.baseMonthlyFee + student.laundryFee + student.foodFee;

            const currentMonthProration = monthlyInvoiceService.calculateCheckoutProration(monthlyFee, today);
            setCurrentMonthBilling(currentMonthProration);

            // Calculate total ledger balance
            const ledgerBalance = studentLedger.reduce((sum: number, entry: LedgerEntry) => {
                return sum + (entry.debit || 0) - (entry.credit || 0);
            }, 0);

            // Total due = existing ledger balance + current month's partial amount
            const totalDue = ledgerBalance + currentMonthProration.amount;
            setTotalDueAmount(Math.max(0, totalDue));
            setPaymentAmount(Math.max(0, totalDue).toString());

        } catch (error) {
            console.error('Error loading checkout data:', error);
            toast.error('Failed to load checkout data');
        } finally {
            setLoading(false);
        }
    };

    const bookPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            toast.error('Please enter a valid payment amount');
            return;
        }

        try {
            const amount = parseFloat(paymentAmount);
            const remark = paymentRemark || "Paid at checkout";

            // Hit the ledger service to add payment entry
            const paymentEntry = await ledgerService.bookCheckoutPayment(
                student.id,
                amount,
                remark
            );

            // Create local entry for immediate UI update
            const localPaymentEntry: LedgerEntry = {
                id: `LED${Date.now()}`,
                studentId: student.id,
                date: new Date().toISOString().split('T')[0],
                type: "Payment",
                description: "Payment booked during checkout",
                referenceId: null,
                debit: 0,
                credit: amount,
                remark: remark
            };

            setLedgerEntries(prev => [...prev, localPaymentEntry]);

            // Recalculate total due
            const newLedgerBalance = [...ledgerEntries, localPaymentEntry].reduce((sum, entry) => {
                return sum + (entry.debit || 0) - (entry.credit || 0);
            }, 0);

            const newTotalDue = newLedgerBalance + (currentMonthBilling?.amount || 0);
            setTotalDueAmount(Math.max(0, newTotalDue));

            // Clear payment form
            setPaymentAmount(Math.max(0, newTotalDue).toString());
            setPaymentRemark("");

            toast.success(`Payment of NPR ${amount.toLocaleString()} booked successfully and added to ledger`);

        } catch (error) {
            console.error('Error booking payment:', error);
            toast.error('Failed to book payment');
        }
    };

    const processCheckout = async () => {
        try {
            const checkoutDate = new Date().toISOString().split('T')[0];
            const hasDues = totalDueAmount > 0;

            if (hasDues && !allowCheckoutWithoutPayment) {
                toast.error('Cannot checkout with outstanding dues. Please book payment first or enable "Allow Checkout Without Payment"');
                return;
            }

            // 1. Add partial month billing to ledger (always add current month's billing)
            if (currentMonthBilling && currentMonthBilling.amount > 0) {
                try {
                    await ledgerService.addLedgerEntry({
                        studentId: student.id,
                        type: "Invoice",
                        description: `Partial month billing (${currentMonthBilling.daysCharged} days) - Checkout`,
                        debit: currentMonthBilling.amount,
                        credit: 0,
                        referenceId: `CHECKOUT-${student.id}-${Date.now()}`,
                        remark: `Student checkout, due till ${checkoutDate}`
                    });
                    console.log('✅ Partial billing added to ledger');
                } catch (error) {
                    console.error('Error adding partial billing to ledger:', error);
                }
            }

            // 2. Process checkout through checkout service
            const checkoutData = {
                studentId: student.id,
                checkoutDate: checkoutDate,
                reason: "Student checkout",
                notes: `Checkout processed with ${hasDues ? 'outstanding dues' : 'cleared dues'}`,
                duesCleared: !hasDues,
                hadOutstandingDues: hasDues,
                outstandingAmount: totalDueAmount,
                hitLedger: true,
                processedBy: "Admin"
            };

            // Use checkout service to handle bed freeing and invoice stopping
            const checkoutResult = await checkoutService.processCheckout(checkoutData);
            console.log('✅ Checkout processed:', checkoutResult);

            // 3. Update student status and track for dashboard if has dues
            const updatedStudentData = {
                isCheckedOut: true,
                checkoutDate: checkoutDate,
                status: hasDues ? 'Checked out with dues' : 'Checked out',
                finalBalance: totalDueAmount,
                bedFreed: true,
                invoicesStopped: true
            };

            // 4. If student has dues, add to dashboard tracking
            if (hasDues) {
                const checkedOutWithDues = {
                    studentId: student.id,
                    studentName: student.name,
                    roomNumber: student.roomNumber,
                    checkoutDate: checkoutDate,
                    outstandingDues: totalDueAmount,
                    lastUpdated: new Date().toISOString(),
                    status: 'pending_payment'
                };

                // Store in localStorage for dashboard display (in real app, this would be database)
                const existingData = JSON.parse(localStorage.getItem('checkedOutWithDues') || '[]');
                existingData.push(checkedOutWithDues);
                localStorage.setItem('checkedOutWithDues', JSON.stringify(existingData));
                console.log('✅ Student added to dashboard tracking for outstanding dues');
            }

            // 5. Complete checkout
            onCheckoutComplete(student.id);
            onClose();

            // 6. Show appropriate success message
            if (hasDues) {
                toast.warning(
                    `⚠️ Student checked out with dues of NPR ${totalDueAmount.toLocaleString()}. 
                    • Dues added to ledger
                    • Bed ${student.roomNumber} freed
                    • Monthly invoices stopped
                    • Student will appear on dashboard until dues are cleared`,
                    { duration: 8000 }
                );
            } else {
                toast.success(
                    `✅ Student checked out successfully! 
                    • All dues cleared
                    • Bed ${student.roomNumber} freed
                    • Monthly invoices stopped`,
                    { duration: 6000 }
                );
            }

        } catch (error) {
            console.error('Error processing checkout:', error);
            toast.error('Failed to process checkout. Please try again.');
        }
    };

    if (loading) {
        return (
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <svg width="32" height="48" viewBox="0 0 55 83" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse mx-auto">
                                <g clipPath="url(#clip0_319_901)">
                                    <path d="M27.3935 0.0466309C12.2652 0.0466309 0 12.2774 0 27.3662C0 40.746 7.8608 47.9976 16.6341 59.8356C25.9039 72.3432 27.3935 74.1327 27.3935 74.1327C27.3935 74.1327 31.3013 69.0924 37.9305 59.9483C46.5812 48.0201 54.787 40.746 54.787 27.3662C54.787 12.2774 42.5218 0.0466309 27.3935 0.0466309Z" fill="#07A64F"/>
                                    <path d="M31.382 79.0185C31.382 81.2169 29.5957 83 27.3935 83C25.1913 83 23.4051 81.2169 23.4051 79.0185C23.4051 76.8202 25.1913 75.0371 27.3935 75.0371C29.5957 75.0371 31.382 76.8202 31.382 79.0185Z" fill="#07A64F"/>
                                    <path d="M14.4383 33.34C14.4383 33.34 14.0063 32.3905 14.8156 33.0214C15.6249 33.6522 27.3516 47.8399 39.7618 33.2563C39.7618 33.2563 41.0709 31.8047 40.2358 33.4816C39.4007 35.1585 28.1061 50.8718 14.4383 33.34Z" fill="#231F20"/>
                                    <path d="M27.3935 47.6498C38.5849 47.6498 47.6548 38.5926 47.6548 27.424C47.6548 16.2554 38.5817 7.19824 27.3935 7.19824C16.2052 7.19824 7.12885 16.2522 7.12885 27.424C7.12885 34.9878 11.2882 41.5795 17.4465 45.0492L13.1389 55.2554C14.2029 56.6233 15.2992 58.0427 16.4083 59.5329L21.7574 46.858C23.5469 47.373 25.4363 47.6498 27.3935 47.6498Z" fill="#1295D0"/>
                                    <path d="M45.2334 27.4241C45.2334 37.2602 37.2469 45.2327 27.3935 45.2327C17.5401 45.2327 9.55353 37.2602 9.55353 27.4241C9.55353 17.588 17.5401 9.61548 27.3935 9.61548C37.2437 9.61548 45.2334 17.588 45.2334 27.4241Z" fill="white"/>
                                    <path d="M14.4383 33.3398C14.4383 33.3398 14.0063 32.3903 14.8156 33.0211C15.6249 33.652 27.3516 47.8396 39.7618 33.2561C39.7618 33.2561 41.0709 31.8045 40.2358 33.4814C39.4007 35.1583 28.1061 50.8716 14.4383 33.3398Z" fill="#231F20"/>
                                </g>
                                <defs>
                                    <clipPath id="clip0_319_901">
                                        <rect width="54.787" height="82.9534" fill="white" transform="translate(0 0.0466309)"/>
                                    </clipPath>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#07A64F] border-r-[#1295D0]"></div>
                        </div>
                        <p className="text-gray-600">Loading checkout data...</p>
                    </div>
                </div>
            </DialogContent>
        );
    }

    return (
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-[#1295D0]" />
                    Checkout - {student.name}
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold">{student.name}</h3>
                            <p className="text-sm text-gray-600">{student.roomNumber} • {student.course}</p>
                        </div>
                    </div>
                </div>

                {/* Existing Ledger */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Existing Ledger
                            </div>
                            <Badge variant="outline" className="text-blue-600">
                                {ledgerEntries.length} Entries
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {ledgerEntries.length > 0 ? (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {ledgerEntries.map((entry, index) => (
                                    <div key={entry.id} className={`p-4 rounded-lg border-l-4 ${entry.type === 'Invoice' ? 'bg-red-50 border-red-400' :
                                        entry.type === 'Payment' ? 'bg-green-50 border-green-400' :
                                            'bg-blue-50 border-blue-400'
                                        }`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant={entry.type === 'Invoice' ? 'destructive' : entry.type === 'Payment' ? 'default' : 'secondary'} className="text-xs">
                                                        {entry.type}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">#{entry.id}</span>
                                                </div>
                                                <p className="font-medium text-gray-900">{entry.description}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    📅 {new Date(entry.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                    {entry.referenceId && (
                                                        <span className="ml-2">📄 Ref: {entry.referenceId}</span>
                                                    )}
                                                </p>
                                                {entry.remark && (
                                                    <p className="text-xs text-gray-500 mt-1 italic">💬 {entry.remark}</p>
                                                )}
                                            </div>
                                            <div className="text-right ml-4">
                                                {entry.debit > 0 && (
                                                    <div className="text-red-600">
                                                        <p className="font-bold text-lg">NPR {entry.debit.toLocaleString()}</p>
                                                        <p className="text-xs">Debit</p>
                                                    </div>
                                                )}
                                                {entry.credit > 0 && (
                                                    <div className="text-green-600">
                                                        <p className="font-bold text-lg">NPR {entry.credit.toLocaleString()}</p>
                                                        <p className="text-xs">Credit</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Ledger Summary */}
                                <div className="mt-4 p-4 bg-gray-100 rounded-lg border-t-4 border-gray-400">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Ledger Balance:</span>
                                        <span className={`font-bold text-lg ${ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0) > 0
                                            ? 'text-red-600'
                                            : 'text-green-600'
                                            }`}>
                                            NPR {Math.abs(ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0)).toLocaleString()}
                                            {ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0) > 0 ? ' (Due)' : ' (Credit)'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No ledger entries found</p>
                                <p className="text-sm text-gray-400">This student has no transaction history</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Current Month's Partial Billing */}
                {currentMonthBilling && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Current Month's Billing (Till Today)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Period:</span>
                                        <span className="font-medium">{currentMonthBilling.period}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Days Charged:</span>
                                        <span className="font-medium">{currentMonthBilling.daysCharged} of {currentMonthBilling.daysInMonth} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Daily Rate:</span>
                                        <span className="font-medium">NPR {currentMonthBilling.dailyRate.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                        <span className="font-bold">Partial Amount:</span>
                                        <span className="font-bold text-orange-600">NPR {currentMonthBilling.amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Total Due Amount */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Total Due Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex justify-between items-center">
                                <span className="text-red-800 font-medium">Total Amount Due:</span>
                                <span className="text-3xl font-bold text-red-900">
                                    NPR {totalDueAmount.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-red-600 mt-2">
                                Ledger Balance + Current Month's Partial Billing
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Checkout Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Checkout Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <Label className="text-base font-medium">Allow Checkout Without Payment</Label>
                                <p className="text-sm text-gray-500">
                                    If enabled, student can checkout with dues (will be added to ledger)
                                </p>
                            </div>
                            <Switch
                                checked={allowCheckoutWithoutPayment}
                                onCheckedChange={setAllowCheckoutWithoutPayment}
                            />
                        </div>

                        {/* Book Payment Section */}
                        {totalDueAmount > 0 && !allowCheckoutWithoutPayment && (
                            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-medium text-green-900">Book Payment</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentAmount">Payment Amount (NPR)</Label>
                                        <Input
                                            id="paymentAmount"
                                            type="number"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            placeholder="Enter payment amount"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentRemark">Payment Remark (Optional)</Label>
                                        <Input
                                            id="paymentRemark"
                                            value={paymentRemark}
                                            onChange={(e) => setPaymentRemark(e.target.value)}
                                            placeholder="Payment remark"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={bookPayment}
                                    className="w-full bg-[#07A64F] hover:bg-[#07A64F]/90"
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Book Payment
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                    <Button
                        onClick={processCheckout}
                        disabled={totalDueAmount > 0 && !allowCheckoutWithoutPayment}
                        className="bg-[#1295D0] hover:bg-[#1295D0]/90 flex-1"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Complete Checkout
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </DialogContent>
    );
};

// Updated: 2025-01-08 - Simplified checkout with only checkout button
export const StudentCheckoutManagement = () => {
    console.log('🔄 NEW StudentCheckoutManagement component loaded - Only Checkout Button!');
    const { state } = useAppContext();
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

    // Load students data
    useEffect(() => {
        const loadStudents = async () => {
            try {
                // Use AppContext students data
                const activeStudents = state.students.filter((student: Student) =>
                    student.status === 'Active' && !student.isCheckedOut
                );

                setStudents(activeStudents);
                setFilteredStudents(activeStudents);
            } catch (error) {
                console.error('Error loading students:', error);
                toast.error('Failed to load students data');
            } finally {
                setLoading(false);
            }
        };

        loadStudents();
    }, []);

    // Filter students based on search
    useEffect(() => {
        if (!searchTerm) {
            setFilteredStudents(students);
        } else {
            const filtered = students.filter(student =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredStudents(filtered);
        }
    }, [searchTerm, students]);

    const handleCheckoutClick = (student: Student) => {
        setSelectedStudent(student);
        setShowCheckoutDialog(true);
    };

    const handleCheckoutComplete = (studentId: string) => {
        // Remove student from checkout list (they're now checked out)
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setSelectedStudent(null);

        console.log(`✅ Student ${studentId} removed from checkout list - checkout completed`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <svg width="32" height="48" viewBox="0 0 55 83" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse mx-auto">
                            <g clipPath="url(#clip0_319_901)">
                                <path d="M27.3935 0.0466309C12.2652 0.0466309 0 12.2774 0 27.3662C0 40.746 7.8608 47.9976 16.6341 59.8356C25.9039 72.3432 27.3935 74.1327 27.3935 74.1327C27.3935 74.1327 31.3013 69.0924 37.9305 59.9483C46.5812 48.0201 54.787 40.746 54.787 27.3662C54.787 12.2774 42.5218 0.0466309 27.3935 0.0466309Z" fill="#07A64F"/>
                                <path d="M31.382 79.0185C31.382 81.2169 29.5957 83 27.3935 83C25.1913 83 23.4051 81.2169 23.4051 79.0185C23.4051 76.8202 25.1913 75.0371 27.3935 75.0371C29.5957 75.0371 31.382 76.8202 31.382 79.0185Z" fill="#07A64F"/>
                                <path d="M14.4383 33.34C14.4383 33.34 14.0063 32.3905 14.8156 33.0214C15.6249 33.6522 27.3516 47.8399 39.7618 33.2563C39.7618 33.2563 41.0709 31.8047 40.2358 33.4816C39.4007 35.1585 28.1061 50.8718 14.4383 33.34Z" fill="#231F20"/>
                                <path d="M27.3935 47.6498C38.5849 47.6498 47.6548 38.5926 47.6548 27.424C47.6548 16.2554 38.5817 7.19824 27.3935 7.19824C16.2052 7.19824 7.12885 16.2522 7.12885 27.424C7.12885 34.9878 11.2882 41.5795 17.4465 45.0492L13.1389 55.2554C14.2029 56.6233 15.2992 58.0427 16.4083 59.5329L21.7574 46.858C23.5469 47.373 25.4363 47.6498 27.3935 47.6498Z" fill="#1295D0"/>
                                <path d="M45.2334 27.4241C45.2334 37.2602 37.2469 45.2327 27.3935 45.2327C17.5401 45.2327 9.55353 37.2602 9.55353 27.4241C9.55353 17.588 17.5401 9.61548 27.3935 9.61548C37.2437 9.61548 45.2334 17.588 45.2334 27.4241Z" fill="white"/>
                                <path d="M14.4383 33.3398C14.4383 33.3398 14.0063 32.3903 14.8156 33.0211C15.6249 33.652 27.3516 47.8396 39.7618 33.2561C39.7618 33.2561 41.0709 31.8045 40.2358 33.4814C39.4007 35.1583 28.1061 50.8716 14.4383 33.3398Z" fill="#231F20"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_319_901">
                                    <rect width="54.787" height="82.9534" fill="white" transform="translate(0 0.0466309)"/>
                                </clipPath>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#07A64F] border-r-[#1295D0]"></div>
                    </div>
                    <p className="text-gray-600">Loading students...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#231F20]">Student Checkout Management</h1>
                    <p className="text-[#231F20]/70 mt-1">
                        Complete student checkout process with ledger review and payment settlement
                    </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-[#1295D0] border-[#1295D0]/30">
                        {filteredStudents.length} Active Students
                    </Badge>
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name, ID, or room number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Students List */}
            <div className="grid gap-4">
                {filteredStudents.length === 0 ? (
                    <Card>
                        <CardContent className="pt-8 pb-8 text-center">
                            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                            <p className="text-gray-500">
                                {searchTerm ? 'No students match your search criteria.' : 'All students have been checked out.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredStudents.map((student) => (
                        <Card key={student.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                    {/* Student Info */}
                                    <div className="lg:col-span-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[#231F20]">{student.name}</h3>
                                                <p className="text-sm text-gray-600">{student.id}</p>
                                                <p className="text-xs text-gray-500">{student.course}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Room Info */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center space-x-2">
                                            <Bed className="h-4 w-4 text-[#1295D0]" />
                                            <div>
                                                <p className="font-medium text-[#231F20]">{student.roomNumber}</p>
                                                <p className="text-xs text-gray-500">Current Room</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Monthly Fee */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="h-4 w-4 text-green-500" />
                                            <div>
                                                <p className="font-bold text-green-600">
                                                    NPR {(student.baseMonthlyFee + student.laundryFee + student.foodFee).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500">Monthly Fee</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Balance */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-orange-500" />
                                            <div>
                                                <p className={`font-bold ${student.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    NPR {Math.abs(student.currentBalance).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {student.currentBalance > 0 ? 'Outstanding' : 'Up to date'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Checkout Button */}
                                    <div className="lg:col-span-2">
                                        <Button
                                            onClick={() => handleCheckoutClick(student)}
                                            className="w-full bg-[#1295D0] hover:bg-[#1295D0]/90"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Checkout
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Checkout Dialog */}
            {selectedStudent && (
                <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
                    <CheckoutDialog
                        student={selectedStudent}
                        isOpen={showCheckoutDialog}
                        onClose={() => {
                            setShowCheckoutDialog(false);
                            setSelectedStudent(null);
                        }}
                        onCheckoutComplete={handleCheckoutComplete}
                    />
                </Dialog>
            )}
        </div>
    );
};