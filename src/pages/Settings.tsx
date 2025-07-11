
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Database, Bell, CreditCard, Users, Download, Shield, Globe } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [settings, setSettings] = useState({
    // System Settings
    currency: "NPR",
    language: "English",
    timezone: "Asia/Kathmandu",
    dateFormat: "DD/MM/YYYY",
    
    // Billing Settings
    invoiceDueDate: 5, // Days from month start
    latePaymentFee: 500,
    autoGenerateInvoices: true,
    sendReminderEmails: true,
    
    // Payment Settings
    acceptCash: true,
    acceptBank: true,
    acceptESewa: true,
    acceptKhalti: true,
    acceptPayPal: false,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security Settings
    requireTwoFactor: false,
    sessionTimeout: 30, // minutes
    enableAuditLog: true,
    
    // Booking Settings
    allowOnlineBooking: true,
    requireApproval: true,
    maxAdvanceBooking: 30, // days
  });

  const handleSave = () => {
    toast.success("Settings saved successfully!");
    console.log("Saving settings:", settings);
  };

  const handleExportData = () => {
    toast.success("Data export started. You'll receive an email when ready.");
  };

  const handleBackupData = () => {
    toast.success("Backup created successfully!");
  };

  return (
    <MainLayout activeTab="settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">⚙️ System Settings</h2>
            <p className="text-gray-600 mt-1">Configure system behavior and preferences</p>
          </div>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            💾 Save All Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={settings.currency} onValueChange={(value) => setSettings({...settings, currency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NPR">Nepalese Rupee (NPR)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Nepali">नेपाली</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kathmandu">Asia/Kathmandu (NPT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={settings.dateFormat} onValueChange={(value) => setSettings({...settings, dateFormat: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Billing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="invoiceDue">Invoice Due Date (Days from month start)</Label>
                <Input
                  id="invoiceDue"
                  type="number"
                  value={settings.invoiceDueDate}
                  onChange={(e) => setSettings({...settings, invoiceDueDate: parseInt(e.target.value)})}
                  min="1"
                  max="31"
                />
              </div>

              <div>
                <Label htmlFor="lateFee">Late Payment Fee (₨)</Label>
                <Input
                  id="lateFee"
                  type="number"
                  value={settings.latePaymentFee}
                  onChange={(e) => setSettings({...settings, latePaymentFee: parseInt(e.target.value)})}
                  min="0"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoInvoice">Auto-generate Monthly Invoices</Label>
                <Switch
                  id="autoInvoice"
                  checked={settings.autoGenerateInvoices}
                  onCheckedChange={(checked) => setSettings({...settings, autoGenerateInvoices: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reminderEmails">Send Payment Reminder Emails</Label>
                <Switch
                  id="reminderEmails"
                  checked={settings.sendReminderEmails}
                  onCheckedChange={(checked) => setSettings({...settings, sendReminderEmails: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>💵</span>
                    <Label>Cash Payments</Label>
                  </div>
                  <Switch
                    checked={settings.acceptCash}
                    onCheckedChange={(checked) => setSettings({...settings, acceptCash: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>🏦</span>
                    <Label>Bank Transfer</Label>
                  </div>
                  <Switch
                    checked={settings.acceptBank}
                    onCheckedChange={(checked) => setSettings({...settings, acceptBank: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <Label>eSewa</Label>
                  </div>
                  <Switch
                    checked={settings.acceptESewa}
                    onCheckedChange={(checked) => setSettings({...settings, acceptESewa: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <Label>Khalti</Label>
                  </div>
                  <Switch
                    checked={settings.acceptKhalti}
                    onCheckedChange={(checked) => setSettings({...settings, acceptKhalti: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotif">Email Notifications</Label>
                <Switch
                  id="emailNotif"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="smsNotif">SMS Notifications</Label>
                <Switch
                  id="smsNotif"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotif">Push Notifications</Label>
                <Switch
                  id="pushNotif"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="twoFactor">Require Two-Factor Authentication</Label>
                <Switch
                  id="twoFactor"
                  checked={settings.requireTwoFactor}
                  onCheckedChange={(checked) => setSettings({...settings, requireTwoFactor: checked})}
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  min="5"
                  max="480"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auditLog">Enable Audit Logging</Label>
                <Switch
                  id="auditLog"
                  checked={settings.enableAuditLog}
                  onCheckedChange={(checked) => setSettings({...settings, enableAuditLog: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Booking Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="onlineBooking">Allow Online Booking</Label>
                <Switch
                  id="onlineBooking"
                  checked={settings.allowOnlineBooking}
                  onCheckedChange={(checked) => setSettings({...settings, allowOnlineBooking: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="requireApproval">Require Admin Approval</Label>
                <Switch
                  id="requireApproval"
                  checked={settings.requireApproval}
                  onCheckedChange={(checked) => setSettings({...settings, requireApproval: checked})}
                />
              </div>

              <div>
                <Label htmlFor="maxAdvance">Max Advance Booking (days)</Label>
                <Input
                  id="maxAdvance"
                  type="number"
                  value={settings.maxAdvanceBooking}
                  onChange={(e) => setSettings({...settings, maxAdvanceBooking: parseInt(e.target.value)})}
                  min="1"
                  max="365"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleExportData}
                variant="outline"
                className="h-20 flex-col space-y-2"
              >
                <Download className="h-6 w-6" />
                <span>Export All Data</span>
              </Button>
              
              <Button
                onClick={handleBackupData}
                variant="outline"
                className="h-20 flex-col space-y-2"
              >
                <Database className="h-6 w-6" />
                <span>Create Backup</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 text-red-600 hover:text-red-700"
              >
                <Shield className="h-6 w-6" />
                <span>System Reset</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>📊 System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Active</div>
                <div className="text-sm text-green-600">System Status</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-sm text-blue-600">Total Users</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">99.9%</div>
                <div className="text-sm text-purple-600">Uptime</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">15GB</div>
                <div className="text-sm text-orange-600">Data Storage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;
