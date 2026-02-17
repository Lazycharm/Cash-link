import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Loader2, 
  Heart, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  Target,
  Users,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Donation } from '@/entities/Donation';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDonationsManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showContributions, setShowContributions] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected, active, completed

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      let data;
      if (filter === 'all') {
        data = await Donation.list();
      } else if (filter === 'pending' || filter === 'approved' || filter === 'rejected') {
        data = await Donation.filter({ admin_status: filter });
      } else {
        data = await Donation.filter({ status: filter });
      }
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContributions = async (campaignId) => {
    try {
      const data = await Donation.getContributions(campaignId);
      setContributions(data);
    } catch (error) {
      console.error('Error fetching contributions:', error);
    }
  };

  const handleApproval = async (campaign, newStatus) => {
    setUpdating(prev => ({ ...prev, [campaign.id]: true }));
    try {
      await Donation.update(campaign.id, { admin_status: newStatus });
      await fetchCampaigns();
    } catch (error) {
      console.error(`Failed to ${newStatus} campaign:`, error);
      alert(`Failed to update campaign. Error: ${error.message}`);
    } finally {
      setUpdating(prev => ({ ...prev, [campaign.id]: false }));
    }
  };

  const handleStatusChange = async (campaign, newStatus) => {
    setUpdating(prev => ({ ...prev, [campaign.id]: true }));
    try {
      await Donation.update(campaign.id, { status: newStatus });
      await fetchCampaigns();
    } catch (error) {
      console.error(`Failed to change status:`, error);
      alert(`Failed to update campaign. Error: ${error.message}`);
    } finally {
      setUpdating(prev => ({ ...prev, [campaign.id]: false }));
    }
  };

  const viewContributions = async (campaign) => {
    setSelectedCampaign(campaign);
    await fetchContributions(campaign.id);
    setShowContributions(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("AdminDashboard")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Donations Management</h1>
            <p className="text-gray-600 mt-1">Manage donation campaigns and contributions</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'approved', 'rejected', 'active', 'completed'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold">{campaigns.length}</p>
                </div>
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold">
                    {campaigns.filter(c => c.admin_status === 'pending').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold">
                    {campaigns.filter(c => c.status === 'active' && c.admin_status === 'approved').length}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Raised</p>
                  <p className="text-2xl font-bold">
                    AED {campaigns.reduce((sum, c) => sum + (parseFloat(c.raised_amount) || 0), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Donation Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No campaigns found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Goal</TableHead>
                      <TableHead>Raised</TableHead>
                      <TableHead>Admin Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map(campaign => {
                      const progress = campaign.goal_amount 
                        ? Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)
                        : 0;
                      
                      return (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {campaign.title}
                          </TableCell>
                          <TableCell>
                            {campaign.organizer_id ? 'User' : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {campaign.goal_amount 
                              ? `${campaign.currency || 'AED'} ${campaign.goal_amount.toLocaleString()}`
                              : 'Open-ended'
                            }
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {campaign.currency || 'AED'} {campaign.raised_amount?.toLocaleString() || '0'}
                              </div>
                              {campaign.goal_amount && (
                                <div className="text-xs text-gray-500">{progress.toFixed(1)}%</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(campaign.admin_status || 'pending')}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(campaign.status || 'active')}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDistanceToNow(new Date(campaign.created_date), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {campaign.admin_status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApproval(campaign, 'approved')}
                                    disabled={updating[campaign.id]}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApproval(campaign, 'rejected')}
                                    disabled={updating[campaign.id]}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewContributions(campaign)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {campaign.status === 'active' && campaign.admin_status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(campaign, 'completed')}
                                  disabled={updating[campaign.id]}
                                  className="text-purple-600"
                                >
                                  Complete
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contributions Dialog */}
        <Dialog open={showContributions} onOpenChange={setShowContributions}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contributions - {selectedCampaign?.title}</DialogTitle>
              <DialogDescription>
                View all donations made to this campaign
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {contributions.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No contributions yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map(contribution => (
                      <TableRow key={contribution.id}>
                        <TableCell>
                          {contribution.is_anonymous 
                            ? 'Anonymous'
                            : contribution.donor_name || contribution.profiles?.full_name || 'Unknown'
                          }
                        </TableCell>
                        <TableCell className="font-medium">
                          {contribution.currency || 'AED'} {contribution.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {contribution.message || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(contribution.created_date), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowContributions(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
