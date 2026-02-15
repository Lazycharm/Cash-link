
import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Business } from "@/entities/Business";
import { User } from "@/entities/User";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  Phone,
  Image as ImageIcon,
  Plus,
  X,
  Save,
  RefreshCw,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function EditBusiness() {
  const { id: businessId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: { address: '', city: '', emirate: '' },
    contact: { phone: '', email: '', whatsapp: '' },
    hours: { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' },
    images: []
  });

  useEffect(() => {
    const loadData = async () => {
      if (!businessId) {
        setError("No business ID provided.");
        setIsLoading(false);
        return;
      }
      
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const businesses = await Business.filter({ id: businessId });
        if (businesses.length === 0) {
          setError("Business not found.");
          setIsLoading(false);
          return;
        }

        const foundBusiness = businesses[0];
        if (currentUser.id !== foundBusiness.owner_id && currentUser.role !== 'admin') {
          setError("You do not have permission to edit this business.");
          setIsLoading(false);
          return;
        }

        setBusiness(foundBusiness);
        setFormData({
          name: foundBusiness.name || '',
          description: foundBusiness.description || '',
          category: foundBusiness.category || '',
          location: foundBusiness.location || { address: '', city: '', emirate: '' },
          contact: foundBusiness.contact || { phone: '', email: '', whatsapp: '' },
          hours: foundBusiness.hours || { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' },
          images: foundBusiness.images || []
        });

      } catch (err) {
        setError("Failed to load business data. " + err.message);
      }
      setIsLoading(false);
    };

    loadData();
  }, [businessId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (field, value) => setFormData(prev => ({...prev, location: { ...prev.location, [field]: value }}));
  const handleContactChange = (field, value) => setFormData(prev => ({...prev, contact: { ...prev.contact, [field]: value }}));
  const handleHoursChange = (day, value) => setFormData(prev => ({...prev, hours: { ...prev.hours, [day]: value }}));
  
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    setError(null);

    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const uploadResults = await Promise.all(uploadPromises);
      const imageUrls = uploadResults.map(result => result.file_url);

      setFormData(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }));
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (err) {
      setError("Failed to upload images. Please try again.");
    }
    setUploadingImage(false);
  };

  const removeImage = (index) => setFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== index)}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const updateData = {
        ...formData,
        status: 'pending' // Re-approval after edit
      };
      await Business.update(businessId, updateData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/business/${businessId}`);
      }, 2000);
    } catch (err) {
      setError("Failed to update business listing. " + err.message);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-4">An Error Occurred</h2>
            <p className="text-red-800 mb-6">{error}</p>
            <Link to={createPageUrl("Businesses")}>
              <Button className="bg-red-600 hover:bg-red-700 text-white">Back to Businesses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <Store className="w-12 h-12 text-green-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-4">Business Updated!</h2>
            <p className="text-green-800 mb-6">
              Your changes have been submitted for admin review.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'transport', label: 'Transport' },
    { value: 'grocery', label: 'Grocery' },
    { value: 'services', label: 'Services' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'retail', label: 'Retail' },
    { value: 'other', label: 'Other' }
  ];

  const emirates = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl(`BusinessDetail?id=${businessId}`)}>
            <Button variant="outline" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Your Business</h1>
            <p className="text-gray-600 mt-1">Update your business details.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Name *</Label><Input name="name" value={formData.name} onChange={handleInputChange} required /></div>
              <div><Label>Description *</Label><Textarea name="description" value={formData.description} onChange={handleInputChange} required /></div>
              <div><Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader><CardTitle>Images</CardTitle></CardHeader>
            <CardContent>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" ref={imageInputRef} />
              <Button type="button" variant="outline" disabled={uploadingImage} className="w-full" onClick={() => imageInputRef.current.click()}>
                {uploadingImage ? <RefreshCw className="animate-spin"/> : 'Upload More Photos'}
              </Button>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative"><img src={image} className="w-full h-24 object-cover" /><Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeImage(index)}><X className="w-4 h-4"/></Button></div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader><CardTitle>Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Address *</Label><Input value={formData.location.address} onChange={(e) => handleLocationChange('address', e.target.value)} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City *</Label><Input value={formData.location.city} onChange={(e) => handleLocationChange('city', e.target.value)} required /></div>
                <div><Label>Emirate *</Label>
                  <Select value={formData.location.emirate} onValueChange={(v) => handleLocationChange('emirate', v)}>
                    <SelectTrigger><SelectValue placeholder="Select emirate" /></SelectTrigger>
                    <SelectContent>{emirates.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8">
              {isSaving ? <RefreshCw className="animate-spin"/> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
