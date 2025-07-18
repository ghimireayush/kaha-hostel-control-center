import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, User, DollarSign, Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
    id: string;
    name: string;
    phone: string;
    roomNumber: string;
    currentBalance: number;
    status: string;
}

interface StudentCheckoutProps {
    student: Student;
    onCheckoutComplete: (studentId: string, checkoutData: any) => void;
    onClose: () => void;
}

export const StudentCheckout = ({ student, onCheckoutComplete, onClose }: StudentCheckoutProps) => {
    const [checkoutReason, setCheckoutReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [notes, setNotes] = useState("");
    const [duesCleared, setDuesCleared] = useState(student.currentBalance <= 0);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const hasDues = student.currentBalance > 0;
    const canCheckout = !hasDues || duesCleared;

    const checkoutReasons = [
        "Course Completed",
        "Transferred to Another Institution",
        "Personal/Family Reasons",
        "Financial Constraints",
        "Disciplinary Action",
        "Medical Reasons",
        "Job/Internship",
        "Other"
    ];

    const handleCheckout = async () => {
        // Validation
        if (!checkoutReason) {
            toast({
                title: "Missing Information",
                description: "Please select a reason for checkout",
                variant: "destructive"
            });
            return;
        }

        if (checkoutReason === "Other" && !customReason.trim()) {
            toast({
                title: "Missing Information",
                description: "Please specify the custom reason",
                variant: "destructive"
            });
            return;
        }

        if (hasDues && !duesCleared) {
            toast({
                title: "Cannot Checkout",
                description: "Please clear all dues before checkout or mark them as cleared",
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);

        try {
            const checkoutData = {
                studentId: student.id,
                checkoutDate: new Date().toISOString().split('T')[0],
                reason: checkoutReason === "Other" ? customReason : checkoutReason,
                notes: notes.trim(),
                duesCleared,
                hadOutstandingDues: hasDues,
                outstandingAmount: hasDues ? student.currentBalance : 0,
                processedBy: "Admin", // In real app, get from auth context
                hitLedger: duesCleared // Only hit ledger if dues are cleared
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            onCheckoutComplete(student.id, checkoutData);

            toast({
                title: "Checkout Successful",
                description: `${student.name} has been checked out successfully. Room ${student.roomNumber} is now available.`,
            });

            onClose();
        } catch (error) {
            toast({
                title: "Checkout Failed",
                description: "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBookPaymentLater = () => {
        toast({
            title: "Payment Booking",
            description: "Student can pay dues later. Checkout will be processed without hitting ledger.",
        });
        setDuesCleared(true);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Student Checkout
                        </span>
                        <Button variant="ghost" onClick={onClose}>✕</Button>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Student Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <p className="text-gray-600">Room: {student.roomNumber}</p>
                        <p className="text-gray-600">Phone: {student.phone}</p>
                        <p className="text-gray-600">ID: {student.id}</p>
                    </div>

                    {/* Dues Information */}
                    <Card className={hasDues ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign className={`h-5 w-5 ${hasDues ? "text-red-600" : "text-green-600"}`} />
                                    <span className="font-medium">Outstanding Dues</span>
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${hasDues ? "text-red-600" : "text-green-600"}`}>
                                        Rs {student.currentBalance.toLocaleString()}
                                    </div>
                                    <Badge variant={hasDues ? "destructive" : "default"}>
                                        {hasDues ? "Dues Pending" : "All Clear"}
                                    </Badge>
                                </div>
                            </div>

                            {hasDues && (
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span>Mark dues as cleared:</span>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={duesCleared}
                                                onCheckedChange={setDuesCleared}
                                            />
                                            {duesCleared ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                            )}
                                        </div>
                                    </div>

                                    {!duesCleared && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleBookPaymentLater}
                                            className="w-full"
                                        >
                                            📅 Book Payment for Later
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Checkout Reason */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Reason for Checkout *
                        </label>
                        <Select value={checkoutReason} onValueChange={setCheckoutReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select checkout reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {checkoutReasons.map((reason) => (
                                    <SelectItem key={reason} value={reason}>
                                        {reason}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {checkoutReason === "Other" && (
                            <Input
                                placeholder="Please specify the reason"
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                className="mt-2"
                            />
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Additional Notes</label>
                        <Textarea
                            placeholder="Any additional notes about the checkout (optional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Checkout Status */}
                    <div className={`p-4 rounded-lg border-2 ${canCheckout ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                        <div className="flex items-center gap-2">
                            {canCheckout ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className="font-medium">
                                {canCheckout ? "Ready for Checkout" : "Cannot Checkout"}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            {canCheckout
                                ? `${duesCleared ? "Will hit ledger" : "Will NOT hit ledger"} • Room ${student.roomNumber} will be marked as empty`
                                : "Please clear dues or mark them as cleared to proceed"
                            }
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCheckout}
                            disabled={!canCheckout || isProcessing}
                            className="flex-1"
                        >
                            {isProcessing ? "Processing..." : "Complete Checkout"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};