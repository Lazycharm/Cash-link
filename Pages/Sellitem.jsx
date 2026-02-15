
import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MarketplaceItem } from "@/entities/MarketplaceItem";
import { User } from "@/entities/User";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Image as ImageIcon,
  Plus,
  X,
  Save,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { notifyAdminOnContentCreation } from "@/functions/notifyAdminOnContentCreation";

export default function SellItem() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const imageInputRef = useRef(null); // Create a ref for the file input
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'good',
    price: '',
    currency: 'AED',
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
    is_negotiable: true,
    images: []
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    setError(null);

    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const uploadResults = await Promise.all(uploadPromises);
      const imageUrls = uploadResults.map(result => result.file_url);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
      // Clear the file input after successful upload to allow re-uploading the same file
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      setError("Failed to upload images. Please try again.");
    }
    setUploadingImage(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const itemData = {
        ...formData,
        seller_id: user.id,
        price: parseFloat(formData.price),
        status: 'pending'
      };

      const newItem = await MarketplaceItem.create(itemData);
      setSuccess(true);
      
      // Notify admin
      await notifyAdminOnContentCreation({ entityType: 'Marketplace Item', entityTitle: newItem.title });

      setTimeout(() => {
        window.location.href = createPageUrl("Marketplace");
      }, 2000);

    } catch (error) {
      console.error("Failed to create item:", error);
      setError("Failed to list item. Please try again.");
    }
    setIsLoading(false);
  };

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' },
    { value: 'sports', label: 'Sports' },
    { value: 'toys', label: 'Toys' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'other', label: 'Other' }
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const emirates = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-4">Item Listed!</h2>
            <p className="text-green-800 mb-6">
              Your item has been submitted for admin review. You'll be notified once it's approved.
            </p>
            <Link to={createPageUrl("Marketplace")}>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Back to Marketplace
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
          <Link to={createPageUrl("Marketplace")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sell Item</h1>
            <p className="text-gray-600 mt-1">List your item on the CashLink marketplace</p>
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
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Item Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="iPhone 14 Pro Max"
                  className="rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Item Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your item in detail..."
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
                  <Label htmlFor="condition">Condition *</Label>
                  <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (AED) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="500"
                    className="rounded-xl"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AED">AED</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Item Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  ref={imageInputRef} // Assign the ref
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingImage}
                  className="w-full border-dashed rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer"
                  onClick={() => imageInputRef.current.click()} // Programmatically click the input
                >
                  {uploadingImage ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                  ) : (
                    <>
                      <Plus className="w-8 h-8 text-gray-400" />
                      <span className="text-gray-600">Upload Item Images</span>
                    </>
                  )}
                </Button>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Item ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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

          {/* Settings */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <Label htmlFor="is_negotiable">Price Negotiable</Label>
                <Switch
                  id="is_negotiable"
                  checked={formData.is_negotiable}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_negotiable: checked }))}
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
              disabled={isLoading || !formData.title || !formData.description || !formData.category || !formData.price}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-12 py-3 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Listing Item...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  List Item
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
                <h3 className="font-semibold text-blue-900 mb-2">Item Review Process</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Your item listing will be reviewed by our admin team before it appears publicly. 
                  This usually takes 24-48 hours. You'll be notified once your item is approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
