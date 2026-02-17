import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Heart, Upload, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Donation } from '@/entities/Donation';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateDonation() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    currency: 'AED',
    expires_at: '',
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...images]
      }));
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Please enter a campaign title');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (formData.goal_amount && parseFloat(formData.goal_amount) <= 0) {
      setError('Goal amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const donationData = {
        organizer_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        goal_amount: formData.goal_amount ? parseFloat(formData.goal_amount) : null,
        currency: formData.currency,
        images: formData.images,
        expires_at: formData.expires_at || null,
        status: 'active',
        admin_status: 'pending', // Requires admin approval
        raised_amount: 0
      };

      await Donation.create(donationData);
      navigate(createPageUrl("Donations"));
    } catch (error) {
      console.error('Error creating donation campaign:', error);
      setError(error.message || 'Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">You must be logged in to create a donation campaign.</p>
            <Link to={createPageUrl("Login")}>
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Donations")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Donation Campaign</h1>
            <p className="text-gray-600 mt-1">Start a campaign to help community members in need</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Your campaign will be reviewed by administrators before being published.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Support for John's Medical Bills"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell the community about this cause..."
                  required
                  rows={6}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500">{formData.description.length}/1000 characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal_amount">Goal Amount (Optional)</Label>
                  <Input
                    id="goal_amount"
                    name="goal_amount"
                    type="number"
                    value={formData.goal_amount}
                    onChange={handleInputChange}
                    placeholder="10000"
                    min="1"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500">Leave empty for open-ended campaigns</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                    <option value="NGN">NGN</option>
                    <option value="KES">KES</option>
                    <option value="GHS">GHS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">End Date (Optional)</Label>
                <Input
                  id="expires_at"
                  name="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={handleInputChange}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="space-y-2">
                <Label>Images (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload images</span>
                  </label>
                </div>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img src={image} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Link to={createPageUrl("Donations")} className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1 bg-pink-600 hover:bg-pink-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
