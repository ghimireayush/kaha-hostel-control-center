import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, FileText, TrendingUp, Calendar, Search, Loader2, RefreshCw } from "lucide-react";
import { ledgerService } from "@/services/ledgerService.js";

interface LedgerEntry {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  roomNumber: string;
  date: string;
  type: string;
  description: string;
  referenceId: string;
  debit: number;
  credit: number;
  balance: number;
  balanceType: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface LedgerStats {
  totalEntries: number;
  totalDebits: number;
  totalCredits: number;
  studentsWithBalance: number;
  studentsWithCredit: number;
  studentsWithDebit: number;
  outstandingAmount: number;
  advanceAmount: number;
  entryTypes: Record<string, number>;
  monthlyTrends: Record<string, any>;
  recentEntries: LedgerEntry[];
}

export const LedgerManagement = () => {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [stats, setStats] = useState<LedgerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    studentId: '',
    type: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    debit: '',
    credit: '',
    referenceId: ''
  });
  const [editFormData, setEditFormData] = useState<{
    description: string;
    date: string;
    debit: number;
    credit: number;
    referenceId: string;
  } | null>(null);
  const { toast } = useToast();

  // Fetch ledger entries and stats
  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined
      };
      
      const [entriesData, statsData] = await Promise.all([
        ledgerService.getLedgerEntries(filters),
        ledgerService.getLedgerStats()
      ]);
      
      setLedgerEntries(entriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ledger data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [searchTerm, typeFilter, dateFromFilter, dateToFilter]);

  // Entry type badge
  const getEntryTypeBadge = (type: string) => {
    const colors = {
      'Invoice': 'bg-red-100 text-red-800',
      'Payment': 'bg-green-100 text-green-800',
      'Discount': 'bg-blue-100 text-blue-800',
      'Adjustment': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  // Balance type indicator
  const getBalanceIndicator = (balance: number, balanceType: string) => {
    if (balanceType === 'Nil') {
      return <span className="text-gray-600">₨0</span>;
    }
    
    const color = balanceType === 'Dr' ? 'text-red-600' : 'text-green-600';
    return (
      <span className={`font-medium ${color}`}>
        ₨{Math.abs(balance).toLocaleString()} {balanceType}
      </span>
    );
  };

  // Handle ledger operations
  const handleCreateEntry = async () => {
    try {
      if (!createFormData.studentId || !createFormData.type || !createFormData.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      if (!createFormData.debit && !createFormData.credit) {
        toast({
          title: "Validation Error",
          description: "Please enter either debit or credit amount.",
          variant: "destructive"
        });
        return;
      }

      await ledgerService.addLedgerEntry({
        ...createFormData,
        debit: parseFloat(createFormData.debit) || 0,
        credit: parseFloat(createFormData.credit) || 0
      });
      
      toast({
        title: "Success",
        description: "Ledger entry created successfully!",
      });
      
      setShowCreateDialog(false);
      setCreateFormData({
        studentId: '',
        type: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        debit: '',
        credit: '',
        referenceId: ''
      });
      fetchLedgerData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create ledger entry.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateEntry = async () => {
    try {
      if (!selectedEntry || !editFormData) return;

      await ledgerService.updateLedgerEntry(selectedEntry.id, editFormData);
      toast({
        title: "Success",
        description: "Ledger entry updated successfully!",
      });
      
      setShowEditDialog(false);
      fetchLedgerData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update ledger entry.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateEntries = async () => {
    try {
      const result = await ledgerService.generateLedgerEntries();
      
      toast({
        title: "Success",
        description: `Generated ${result.totalGenerated} entries! ${result.totalSkipped} skipped, ${result.totalErrors} errors.`,
      });
      
      setShowGenerateDialog(false);
      fetchLedgerData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate ledger entries.",
        variant: "destructive"
      });
    }
  };

  const handleViewEntry = (entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setShowViewDialog(true);
  };

  const handleEditEntry = (entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setEditFormData({
      description: entry.description,
      date: entry.date,
      debit: entry.debit,
      credit: entry.credit,
      referenceId: entry.referenceId
    });
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">📊 Ledger Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Create Entry
          </Button>
          <Button onClick={() => setShowGenerateDialog(true)} variant="outline" className="flex items-center gap-2">
            <RefreshCw size={16} />
            Generate Entries
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalEntries}
              </div>
              <div className="text-sm text-gray-500">Total Entries</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                ₨{stats.outstandingAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Outstanding Amount ({stats.studentsWithDebit} students)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                ₨{stats.advanceAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Advance Amount ({stats.studentsWithCredit} students)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                ₨{(stats.totalDebits - stats.totalCredits).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Net Balance</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Search & Filter Ledger Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search size={16} />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Invoice">🧾 Invoice</SelectItem>
                  <SelectItem value="Payment">💰 Payment</SelectItem>
                  <SelectItem value="Discount">🏷️ Discount</SelectItem>
                  <SelectItem value="Adjustment">⚖️ Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <Input
                type="date"
                placeholder="From date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="w-40"
              />
              <span>to</span>
              <Input
                type="date"
                placeholder="To date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ledger Entries ({ledgerEntries.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading ledger entries...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.studentName}</div>
                        <div className="text-sm text-gray-500">
                          Room: {entry.roomNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getEntryTypeBadge(entry.type)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {entry.description}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entry.referenceId || '-'}
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
                    <TableCell className="text-right">
                      {getBalanceIndicator(entry.balance, entry.balanceType)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewEntry(entry)}
                          title="View Entry"
                        >
                          👁️
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditEntry(entry)}
                          title="Edit Entry"
                        >
                          <Edit size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card> 
     {/* Create Entry Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Ledger Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                placeholder="Enter student ID (e.g., S001)"
                value={createFormData.studentId}
                onChange={(e) => setCreateFormData({...createFormData, studentId: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="type">Entry Type *</Label>
              <Select value={createFormData.type} onValueChange={(value) => setCreateFormData({...createFormData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entry type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Invoice">🧾 Invoice</SelectItem>
                  <SelectItem value="Payment">💰 Payment</SelectItem>
                  <SelectItem value="Discount">🏷️ Discount</SelectItem>
                  <SelectItem value="Adjustment">⚖️ Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Enter description"
                value={createFormData.description}
                onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={createFormData.date}
                onChange={(e) => setCreateFormData({...createFormData, date: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="debit">Debit Amount</Label>
                <Input
                  id="debit"
                  type="number"
                  placeholder="0.00"
                  value={createFormData.debit}
                  onChange={(e) => setCreateFormData({...createFormData, debit: e.target.value, credit: ''})}
                />
              </div>
              <div>
                <Label htmlFor="credit">Credit Amount</Label>
                <Input
                  id="credit"
                  type="number"
                  placeholder="0.00"
                  value={createFormData.credit}
                  onChange={(e) => setCreateFormData({...createFormData, credit: e.target.value, debit: ''})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="referenceId">Reference ID</Label>
              <Input
                id="referenceId"
                placeholder="Invoice/Payment ID (optional)"
                value={createFormData.referenceId}
                onChange={(e) => setCreateFormData({...createFormData, referenceId: e.target.value})}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateEntry} className="flex-1">
                Create Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Entry Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ledger Entry Details - {selectedEntry?.id}</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Student Information</h4>
                  <p>Name: {selectedEntry.studentName}</p>
                  <p>Room: {selectedEntry.roomNumber}</p>
                  <p>Phone: {selectedEntry.studentPhone}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Entry Information</h4>
                  <p>Type: {selectedEntry.type}</p>
                  <p>Date: {new Date(selectedEntry.date).toLocaleDateString()}</p>
                  <p>Reference: {selectedEntry.referenceId || 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-600">{selectedEntry.description}</p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Amount Details</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Debit</p>
                    <p className="text-lg font-medium text-red-600">
                      ₨{selectedEntry.debit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Credit</p>
                    <p className="text-lg font-medium text-green-600">
                      ₨{selectedEntry.credit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className="text-lg font-medium">
                      {getBalanceIndicator(selectedEntry.balance, selectedEntry.balanceType)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Audit Information</h4>
                <p className="text-sm text-gray-600">Created by: {selectedEntry.createdBy}</p>
                <p className="text-sm text-gray-600">Created: {new Date(selectedEntry.createdAt).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Updated: {new Date(selectedEntry.updatedAt).toLocaleString()}</p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowViewDialog(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Ledger Entry - {selectedEntry?.id}</DialogTitle>
          </DialogHeader>
          {selectedEntry && editFormData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Input
                  id="editDescription"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editDate">Date</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDebit">Debit Amount</Label>
                  <Input
                    id="editDebit"
                    type="number"
                    value={editFormData.debit}
                    onChange={(e) => setEditFormData({...editFormData, debit: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="editCredit">Credit Amount</Label>
                  <Input
                    id="editCredit"
                    type="number"
                    value={editFormData.credit}
                    onChange={(e) => setEditFormData({...editFormData, credit: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editReferenceId">Reference ID</Label>
                <Input
                  id="editReferenceId"
                  value={editFormData.referenceId}
                  onChange={(e) => setEditFormData({...editFormData, referenceId: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUpdateEntry} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Entries Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Ledger Entries</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              This will automatically generate ledger entries from existing invoices and payments.
              Existing entries will be skipped to avoid duplicates.
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">What will be generated:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Debit entries for all invoices</li>
                <li>• Credit entries for all payments</li>
                <li>• Updated student balances</li>
                <li>• Proper chronological ordering</li>
              </ul>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowGenerateDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleGenerateEntries} className="flex-1">
                Generate Entries
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};