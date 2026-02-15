
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Event } from "@/entities/Event";
import { User } from "@/entities/User";
import { UploadFile } from "@/integrations/Core";
import { notifyAdminOnContentCreation } from "@/functions/notifyAdminOnContentCreation"; // New import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ArrowLeft,
  Calendar as CalendarIcon,
  MapPin,
  Image as ImageIcon,
  Plus,
  X,
  Save,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

const DateTimePicker = ({ value, onChange, label }) => {
    // Helper function to safely check if a date is valid
    const isValidDate = (date) => {
        return date && date instanceof Date && !isNaN(date.getTime());
    };

    // Helper function to safely format date
    const formatDate = (date, formatString) => {
        if (!isValidDate(date)) return '';
        try {
            return format(date, formatString);
        } catch (error) {
            console.error('Date formatting error:', error);
            return '';
        }
    };

    return (
        <div>
            <Label>{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start rounded-xl">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {isValidDate(value) ? formatDate(value, 'PPP p') : `Select date & time`}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={isValidDate(value) ? value : undefined}
                        onSelect={(date) => {
                            const newDate = date ? new Date(date) : null;
                            if (newDate && isValidDate(value)) {
                                newDate.setHours(value.getHours());
                                newDate.setMinutes(value.getMinutes());
                            }
                            onChange(newDate);
                        }}
                    />
                    <div className="p-3 border-t">
                        <Input
                            type="time"
                            value={isValidDate(value) ? formatDate(value, 'HH:mm') : ''}
                            onChange={(e) => {
                                let newDate = isValidDate(value) ? new Date(value) : new Date();
                                if (e.target.value) {
                                    const [hours, minutes] = e.target.value.split(':');
                                    newDate.setHours(parseInt(hours), parseInt(minutes));
                                    onChange(newDate);
                                }
                            }}
                            className="rounded-xl"
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default function AddEvent() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const imageInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    start_datetime: null,
    end_datetime: null,
    location: {
      venue_name: '',
      address: '',
      city: '',
      emirate: ''
    },
    contact: {
      phone: '',
      email: '',
      whatsapp: ''
    },
    is_free: true,
    ticket_options: [{ name: 'General Admission', price: '', description: '' }],
    max_attendees: '',
    images: []
  });

  const loadUser = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

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

  const handleTicketOptionChange = (index, field, value) => {
    const newTicketOptions = [...formData.ticket_options];
    newTicketOptions[index][field] = value;
    setFormData(prev => ({ ...prev, ticket_options: newTicketOptions }));
  };

  const addTicketOption = () => {
    setFormData(prev => ({
      ...prev,
      ticket_options: [...prev.ticket_options, { name: '', price: '', description: '' }]
    }));
  };

  const removeTicketOption = (index) => {
    // Ensure there's at least one ticket option if it's not a free event
    if (!formData.is_free && formData.ticket_options.length === 1) {
      setError("At least one ticket option is required for paid events.");
      return;
    }
    const newTicketOptions = [...formData.ticket_options];
    newTicketOptions.splice(index, 1);
    setFormData(prev => ({ ...prev, ticket_options: newTicketOptions }));
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
    } catch (error) {
      console.error("Image upload failed:", error);
      setError("Failed to upload images. Please try again.");
    }
    setUploadingImage(false);
    
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
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
      const eventData = {
        ...formData,
        organizer_id: user.id,
        ticket_options: formData.is_free 
            ? [] 
            : formData.ticket_options.map(opt => ({...opt, price: parseFloat(opt.price) || 0})),
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        status: 'pending'
      };

      const newEvent = await Event.create(eventData);
      setSuccess(true);
      
      // Notify admin
      await notifyAdminOnContentCreation({ entityType: 'Event', entityTitle: newEvent.title });

      setTimeout(() => {
        window.location.href = createPageUrl("Events");
      }, 2000);

    } catch (error) {
      console.error("Failed to create event:", error);
      setError("Failed to create event. Please try again.");
    }
    setIsLoading(false);
  };

  const categories = [
    { value: 'cultural', label: 'Cultural' },
    { value: 'business', label: 'Business' },
    { value: 'social', label: 'Social' },
    { value: 'religious', label: 'Religious' },
    { value: 'educational', label: 'Educational' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' }
  ];

  const emirates = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-4">Event Submitted!</h2>
            <p className="text-green-800 mb-6">
              Your event has been submitted for admin review. You'll be notified once it's approved.
            </p>
            <Link to={createPageUrl("Events")}>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Back to Events
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
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Events")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Event</h1>
            <p className="text-gray-600 mt-1">Share your event with the CashLink community</p>
          </div>
        </div>

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
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="African Music Festival"
                  className="rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your event..."
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
                    <Label>&nbsp;</Label>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateTimePicker 
                    value={formData.start_datetime}
                    onChange={(date) => setFormData(prev => ({...prev, start_datetime: date}))}
                    label="Start Date & Time *"
                />
                <DateTimePicker 
                    value={formData.end_datetime}
                    onChange={(date) => setFormData(prev => ({...prev, end_datetime: date}))}
                    label="End Date & Time *"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="venue_name">Venue Name</Label>
                <Input
                  id="venue_name"
                  value={formData.location.venue_name}
                  onChange={(e) => handleLocationChange('venue_name', e.target.value)}
                  placeholder="Dubai Festival City"
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.location.address}
                  onChange={(e) => handleLocationChange('address', e.target.value)}
                  placeholder="Street address"
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

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Pricing & Capacity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <Label htmlFor="is_free">Free Event</Label>
                <Switch
                  id="is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      is_free: checked,
                      // Reset ticket options if switching to free, or set a default if switching from free
                      ticket_options: checked ? [{ name: 'General Admission', price: '', description: '' }] : prev.ticket_options.length === 0 ? [{ name: 'General Admission', price: '', description: '' }] : prev.ticket_options
                    }));
                    setError(null); // Clear any ticket option related errors
                  }}
                />
              </div>

              {!formData.is_free && (
                <div className="space-y-4">
                  <Label>Ticket Options</Label>
                  {formData.ticket_options.map((option, index) => (
                    <div key={index} className="p-4 border rounded-xl space-y-3 relative">
                       {/* Show remove button only if there's more than one option */}
                       {formData.ticket_options.length > 1 && (
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                            onClick={() => removeTicketOption(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                       )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`ticket_name_${index}`}>Tier Name</Label>
                          <Input
                            id={`ticket_name_${index}`}
                            value={option.name}
                            onChange={(e) => handleTicketOptionChange(index, 'name', e.target.value)}
                            placeholder="e.g., General Admission, VIP"
                            className="rounded-xl"
                            required={!formData.is_free} // Make required if not free
                          />
                        </div>
                        <div>
                          <Label htmlFor={`ticket_price_${index}`}>Price (AED)</Label>
                          <Input
                            id={`ticket_price_${index}`}
                            type="number"
                            value={option.price}
                            onChange={(e) => handleTicketOptionChange(index, 'price', e.target.value)}
                            placeholder="50"
                            className="rounded-xl"
                            min="0"
                            step="0.01"
                            required={!formData.is_free} // Make required if not free
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`ticket_desc_${index}`}>Description (Optional)</Label>
                        <Input
                          id={`ticket_desc_${index}`}
                          value={option.description}
                          onChange={(e) => handleTicketOptionChange(index, 'description', e.target.value)}
                          placeholder="e.g., Includes a free drink"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addTicketOption} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add another ticket tier
                  </Button>
                </div>
              )}

              <div>
                <Label htmlFor="max_attendees">Maximum Attendees (Optional)</Label>
                <Input
                  id="max_attendees"
                  name="max_attendees"
                  type="number"
                  value={formData.max_attendees}
                  onChange={handleInputChange}
                  placeholder="100"
                  className="rounded-xl"
                  min="1"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Event Images
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
                  ref={imageInputRef}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingImage}
                  className="w-full border-dashed rounded-xl h-32 flex flex-col items-center justify-center gap-2"
                  onClick={() => imageInputRef.current.click()}
                >
                  {uploadingImage ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                  ) : (
                    <>
                      <Plus className="w-8 h-8 text-gray-400" />
                      <span className="text-gray-600">Upload Event Images</span>
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
                        alt={`Event ${index + 1}`}
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

          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={
                isLoading || 
                !formData.title || 
                !formData.description || 
                !formData.category || 
                !formData.start_datetime || 
                !formData.end_datetime ||
                (!formData.is_free && (formData.ticket_options.length === 0 || formData.ticket_options.some(opt => !opt.name || opt.price === ''))) // Disable if paid and no ticket options or missing name/price
              }
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-12 py-3 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Creating Event...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Event
                </>
              )}
            </Button>
          </div>
        </form>

        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Event Review Process</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Your event will be reviewed by our admin team before it appears publicly. 
                  This usually takes 24-48 hours. You'll be notified once your event is approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
