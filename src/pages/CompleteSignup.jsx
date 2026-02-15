import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { notifyAdminOnRoleRequest } from "@/functions/notifyAdminOnRoleRequest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MapPin, User as UserIcon, Phone, Briefcase } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function CompleteSignup() {
  const { user: authUser, profile, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    phone_number: '',
    preferred_app_role: 'customer',
    location: {
      address: '',
      city: '',
      emirate: ''
    }
  });

  // Use profile as user for backward compatibility
  const user = profile;

  // Redirect if user already has a complete profile or is admin
  useEffect(() => {
    if (!loading && profile) {
      // Admin goes directly to admin dashboard
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }
      
      // If profile is already complete (has name and phone), skip this page
      const hasCompletedProfile = profile.full_name && profile.phone;
      if (hasCompletedProfile) {
        // Redirect based on role
        if (profile.role === 'vendor') {
          navigate('/vendor-dashboard', { replace: true });
        } else if (profile.role === 'agent') {
          navigate('/agent-dashboard', { replace: true });
        } else if (profile.role === 'driver') {
          navigate('/driver-dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        return;
      }
    }
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || profile.full_name?.split(' ')[0] || '',
        phone_number: profile.phone_number || profile.phone || '',
        preferred_app_role: profile.preferred_app_role || profile.app_role || 'customer',
        location: {
          address: profile.location?.address || '',
          city: profile.location?.city || '',
          emirate: profile.location?.emirate || ''
        }
      });
    }
  }, [profile]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.first_name.trim() || !formData.phone_number.trim() || !formData.location.city.trim()) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      const updateData = {
        full_name: formData.first_name,
        phone: formData.phone_number,
        location: formData.location
      };

      // Handle role logic
      if (formData.preferred_app_role === 'customer') {
        // Customer role - direct approval, no KYC needed
        updateData.role = 'customer';
        updateData.app_role = 'customer';
        updateData.role_request_status = 'none';
      } else {
        // Professional roles need admin approval first, then KYC
        updateData.role = 'customer'; // Stay as customer until approved
        updateData.app_role = 'customer';
        updateData.requested_role = formData.preferred_app_role; // Store what they want
        updateData.role_request_status = 'pending'; // Pending admin approval
      }

      await updateProfile(updateData);

      // Notify admin for professional roles
      if (formData.preferred_app_role !== 'customer') {
        try {
          await notifyAdminOnRoleRequest({
            userId: user.id,
            userEmail: user.email,
            userName: formData.first_name,
            requestedRole: formData.preferred_app_role
          });
        } catch (notifyError) {
          console.error("Failed to notify admin:", notifyError);
          // Don't fail the whole process if notification fails
        }
      }

      // ALL users go to Home after signup
      // Professional role users will see a banner about pending role approval
      window.location.href = createPageUrl("Home");

    } catch (error) {
      console.error("Signup error:", error);
      setError("Failed to complete signup. Please try again.");
    }
    setIsLoading(false);
  };

  const emirates = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];
  const roles = [
    { value: 'customer', label: 'Customer', description: 'Use services and shop' },
    { value: 'vendor', label: 'Business Owner', description: 'List businesses and services' },
    { value: 'agent', label: 'Money Agent', description: 'Help with money transfers' },
    { value: 'driver', label: 'Driver', description: 'Provide transport services' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Complete Your Profile</CardTitle>
          <p className="text-gray-600 mt-2">Let's set up your CashLink account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Personal Information
              </h3>
              
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  className="rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="+971 50 123 4567"
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h3>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.location.address}
                  onChange={(e) => handleLocationChange('address', e.target.value)}
                  placeholder="Your street address"
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
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Account Type
              </h3>

              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={role.value} className={`p-4 border rounded-xl cursor-pointer transition-all ${
                    formData.preferred_app_role === role.value 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        checked={formData.preferred_app_role === role.value}
                        onCheckedChange={() => setFormData(prev => ({ ...prev, preferred_app_role: role.value }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{role.label}</div>
                        <div className="text-sm text-gray-600">{role.description}</div>
                        {role.value !== 'customer' && (
                          <div className="text-xs text-orange-600 mt-1">
                            • Requires admin approval • KYC verification • Active subscription
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}