import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Business } from '@/entities/Business';
import SetupIncomplete from '@/components/ui/SetupIncomplete';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/lib/supabase';
import { 
    Loader2, 
    Store, 
    Upload, 
    X, 
    MapPin, 
    Phone, 
    Mail, 
    Globe, 
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const categories = [
    { value: 'restaurant', label: 'Restaurant / Food' },
    { value: 'transport', label: 'Transport / Logistics' },
    { value: 'grocery', label: 'Grocery / Supermarket' },
    { value: 'services', label: 'Professional Services' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'retail', label: 'Retail / Shop' },
    { value: 'other', label: 'Other' }
];

const emirates = [
    "Abu Dhabi", "Dubai", "Sharjah", "Ajman", 
    "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"
];

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AddBusiness() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        location: {
            address: '',
            city: '',
            emirate: '',
            coordinates: null
        },
        contact: {
            phone: '',
            email: '',
            website: '',
            whatsapp: ''
        },
        hours: {
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: '',
            saturday: '',
            sunday: ''
        }
    });
    
    const [images, setImages] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
            setIsLoading(false);
        };
        fetchUser();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (images.length >= 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        setUploadingImage(true);
        setError(null);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `businesses/${user.id}/${Date.now()}.${fileExt}`;
            
            const { data, error: uploadError } = await supabase.storage
                .from('cashlink-files')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('cashlink-files')
                .getPublicUrl(fileName);

            setImages(prev => [...prev, urlData.publicUrl]);
        } catch (err) {
            console.error('Image upload error:', err);
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const applyToAllDays = (time) => {
        const updatedHours = {};
        daysOfWeek.forEach(day => {
            updatedHours[day] = time;
        });
        setFormData(prev => ({ ...prev, hours: updatedHours }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Validation
        if (!formData.name.trim()) {
            setError('Business name is required');
            setIsSubmitting(false);
            return;
        }
        if (!formData.category) {
            setError('Please select a category');
            setIsSubmitting(false);
            return;
        }
        if (!formData.location.emirate) {
            setError('Please select an emirate');
            setIsSubmitting(false);
            return;
        }

        try {
            await Business.create({
                owner_id: user.id,
                name: formData.name,
                description: formData.description,
                category: formData.category,
                images: images,
                location: formData.location,
                contact: formData.contact,
                hours: formData.hours,
                status: 'pending' // Will need admin approval
            });

            setSuccess(true);
            setTimeout(() => {
                navigate(createPageUrl('Businesses'));
            }, 2000);
        } catch (err) {
            console.error('Error creating business:', err);
            setError('Failed to create business. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-center">Error loading user data.</div>;
    }
    
    // Check if user is a vendor with approved role
    const isVendor = user.role === 'vendor';
    const isAdmin = user.role === 'admin';
    
    // For vendors, check if KYC and subscription are approved
    const isSetupComplete = user.kyc_status === 'approved' && user.subscription_status === 'active';

    if (!isAdmin && !isVendor) {
        return (
            <div className="p-4 md:p-8">
                <Card className="max-w-lg mx-auto">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Vendor Access Required</h2>
                        <p className="text-gray-600">
                            Only approved vendors can add businesses. Please complete your vendor registration first.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isVendor && !isSetupComplete) {
        return (
            <div className="p-4 md:p-8">
                <SetupIncomplete user={user} requiredRole="Vendor" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="p-4 md:p-8">
                <Card className="max-w-lg mx-auto">
                    <CardContent className="p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Business Submitted!</h2>
                        <p className="text-gray-600">
                            Your business has been submitted for review. You'll be notified once it's approved.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Store className="w-8 h-8 text-amber-600" />
                    Add Your Business
                </h1>
                <p className="text-gray-600 mt-2">
                    Fill in the details below to list your business on CashLink
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Tell us about your business</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Business Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter your business name"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select 
                                value={formData.category} 
                                onValueChange={(value) => handleInputChange('category', value)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe your business, products, or services..."
                                className="mt-1 min-h-[100px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Business Images</CardTitle>
                        <CardDescription>Upload up to 5 images of your business</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {images.map((img, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                    <img src={img} alt={`Business ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-colors">
                                    {uploadingImage ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-400" />
                                            <span className="text-xs text-gray-500 mt-1">Upload</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploadingImage}
                                    />
                                </label>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Location */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="emirate">Emirate *</Label>
                                <Select 
                                    value={formData.location.emirate} 
                                    onValueChange={(value) => handleNestedChange('location', 'emirate', value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select emirate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {emirates.map(emirate => (
                                            <SelectItem key={emirate} value={emirate}>
                                                {emirate}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="city">City / Area</Label>
                                <Input
                                    id="city"
                                    value={formData.location.city}
                                    onChange={(e) => handleNestedChange('location', 'city', e.target.value)}
                                    placeholder="e.g., Deira, Al Karama"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="address">Full Address</Label>
                            <Input
                                id="address"
                                value={formData.location.address}
                                onChange={(e) => handleNestedChange('location', 'address', e.target.value)}
                                placeholder="Building name, street, landmark..."
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.contact.phone}
                                    onChange={(e) => handleNestedChange('contact', 'phone', e.target.value)}
                                    placeholder="+971 50 123 4567"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input
                                    id="whatsapp"
                                    value={formData.contact.whatsapp}
                                    onChange={(e) => handleNestedChange('contact', 'whatsapp', e.target.value)}
                                    placeholder="+971 50 123 4567"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.contact.email}
                                    onChange={(e) => handleNestedChange('contact', 'email', e.target.value)}
                                    placeholder="business@example.com"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={formData.contact.website}
                                    onChange={(e) => handleNestedChange('contact', 'website', e.target.value)}
                                    placeholder="https://www.example.com"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Business Hours */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Business Hours
                        </CardTitle>
                        <CardDescription>
                            <Button
                                type="button"
                                variant="link"
                                className="p-0 h-auto text-amber-600"
                                onClick={() => applyToAllDays('9:00 AM - 9:00 PM')}
                            >
                                Apply "9:00 AM - 9:00 PM" to all days
                            </Button>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {daysOfWeek.map(day => (
                                <div key={day} className="flex items-center gap-3">
                                    <Label className="w-24 capitalize text-sm">{day}</Label>
                                    <Input
                                        value={formData.hours[day]}
                                        onChange={(e) => handleNestedChange('hours', day, e.target.value)}
                                        placeholder="e.g., 9:00 AM - 9:00 PM or Closed"
                                        className="flex-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(createPageUrl('Businesses'))}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Store className="w-4 h-4 mr-2" />
                                Submit Business
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}