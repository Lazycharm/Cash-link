
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Job } from "@/entities/Job";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft,
  Briefcase,
  MapPin,
  Plus,
  X,
  Save,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { notifyAdminOnContentCreation } from "@/functions/notifyAdminOnContentCreation";

export default function PostJob() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [requirements, setRequirements] = useState(['']);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    job_type: 'full_time',
    salary_range: '',
    location: {
      city: '',
      emirate: '',
      address: ''
    },
    contact: {
      phone: '',
      email: '',
      whatsapp: ''
    },
    is_urgent: false,
    expires_at: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Pre-fill contact information from user profile
      setFormData(prev => ({
        ...prev,
        contact: {
          phone: currentUser.phone_number || '',
          email: currentUser.email || '',
          whatsapp: currentUser.phone_number || ''
        },
        location: {
          ...prev.location,
          city: currentUser.location?.city || '',
          emirate: currentUser.location?.emirate || ''
        }
      }));
    } catch (error) {
      console.error("Error loading user:", error);
      setError("Unable to load your profile information.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const handleContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const jobData = {
        ...formData,
        poster_id: user.id,
        requirements: requirements.filter(req => req.trim() !== ''),
        status: 'pending'
      };

      const newJob = await Job.create(jobData);
      setSuccess(true);

      // Notify admin
      await notifyAdminOnContentCreation({ entityType: 'Job', entityTitle: newJob.title });

      setTimeout(() => {
        window.location.href = createPageUrl("Jobs");
      }, 2000);

    } catch (error) {
      console.error("Failed to create job:", error);
      setError("Failed to post job. Please try again.");
    }
    setIsLoading(false);
  };

  const categories = [
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'construction', label: 'Construction' },
    { value: 'transport', label: 'Transport' },
    { value: 'domestic', label: 'Domestic' },
    { value: 'sales', label: 'Sales' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'other', label: 'Other' }
  ];

  const jobTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'temporary', label: 'Temporary' }
  ];

  const emirates = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-4">Job Posted!</h2>
            <p className="text-green-800 mb-6">
              Your job posting has been submitted for admin review. You'll be notified once it's approved.
            </p>
            <Link to={createPageUrl("Jobs")}>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Back to Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Jobs")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Post Job</h1>
            <p className="text-gray-600 mt-1">Share job opportunities with the CashLink community</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Restaurant Manager"
                  className="rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the job responsibilities and duties..."
                  rows={4}
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Select value={formData.job_type} onValueChange={(value) => setFormData(prev => ({ ...prev, job_type: value }))}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="salary_range">Salary Range (Optional)</Label>
                <Input
                  id="salary_range"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleInputChange}
                  placeholder="AED 3,000 - 5,000"
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  value={formData.location.address}
                  onChange={(e) => handleLocationChange('address', e.target.value)}
                  placeholder="Street address or area"
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.location.city}
                    onChange={(e) => handleLocationChange('city', e.target.value)}
                    placeholder="Dubai"
                    className="rounded-xl"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emirate">Emirate *</Label>
                  <Select 
                    value={formData.location.emirate} 
                    onValueChange={(value) => handleLocationChange('emirate', value)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select emirate" />
                    </SelectTrigger>
                    <SelectContent>
                      {emirates.map((emirate) => (
                        <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder="Enter job requirement"
                    className="rounded-xl"
                  />
                  {requirements.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeRequirement(index)}
                      className="rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                onClick={addRequirement}
                className="rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Requirement
              </Button>
            </CardContent>
          </Card>

          {/* Job Settings */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Job Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <Label htmlFor="is_urgent">Urgent Job</Label>
                <Switch
                  id="is_urgent"
                  checked={formData.is_urgent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_urgent: checked }))}
                />
              </div>

              <div>
                <Label htmlFor="expires_at">Job Expiry Date (Optional)</Label>
                <Input
                  id="expires_at"
                  name="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={handleInputChange}
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.contact.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.contact.whatsapp}
                    onChange={(e) => handleContactChange('whatsapp', e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  placeholder="contact@example.com"
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isLoading || !formData.title || !formData.description || !formData.category}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-12 py-3 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Posting Job...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Post Job
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Note */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Job Review Process</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Your job posting will be reviewed by our admin team before it appears publicly. 
                  This usually takes 24-48 hours. You'll be notified once your job is approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
