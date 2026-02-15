import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Camera, 
  FileText, 
  Bell, 
  Clock, 
  FileCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { VisaReminder, BillReminder } from "@/entities/Reminder";
import { Notification } from "@/entities/Notification";
import { format, differenceInDays, isPast, isToday } from "date-fns";

const ToolCard = ({ icon: Icon, title, description, comingSoon = false, onClick }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer ${comingSoon ? 'opacity-70 grayscale' : ''}`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${comingSoon ? 'bg-gray-100' : 'bg-indigo-50'}`}>
      <Icon className={`w-6 h-6 ${comingSoon ? 'text-gray-400' : 'text-indigo-600'}`} />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {comingSoon && <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">SOON</span>}
      </div>
      <p className="text-xs text-gray-500 leading-snug">{description}</p>
    </div>
  </motion.div>
);

// Visa Reminder Component
const VisaReminderSection = ({ userId }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    document_type: 'visa',
    document_number: '',
    expiry_date: '',
    reminder_days_before: [30, 14, 7, 1],
    notes: '',
    is_active: true
  });

  useEffect(() => {
    loadReminders();
  }, [userId]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await VisaReminder.list(userId);
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading visa reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (reminder = null) => {
    if (reminder) {
      setEditingReminder(reminder);
      setFormData({
        document_type: reminder.document_type,
        document_number: reminder.document_number || '',
        expiry_date: reminder.expiry_date,
        reminder_days_before: reminder.reminder_days_before || [30, 14, 7, 1],
        notes: reminder.notes || '',
        is_active: reminder.is_active
      });
    } else {
      setEditingReminder(null);
      setFormData({
        document_type: 'visa',
        document_number: '',
        expiry_date: '',
        reminder_days_before: [30, 14, 7, 1],
        notes: '',
        is_active: true
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.expiry_date) {
        alert('Please select an expiry date');
        return;
      }

      const reminderData = {
        user_id: userId,
        ...formData
      };

      if (editingReminder) {
        await VisaReminder.update(editingReminder.id, reminderData);
      } else {
        await VisaReminder.create(reminderData);
      }

      setShowDialog(false);
      loadReminders();
    } catch (error) {
      console.error('Error saving reminder:', error);
      alert('Failed to save reminder. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      try {
        await VisaReminder.delete(id);
        loadReminders();
      } catch (error) {
        console.error('Error deleting reminder:', error);
        alert('Failed to delete reminder.');
      }
    }
  };

  const toggleActive = async (reminder) => {
    try {
      await VisaReminder.toggleActive(reminder.id, !reminder.is_active);
      loadReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    return days;
  };

  const getStatusBadge = (reminder) => {
    const days = getDaysUntilExpiry(reminder.expiry_date);
    if (isPast(new Date(reminder.expiry_date))) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (days <= 7) {
      return <Badge className="bg-red-500">Urgent</Badge>;
    } else if (days <= 30) {
      return <Badge className="bg-amber-500">Soon</Badge>;
    } else {
      return <Badge className="bg-green-500">Active</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Visa Expiry Reminders</h2>
        <Button onClick={() => handleOpenDialog()} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : reminders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No reminders set yet</p>
            <Button onClick={() => handleOpenDialog()} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className={`border-0 shadow-sm ${!reminder.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 capitalize">{reminder.document_type}</h3>
                      {getStatusBadge(reminder)}
                      {!reminder.is_active && <Badge variant="outline">Inactive</Badge>}
                    </div>
                    {reminder.document_number && (
                      <p className="text-sm text-gray-500 mb-1">Number: {reminder.document_number}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expires: {format(new Date(reminder.expiry_date), 'MMM d, yyyy')}
                      </span>
                      <span className={getDaysUntilExpiry(reminder.expiry_date) <= 30 ? 'text-red-600 font-semibold' : ''}>
                        {getDaysUntilExpiry(reminder.expiry_date)} days left
                      </span>
                    </div>
                    {reminder.notes && (
                      <p className="text-sm text-gray-500 mt-2">{reminder.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reminder.is_active}
                      onCheckedChange={() => toggleActive(reminder)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(reminder)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(reminder.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Add Visa Expiry Reminder'}</DialogTitle>
            <DialogDescription>
              Set reminders for your visa, passport, or Emirates ID expiration dates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Document Type</Label>
              <Select
                value={formData.document_type}
                onValueChange={(value) => setFormData({ ...formData, document_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="emirates_id">Emirates ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Document Number (Optional)</Label>
              <Input
                value={formData.document_number}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                placeholder="Enter document number"
              />
            </div>
            <div>
              <Label>Expiry Date *</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Bill Reminder Component
const BillReminderSection = ({ userId }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    bill_type: 'dewa',
    bill_name: '',
    account_number: '',
    due_date: '',
    amount: '',
    currency: 'AED',
    reminder_days_before: [7, 3, 1],
    notes: '',
    is_active: true
  });

  useEffect(() => {
    loadReminders();
  }, [userId]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await BillReminder.list(userId);
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading bill reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (reminder = null) => {
    if (reminder) {
      setEditingReminder(reminder);
      setFormData({
        bill_type: reminder.bill_type,
        bill_name: reminder.bill_name,
        account_number: reminder.account_number || '',
        due_date: reminder.due_date,
        amount: reminder.amount?.toString() || '',
        currency: reminder.currency || 'AED',
        reminder_days_before: reminder.reminder_days_before || [7, 3, 1],
        notes: reminder.notes || '',
        is_active: reminder.is_active
      });
    } else {
      setEditingReminder(null);
      setFormData({
        bill_type: 'dewa',
        bill_name: '',
        account_number: '',
        due_date: '',
        amount: '',
        currency: 'AED',
        reminder_days_before: [7, 3, 1],
        notes: '',
        is_active: true
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.bill_name || !formData.due_date) {
        alert('Please fill in bill name and due date');
        return;
      }

      const reminderData = {
        user_id: userId,
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : null
      };

      if (editingReminder) {
        await BillReminder.update(editingReminder.id, reminderData);
      } else {
        await BillReminder.create(reminderData);
      }

      setShowDialog(false);
      loadReminders();
    } catch (error) {
      console.error('Error saving reminder:', error);
      alert('Failed to save reminder. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      try {
        await BillReminder.delete(id);
        loadReminders();
      } catch (error) {
        console.error('Error deleting reminder:', error);
        alert('Failed to delete reminder.');
      }
    }
  };

  const handleMarkAsPaid = async (reminder) => {
    try {
      await BillReminder.markAsPaid(reminder.id);
      loadReminders();
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const toggleActive = async (reminder) => {
    try {
      await BillReminder.toggleActive(reminder.id, !reminder.is_active);
      loadReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const days = differenceInDays(new Date(dueDate), new Date());
    return days;
  };

  const getStatusBadge = (reminder) => {
    if (reminder.is_paid) {
      return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</Badge>;
    }
    const days = getDaysUntilDue(reminder.due_date);
    if (isPast(new Date(reminder.due_date))) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (days <= 3) {
      return <Badge className="bg-red-500">Urgent</Badge>;
    } else if (days <= 7) {
      return <Badge className="bg-amber-500">Due Soon</Badge>;
    } else {
      return <Badge className="bg-blue-500">Upcoming</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Bill Reminders</h2>
        <Button onClick={() => handleOpenDialog()} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : reminders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No bill reminders set yet</p>
            <Button onClick={() => handleOpenDialog()} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className={`border-0 shadow-sm ${!reminder.is_active || reminder.is_paid ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{reminder.bill_name}</h3>
                      {getStatusBadge(reminder)}
                      {!reminder.is_active && <Badge variant="outline">Inactive</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="capitalize">{reminder.bill_type}</span>
                      {reminder.account_number && (
                        <span>Account: {reminder.account_number}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Due: {format(new Date(reminder.due_date), 'MMM d, yyyy')}
                      </span>
                      {reminder.amount && (
                        <span className="font-semibold text-gray-900">
                          {reminder.currency} {reminder.amount.toFixed(2)}
                        </span>
                      )}
                      {!reminder.is_paid && (
                        <span className={getDaysUntilDue(reminder.due_date) <= 7 ? 'text-red-600 font-semibold' : ''}>
                          {getDaysUntilDue(reminder.due_date)} days left
                        </span>
                      )}
                    </div>
                    {reminder.notes && (
                      <p className="text-sm text-gray-500 mt-2">{reminder.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!reminder.is_paid && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsPaid(reminder)}
                        className="text-green-600 border-green-600"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Mark Paid
                      </Button>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={reminder.is_active}
                        onCheckedChange={() => toggleActive(reminder)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(reminder)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingReminder ? 'Edit Bill Reminder' : 'Add Bill Reminder'}</DialogTitle>
            <DialogDescription>
              Track your utility bills and payment due dates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Bill Type *</Label>
              <Select
                value={formData.bill_type}
                onValueChange={(value) => setFormData({ ...formData, bill_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dewa">DEWA</SelectItem>
                  <SelectItem value="etisalat">Etisalat</SelectItem>
                  <SelectItem value="du">Du</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bill Name *</Label>
              <Input
                value={formData.bill_name}
                onChange={(e) => setFormData({ ...formData, bill_name: e.target.value })}
                placeholder="e.g., Home DEWA Bill"
                required
              />
            </div>
            <div>
              <Label>Account Number (Optional)</Label>
              <Input
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="Enter account number"
              />
            </div>
            <div>
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Amount (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function UtilityTools() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tools');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-xl mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Utility Tools</h1>
        </div>
        <p className="text-white/90 max-w-sm">
          Daily tools to organize your documents and stay on top of deadlines.
        </p>
      </div>

      <div className="px-6 max-w-4xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'tools'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Tools
          </button>
          <button
            onClick={() => setActiveTab('visa')}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'visa'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Visa Reminders
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'bills'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Bill Reminders
          </button>
        </div>

        {/* Content */}
        {activeTab === 'tools' && (
          <div className="grid grid-cols-1 gap-4">
            <ToolCard 
              icon={Clock} 
              title="Visa Expiry Reminder" 
              description="Set alerts for your visa and passport expiration dates." 
              onClick={() => setActiveTab('visa')}
            />
            <ToolCard 
              icon={Bell} 
              title="Bill Reminders" 
              description="Track DEWA, Etisalat, and Du payment dates." 
              onClick={() => setActiveTab('bills')}
            />
            <ToolCard 
              icon={Camera} 
              title="Passport Photo Gen" 
              description="Create compliant passport photos from selfies." 
              comingSoon 
            />
            <ToolCard 
              icon={FileText} 
              title="Document Organizer" 
              description="Securely store copies of your Emirates ID, Visa, and Passport." 
              comingSoon 
            />
            <ToolCard 
              icon={FileCheck} 
              title="PDF Merge Tool" 
              description="Combine multiple PDF documents into one file." 
              comingSoon 
            />
          </div>
        )}

        {activeTab === 'visa' && user && (
          <VisaReminderSection userId={user.id} />
        )}

        {activeTab === 'bills' && user && (
          <BillReminderSection userId={user.id} />
        )}
      </div>
    </div>
  );
}
