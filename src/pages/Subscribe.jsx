import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { AppSettings } from '@/entities/AppSettings';
import { SubscriptionRequest } from '@/entities/SubscriptionRequest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Star, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { notifyAdminOnSubscriptionRequest } from '@/functions/notifyAdminOnSubscriptionRequest';

export default function Subscribe() {
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(null);
    const [selectedPackageId, setSelectedPackageId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [currentUser, appSettings] = await Promise.all([
                    User.me(),
                    AppSettings.list()
                ]);
                setUser(currentUser);
                setSettings(appSettings[0]);
            } catch (error) {
                console.error("Failed to load data:", error);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const packages = [
        { id: 'monthly', name: 'Monthly', duration_days: 30, price: settings?.subscription_prices?.monthly, highlight: false },
        { id: 'quarterly', name: 'Quarterly', duration_days: 90, price: settings?.subscription_prices?.quarterly, highlight: true },
        { id: 'yearly', name: 'Annual', duration_days: 365, price: settings?.subscription_prices?.yearly, highlight: false },
    ];

    const handleSubmit = async () => {
        if (!selectedPackageId) {
            alert("Please select a subscription package.");
            return;
        }
        
        setIsSubmitting(true);
        const selectedPkg = packages.find(p => p.id === selectedPackageId);
        
        try {
            console.log("Creating subscription request with data:", {
                user_id: user.id,
                package_id: selectedPkg.id,
                package_name: selectedPkg.name,
                duration_days: selectedPkg.duration_days,
                cost: selectedPkg.price,
                status: 'pending'
            });

            // Create the subscription request first
            const subscriptionRequest = await SubscriptionRequest.create({
                user_id: user.id,
                package_id: selectedPkg.id,
                package_name: selectedPkg.name,
                duration_days: selectedPkg.duration_days,
                cost: selectedPkg.price,
                status: 'pending'
            });

            console.log("Subscription request created successfully:", subscriptionRequest);

            // Send notification to admin
            try {
                await notifyAdminOnSubscriptionRequest({
                    subscriptionRequestId: subscriptionRequest.id,
                    userDetails: {
                        name: user.full_name,
                        email: user.email
                    },
                    packageDetails: {
                        name: selectedPkg.name,
                        cost: selectedPkg.price,
                        duration_days: selectedPkg.duration_days
                    }
                });
                console.log("Admin notification sent successfully");
            } catch (notifyError) {
                console.error("Failed to notify admin:", notifyError);
            }

            // Only redirect to WhatsApp if the request was successfully created
            if (subscriptionRequest && subscriptionRequest.id) {
                const whatsappMessage = `Hello, I would like to subscribe to the ${selectedPkg.name} package for AED ${selectedPkg.price}. My subscription request ID is: ${subscriptionRequest.id}`;
                const adminWhatsapp = (settings?.admin_whatsapp || "+971501234567").replace(/\D/g, '');
                
                // Open WhatsApp
                window.open(`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                
                alert("Your subscription request has been sent! An admin will process it shortly.");
                window.location.href = createPageUrl('Profile');
            } else {
                throw new Error("Subscription request was created but no ID was returned");
            }

        } catch (error) {
            console.error("DETAILED ERROR creating subscription request:", error);
            alert(`There was an error submitting your request: ${error.message}. Please try again or contact support.`);
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    const isSubscribed = user?.subscription_status === 'active' && new Date(user.subscription_expires) > new Date();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to={createPageUrl("Profile")}>
                        <Button variant="outline" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
                        <p className="text-gray-600 mt-1">Choose a plan to list your services.</p>
                    </div>
                </div>

                {isSubscribed && (
                     <Card className="mb-8 bg-green-50 border-green-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800"><CheckCircle className="w-5 h-5" /> Active Subscription</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-green-700">Your subscription is active until: <strong>{new Date(user.subscription_expires).toLocaleDateString()}</strong></p>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Choose Your Plan</CardTitle>
                        <CardDescription>An active subscription is required for vendors, agents, and drivers to be visible on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={selectedPackageId} onValueChange={setSelectedPackageId} className="space-y-4">
                            {packages.map((pkg) => (
                                <Label key={pkg.id} htmlFor={pkg.id} className={`flex items-start space-x-4 p-4 border rounded-lg cursor-pointer transition-all ${selectedPackageId === pkg.id ? 'border-purple-500 ring-2 ring-purple-200' : ''} ${pkg.highlight ? 'bg-purple-50' : ''}`}>
                                    <RadioGroupItem value={pkg.id} id={pkg.id} className="mt-1" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-900">{pkg.name}</span>
                                            {pkg.highlight && <Badge className="bg-purple-600 text-white">Best Value</Badge>}
                                        </div>
                                        <div className="text-2xl font-bold my-2">AED {pkg.price}</div>
                                        <div className="text-xs text-gray-500">per {pkg.id.replace('ly', '')}</div>
                                    </div>
                                </Label>
                            ))}
                        </RadioGroup>
                        <Button onClick={handleSubmit} disabled={!selectedPackageId || isSubmitting} className="w-full mt-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                             {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                            {isSubscribed ? 'Extend Subscription' : 'Subscribe & Pay'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}