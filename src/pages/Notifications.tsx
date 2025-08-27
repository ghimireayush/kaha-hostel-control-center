import { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/contexts/AppContext';
import {
    Bell,
    Send,
    MessageSquare,
    Users,
    CheckCircle,
    AlertTriangle,
    UserX,
    DollarSign,
    Calendar,
    Search,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';

const Notifications = () => {
    const { state } = useAppContext();
    const [newMessage, setNewMessage] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Mock notification data
    const [notifications] = useState([
        {
            id: 1,
            type: 'payment_reminder',
            title: 'Payment Reminder',
            message: 'Your monthly payment is due tomorrow. Please make payment to avoid late fees.',
            recipients: ['Ram Sharma', 'Hari Thapa'],
            sentAt: '2024-01-15T10:30:00Z',
            status: 'sent',
            deliveryRate: 100
        },
        {
            id: 2,
            type: 'welcome',
            title: 'Welcome to Kaha Hostel',
            message: 'Welcome to Kaha Hostel! We hope you have a comfortable stay with us.',
            recipients: ['Sita Poudel'],
            sentAt: '2024-01-15T09:15:00Z',
            status: 'sent',
            deliveryRate: 100
        },
        {
            id: 3,
            type: 'maintenance',
            title: 'Maintenance Notice',
            message: 'Water supply will be interrupted tomorrow from 10 AM to 2 PM for maintenance.',
            recipients: ['All Students'],
            sentAt: '2024-01-14T16:45:00Z',
            status: 'sent',
            deliveryRate: 95
        }
    ]);

    // Calculate today's stats
    const today = new Date().toDateString();
    const todayNotifications = notifications.filter(n =>
        new Date(n.sentAt).toDateString() === today
    );
    const totalSentToday = todayNotifications.reduce((sum, n) =>
        sum + (n.recipients.includes('All Students') ? state.students?.length || 0 : n.recipients.length), 0
    );

    // Pass out students (checked out students)
    const passOutStudents = state.students?.filter(s => s.isCheckedOut) || [];

    // Students who left without payment
    const studentsWithoutPayment = passOutStudents.filter(s =>
        s.currentBalance && s.currentBalance > 0
    );

    const handleSendNotification = () => {
        if (!newMessage.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (selectedRecipients.length === 0) {
            toast.error('Please select recipients');
            return;
        }

        // Mock sending notification
        toast.success(`Notification sent to ${selectedRecipients.length} recipients`);
        setNewMessage('');
        setSelectedRecipients([]);
    };

    const activeStudents = state.students?.filter(s => !s.isCheckedOut) || [];

    return (
        <MainLayout activeTab="notifications">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-[#231F20]">🔔 Notification Center</h1>
                        <p className="text-gray-600 mt-1">Manage and send notifications to students</p>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Notifications Sent Today</p>
                                    <p className="text-3xl font-bold text-blue-600">{totalSentToday}</p>
                                    <p className="text-xs text-blue-600 mt-1">Total composed and sent</p>
                                </div>
                                <Send className="h-12 w-12 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Active Students</p>
                                    <p className="text-3xl font-bold text-green-600">{activeStudents.length}</p>
                                    <p className="text-xs text-green-600 mt-1">Currently in hostel</p>
                                </div>
                                <Users className="h-12 w-12 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">Pass Out Students</p>
                                    <p className="text-3xl font-bold text-orange-600">{passOutStudents.length}</p>
                                    <p className="text-xs text-orange-600 mt-1">Students who left</p>
                                </div>
                                <UserX className="h-12 w-12 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-600 font-medium">Left Without Payment</p>
                                    <p className="text-3xl font-bold text-red-600">{studentsWithoutPayment.length}</p>
                                    <p className="text-xs text-red-600 mt-1">Outstanding dues</p>
                                </div>
                                <AlertTriangle className="h-12 w-12 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Send New Notification */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Send New Notification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Select Recipients
                            </label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Button
                                    size="sm"
                                    variant={selectedRecipients.includes('all') ? 'default' : 'outline'}
                                    onClick={() => {
                                        if (selectedRecipients.includes('all')) {
                                            setSelectedRecipients([]);
                                        } else {
                                            setSelectedRecipients(['all']);
                                        }
                                    }}
                                >
                                    All Students ({activeStudents.length})
                                </Button>
                                {activeStudents.slice(0, 5).map(student => (
                                    <Button
                                        key={student.id}
                                        size="sm"
                                        variant={selectedRecipients.includes(student.id) ? 'default' : 'outline'}
                                        onClick={() => {
                                            if (selectedRecipients.includes(student.id)) {
                                                setSelectedRecipients(prev => prev.filter(id => id !== student.id));
                                            } else {
                                                setSelectedRecipients(prev => [...prev.filter(id => id !== 'all'), student.id]);
                                            }
                                        }}
                                    >
                                        {student.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Message
                            </label>
                            <Textarea
                                placeholder="Type your notification message here..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>

                        <Button
                            onClick={handleSendNotification}
                            className="bg-gradient-to-r from-[#07A64F] to-[#1295D0] hover:from-[#06954A] hover:to-[#1185C0]"
                            disabled={!newMessage.trim() || selectedRecipients.length === 0}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Send Notification
                        </Button>
                    </CardContent>
                </Card>

                {/* Pass Out Students Listing */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserX className="h-5 w-5" />
                            Pass Out Students ({passOutStudents.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {passOutStudents.map(student => (
                                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-orange-100 rounded-full">
                                            <UserX className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{student.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                Room: {student.roomNumber} • Left: {student.checkoutDate ? new Date(student.checkoutDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                            {student.checkoutReason && (
                                                <p className="text-xs text-gray-400">Reason: {student.checkoutReason}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {student.currentBalance && student.currentBalance > 0 ? (
                                            <Badge variant="destructive" className="bg-red-100 text-red-700">
                                                Outstanding: NPR {student.currentBalance.toLocaleString()}
                                            </Badge>
                                        ) : (
                                            <Badge variant="default" className="bg-green-100 text-green-700">
                                                Cleared
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {passOutStudents.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <UserX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No pass out students found</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Collateral Information */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                            <AlertTriangle className="h-5 w-5" />
                            What is "Collateral"?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-blue-700 space-y-2">
                            <p className="font-medium">Collateral refers to:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Security deposits held for room damages or unpaid dues</li>
                                <li>Personal items left behind by students who checked out</li>
                                <li>Documents or valuables kept as guarantee for payments</li>
                                <li>Any physical or financial security against potential losses</li>
                            </ul>
                            <p className="text-xs mt-3 italic">
                                Note: Always maintain proper documentation and follow legal procedures when handling collateral.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Recent Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {notifications.map(notification => (
                                <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-100 rounded-full">
                                            <Bell className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{notification.title}</h3>
                                            <p className="text-sm text-gray-600">{notification.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Sent: {new Date(notification.sentAt).toLocaleString()} •
                                                Recipients: {notification.recipients.join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="default" className="bg-green-100 text-green-700">
                                            {notification.deliveryRate}% Delivered
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};

export default Notifications;