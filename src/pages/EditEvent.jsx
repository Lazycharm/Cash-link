
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Event } from "@/entities/Event";
import { UploadFile } from "@/integrations/Core";
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
  AlertCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DateTimePicker = ({ value, onChange, label }) => {
    // Helper function to safely check if a date is valid
    const isValidDate = (date) => {
        return date instanceof Date && !isNaN(date.getTime());
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
                            } else if (newDate && !isValidDate(value)) {
                                // If no existing value, set to current time for consistency
                                const now = new Date();
                                newDate.setHours(now.getHours());
                                newDate.setMinutes(now.getMinutes());
                            }
                            onChange(newDate);
                        }}
                    />
                    <div className="p-3 border-t">
                        <Input
                            type="time"
                            value={isValidDate(value) ? formatDate(value, 'HH:mm') : ''}
                            onChange={(e) => {
                                let newDate = isValidDate(value) ? new Date(value) : new Date(); // Ensure newDate is a valid Date object
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

export default function EditEvent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // Keeping isFetching for initial data load state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(null);
  const [originalEvent, setOriginalEvent] = useState(null);
  const imageInputRef = useRef(null);
  const { id: eventId } = useParams();

  const loadEventData = useCallback(async () => {
      setIsFetching(true); // Using isFetching for overall data loading
      try {
          const allEvents = await Event.list(); // As per outline, using list then find
          const eventToEdit = allEvents.find(e => e.id === eventId);
          if (eventToEdit) {
            // Ensure datetime fields are Date objects for the picker
            eventToEdit.start_datetime = eventToEdit.start_datetime ? new Date(eventToEdit.start_datetime) : null;
            eventToEdit.end_datetime = eventToEdit.end_datetime ? new Date(eventToEdit.end_datetime) : null;

            let isFree = !eventToEdit.ticket_options || eventToEdit.ticket_options.length === 0;
            let ticketOptions = eventToEdit.ticket_options || [];

            // If it's free AND no existing ticket options, add a default one for UX if they toggle to paid
            if (isFree && ticketOptions.length === 0) {
                ticketOptions = [{ name: 'General Admission', price: '', description: '' }];
            }

            setFormData({
              ...eventToEdit,
              is_free: isFree,
              ticket_options: ticketOptions
            });
            setOriginalEvent(eventToEdit);
          } else {
            setError("Event not found.");
          }
      } catch (e) {
          setError("Failed to load event data.");
          console.error(e);
      }
      setIsFetching(false);
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    } else {
      setError("No event ID provided.");
      setIsFetching(false);
    }
  }, [eventId, loadEventData]);

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
        images: [...(prev.images || []), ...imageUrls] // Ensure images is an array
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
      // Destructure to remove unwanted properties from formData before update
      const { id, created_by, created_date, updated_date, ...restFormData } = formData;

      const eventData = {
        ...restFormData,
        status: 'pending', // Reset status to pending for re-approval
        ticket_options: formData.is_free
            ? []
            : formData.ticket_options.map(opt => ({...opt, price: parseFloat(opt.price) || 0})),
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
      };

      await Event.update(eventId, eventData); // Use eventId directly as per outline
      setSuccess(true);

      setTimeout(() => {
        window.location.href = createPageUrl("Events");
      }, 2000);

    } catch (error) {
      console.error("Failed to update event:", error);
      setError("Failed to update event. Please check your inputs and try again.");
    }
    setIsLoading(false);
  };

  const categories = [ { value: 'cultural', label: 'Cultural' }, { value: 'business', label: 'Business' }, { value: 'social', label: 'Social' }, { value: 'religious', label: 'Religious' }, { value: 'educational', label: 'Educational' }, { value: 'entertainment', label: 'Entertainment' }, { value: 'sports', label: 'Sports' }, { value: 'other', label: 'Other' }];
  const emirates = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

  if (isFetching) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-green-900 mb-4">Event Updated!</h2>
            <p className="text-green-800 mb-6">
              Your event has been re-submitted for admin review.
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

  if (!formData) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Event not found."}</div>;
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
            <p className="text-gray-600 mt-1">Update your event details</p>
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
                <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="title">Event Title *</Label>
                        <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                              <SelectContent>{categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                          </Select>
                      </div>
                       <div><Label>&nbsp;</Label></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DateTimePicker value={formData.start_datetime} onChange={(date) => setFormData(prev => ({...prev, start_datetime: date}))} label="Start Date & Time *" />
                        <DateTimePicker value={formData.end_datetime} onChange={(date) => setFormData(prev => ({...prev, end_datetime: date}))} label="End Date & Time *" />
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
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free: checked }))}
                />
              </div>

              {!formData.is_free && (
                <div className="space-y-4">
                  <Label>Ticket Options</Label>
                  {formData.ticket_options.map((option, index) => (
                    <div key={index} className="p-4 border rounded-xl space-y-3 relative">
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
              <CardHeader><CardTitle>Location</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                  <div>
                      <Label>Venue Name</Label>
                      <Input value={formData.location.venue_name} onChange={(e) => handleLocationChange('venue_name', e.target.value)} />
                  </div>
                  <div>
                      <Label>Address</Label>
                      <Input value={formData.location.address} onChange={(e) => handleLocationChange('address', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <Label>City *</Label>
                          <Input value={formData.location.city} onChange={(e) => handleLocationChange('city', e.target.value)} required />
                      </div>
                      <div>
                          <Label>Emirate *</Label>
                          <Select value={formData.location.emirate} onValueChange={(value) => handleLocationChange('emirate', value)}>
                              <SelectTrigger><SelectValue placeholder="Select emirate" /></SelectTrigger>
                              <SelectContent>{emirates.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                          </Select>
                      </div>
                  </div>
              </CardContent>
            </Card>

            {/* Images Section */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-gray-500" /> Images
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="imageUpload" className="sr-only">Upload Image</Label>
                        <Input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            ref={imageInputRef}
                            className="hidden"
                            multiple
                        />
                        <Button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            variant="outline"
                            className="flex items-center gap-2 rounded-xl"
                            disabled={uploadingImage}
                        >
                            {uploadingImage ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            Upload Image(s)
                        </Button>
                    </div>
                    {formData.images && formData.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                            {formData.images.map((image, index) => (
                                <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200">
                                    <img src={image} alt={`Event Image ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label={`Remove image ${index + 1}`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Contact Info Section */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Contact Name</Label>
                        <Input value={formData.contact.name} onChange={(e) => handleContactChange('name', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Email</Label>
                            <Input type="email" value={formData.contact.email} onChange={(e) => handleContactChange('email', e.target.value)} />
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input type="tel" value={formData.contact.phone} onChange={(e) => handleContactChange('phone', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <Label>Website/Social Media</Label>
                        <Input type="url" value={formData.contact.website} onChange={(e) => handleContactChange('website', e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            {/* Other Options Section */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Other Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="featured_event" className="flex flex-col space-y-1">
                            <span>Featured Event</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Highlight this event on the main page.
                            </span>
                        </Label>
                        <Switch
                            id="featured_event"
                            checked={formData.featured_event}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured_event: checked }))}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="online_event" className="flex flex-col space-y-1">
                            <span>Online Event</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Is this event held online?
                            </span>
                        </Label>
                        <Switch
                            id="online_event"
                            checked={formData.online_event}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, online_event: checked }))}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-12 py-3 text-lg rounded-xl">
                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                Update Event
              </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
