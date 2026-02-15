import React, { useState, useRef } from 'react';
import { LostItem } from '@/entities/LostItem';
import { User } from '@/entities/User';
import { UploadFile } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ReportLostItem() {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    last_seen_location: '',
    type: 'lost',
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const user = await User.me();
      let imageUrl = '';

      if (imageFile) {
        const { file_url } = await UploadFile({ file: imageFile });
        imageUrl = file_url;
      }

      await LostItem.create({
        ...formData,
        image: imageUrl,
        reporter_id: user.id,
      });

      setSuccess(true);
    } catch (err) {
      console.error("Failed to report item:", err);
      setError("Failed to submit your report. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-bold mb-2">Report Submitted!</h2>
            <p className="text-gray-600 mb-6">Thank you for your report. An admin will review it shortly.</p>
            <Link to={createPageUrl("LostAndFound")}>
              <Button>Back to Lost & Found</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("LostAndFound")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report an Item</h1>
            <p className="text-gray-600">Help our community by reporting lost or found items.</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Please provide as much detail as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="type">Report Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(p => ({...p, type: value}))}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">I Lost an Item</SelectItem>
                    <SelectItem value="found">I Found an Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="item_name">Item Name</Label>
                <Input id="item_name" name="item_name" value={formData.item_name} onChange={handleInputChange} placeholder="e.g., Black Wallet, iPhone 13" required />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Provide details like color, brand, and any identifying marks." required />
              </div>

              <div>
                <Label htmlFor="last_seen_location">{formData.type === 'lost' ? 'Last Seen Location' : 'Found Location'}</Label>
                <Input id="last_seen_location" name="last_seen_location" value={formData.last_seen_location} onChange={handleInputChange} placeholder="e.g., Dubai Mall, near the fountain" required />
              </div>

              <div>
                <Label htmlFor="image">Image (Optional)</Label>
                <Input id="image" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                {imageFile && <p className="text-sm text-gray-500 mt-2">Selected: {imageFile.name}</p>}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Report'
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