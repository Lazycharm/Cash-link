import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, ArrowLeft, Plus, Loader2, CheckCircle2, Users, Calendar, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Donation } from '@/entities/Donation';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function DonationsPage() {
  const { user, profile } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDonateDialog, setShowDonateDialog] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      // Only show approved and active campaigns
      const data = await Donation.filter({ admin_status: 'approved', status: 'active' });
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load donation campaigns. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!selectedCampaign) return;
    
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }

    if (!isAnonymous && !donorName.trim()) {
      setError('Please enter your name or check anonymous donation');
      return;
    }

    setIsDonating(true);
    setError(null);
    setSuccess(null);

    try {
      await Donation.createContribution({
        donation_id: selectedCampaign.id,
        donor_id: user?.id || null,
        amount: parseFloat(donationAmount),
        currency: selectedCampaign.currency || 'AED',
        donor_name: isAnonymous ? 'Anonymous' : donorName,
        donor_email: profile?.email || null,
        donor_phone: profile?.phone || null,
        message: donorMessage || null,
        is_anonymous: isAnonymous,
        status: 'completed', // In production, this would be 'pending' until payment is confirmed
        payment_method: 'other'
      });

      setSuccess('Thank you for your donation!');
      setDonationAmount('');
      setDonorName('');
      setDonorMessage('');
      setIsAnonymous(false);
      
      // Refresh campaigns to update raised amounts
      await fetchCampaigns();
      
      setTimeout(() => {
        setShowDonateDialog(false);
        setSelectedCampaign(null);
        setSuccess(null);
      }, 2000);
    } catch (error) {
      console.error('Error creating donation:', error);
      setError(error.message || 'Failed to process donation. Please try again.');
    } finally {
      setIsDonating(false);
    }
  };

  const openDonateDialog = (campaign) => {
    setSelectedCampaign(campaign);
    setDonorName(profile?.full_name || '');
    setError(null);
    setSuccess(null);
    setShowDonateDialog(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to={createPageUrl("Community")}>
              <Button variant="outline" size="icon" className="rounded-xl flex-shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Donations</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Support community members in need</p>
            </div>
          </div>
          {user && (
            <Link to={createPageUrl("CreateDonation")} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-sm sm:text-base px-4 sm:px-6">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Create Campaign</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </Link>
          )}
        </div>

        {campaigns.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Active Campaigns</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">There are currently no active donation campaigns.</p>
              {user && (
                <Link to={createPageUrl("CreateDonation")} className="inline-block w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Campaign
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {campaigns.map(campaign => {
              const progress = campaign.goal_amount 
                ? Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)
                : 0;
              const isCompleted = campaign.goal_amount && campaign.raised_amount >= campaign.goal_amount;

              return (
                <Card key={campaign.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
                  {campaign.images && campaign.images.length > 0 && (
                    <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-pink-400 to-rose-500 relative overflow-hidden">
                      <img 
                        src={campaign.images[0]} 
                        alt={campaign.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {(!campaign.images || campaign.images.length === 0) && (
                    <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                      <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-50" />
                    </div>
                  )}
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg font-bold line-clamp-2 flex-1 min-w-0">{campaign.title}</CardTitle>
                      {campaign.is_featured && (
                        <Badge className="bg-pink-600 text-white text-[10px] sm:text-xs flex-shrink-0">Featured</Badge>
                      )}
                    </div>
                    {campaign.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">{campaign.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="space-y-3">
                      {campaign.goal_amount && (
                        <>
                          <Progress value={progress} className="h-2" />
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
                            <span className="font-bold text-gray-800">
                              {campaign.currency || 'AED'} {campaign.raised_amount?.toLocaleString() || '0'}
                            </span>
                            <span className="text-gray-600">
                              of {campaign.currency || 'AED'} {campaign.goal_amount.toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}
                      {!campaign.goal_amount && (
                        <div className="text-center py-2">
                          <span className="font-bold text-gray-800 text-base sm:text-lg">
                            {campaign.currency || 'AED'} {campaign.raised_amount?.toLocaleString() || '0'} raised
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {campaign.expires_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">Ends {formatDistanceToNow(new Date(campaign.expires_at), { addSuffix: true })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 sm:p-6 pt-0">
                    <Button 
                      className="w-full bg-pink-600 hover:bg-pink-700 text-sm sm:text-base"
                      onClick={() => openDonateDialog(campaign)}
                      disabled={isCompleted}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {isCompleted ? 'Goal Reached' : 'Donate Now'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Donate Dialog */}
        <Dialog open={showDonateDialog} onOpenChange={setShowDonateDialog}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Make a Donation</DialogTitle>
              <DialogDescription className="text-sm">
                {selectedCampaign && `Support: ${selectedCampaign.title}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="amount">Donation Amount ({selectedCampaign?.currency || 'AED'})</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  disabled={isDonating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  disabled={isAnonymous || isDonating}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  disabled={isDonating}
                  className="rounded"
                />
                <Label htmlFor="anonymous" className="text-sm">Donate anonymously</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a message of support..."
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  rows={3}
                  disabled={isDonating}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setShowDonateDialog(false)} 
                disabled={isDonating}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDonate} 
                disabled={isDonating} 
                className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700"
              >
                {isDonating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Donate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
