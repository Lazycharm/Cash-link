import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { User } from '@/entities/User';
import { Business } from '@/entities/Business';
import { AppSettings } from '@/entities/AppSettings';
import { PromotionRequest } from '@/entities/PromotionRequest';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Loader2, 
    ArrowLeft, 
    Megaphone, 
    CheckCircle, 
    Star, 
    TrendingUp,
    Eye,
    Users,
    Sparkles,
    Clock,
    CreditCard,
    AlertCircle
} from 'lucide-react';

export default function PromoteContent() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const type = searchParams.get('type'); // 'business', 'agent', 'driver'
    const id = searchParams.get('id');
    
    const [user, setUser] = useState(null);
    const [entity, setEntity] = useState(null);
    const [settings, setSettings] = useState(null);
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [type, id]);

    const loadData = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);

            // Load app settings for promotion packages
            const appSettings = await AppSettings.list();
            if (appSettings.length > 0) {
                setSettings(appSettings[0]);
                setPackages(appSettings[0].promotion_packages || []);
            }

            // Load the entity being promoted
            if (type === 'business' && id) {
                const businesses = await Business.filter({ id });
                if (businesses.length > 0) {
                    setEntity(businesses[0]);
                }
            } else if (type === 'agent' || type === 'driver') {
                // For agents/drivers, we promote their profile
                setEntity({
                    id: currentUser.id,
                    name: currentUser.full_name,
                    type: type
                });
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load data');
        }
        setIsLoading(false);
    };

    const handleSubmit = async () => {
        if (!selectedPackage) {
            setError('Please select a promotion package');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const pkg = packages.find(p => p.id === selectedPackage);
            
            await PromotionRequest.create({
                user_id: user.id,
                entity_type: type, // 'business', 'agent', or 'driver'
                entity_id: type === 'business' ? entity.id : user.id,
                package_id: pkg.id,
                package_name: pkg.name,
                cost: pkg.price,
                duration_days: pkg.duration_days,
                status: 'pending'
            });

            setSuccess(true);
        } catch (err) {
            console.error('Error creating promotion request:', err);
            setError('Failed to submit promotion request. Please try again.');
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto" />
                    <p className="text-gray-600 mt-3">Loading promotion options...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
                <div className="max-w-lg mx-auto mt-20">
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm text-center">
                        <CardContent className="p-12">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Promotion Request Submitted!</h2>
                            <p className="text-gray-600 mb-8">
                                Your promotion request has been sent to the admin for approval. 
                                You'll receive a notification once it's processed.
                            </p>
                            <Button 
                                onClick={() => navigate(-1)}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                            >
                                Back to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const getTypeLabel = () => {
        switch (type) {
            case 'business': return 'Business';
            case 'agent': return 'Agent Profile';
            case 'driver': return 'Driver Profile';
            default: return 'Content';
        }
    };

    const getTypeColor = () => {
        switch (type) {
            case 'business': return 'from-amber-500 to-orange-500';
            case 'agent': return 'from-green-500 to-emerald-600';
            case 'driver': return 'from-blue-500 to-indigo-600';
            default: return 'from-purple-500 to-purple-600';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Megaphone className="w-8 h-8 text-amber-600" />
                            Promote Your {getTypeLabel()}
                        </h1>
                        <p className="text-gray-600">Boost visibility and attract more customers</p>
                    </div>
                </div>

                {/* What You're Promoting */}
                {entity && (
                    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Promoting</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getTypeColor()} flex items-center justify-center`}>
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-xl">{entity.name || user?.full_name}</p>
                                    <Badge className="mt-1">{getTypeLabel()}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Benefits */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-4">Why Promote?</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3">
                                <TrendingUp className="w-6 h-6 mt-1" />
                                <div>
                                    <p className="font-medium">Top Rankings</p>
                                    <p className="text-sm text-white/80">Appear first in search results</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Eye className="w-6 h-6 mt-1" />
                                <div>
                                    <p className="font-medium">More Visibility</p>
                                    <p className="text-sm text-white/80">Get 5x more views on average</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Users className="w-6 h-6 mt-1" />
                                <div>
                                    <p className="font-medium">More Customers</p>
                                    <p className="text-sm text-white/80">Reach thousands of users daily</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Promotion Packages */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Package</h2>
                    
                    {packages.length === 0 ? (
                        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                            <CardContent className="p-8 text-center">
                                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                <p className="text-gray-600">No promotion packages available at the moment.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packages.map((pkg, index) => (
                                <Card 
                                    key={pkg.id || index}
                                    className={`border-2 cursor-pointer transition-all hover:shadow-xl overflow-hidden ${
                                        selectedPackage === pkg.id 
                                            ? 'border-amber-500 shadow-xl bg-amber-50' 
                                            : 'border-transparent shadow-lg bg-white/90'
                                    }`}
                                    onClick={() => setSelectedPackage(pkg.id)}
                                >
                                    {index === 1 && (
                                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-1 text-sm font-medium">
                                            Most Popular
                                        </div>
                                    )}
                                    <CardHeader className="text-center pb-3">
                                        <div className="text-4xl mb-2">{pkg.emoji || '🚀'}</div>
                                        <CardTitle className="text-xl">{pkg.name}</CardTitle>
                                        <div className="flex items-baseline justify-center gap-1 mt-3">
                                            <span className="text-4xl font-bold text-gray-900">AED {pkg.price}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-1 text-gray-500 mt-2">
                                            <Clock className="w-4 h-4" />
                                            <span className="font-medium">{pkg.duration_value || 1} {pkg.duration_unit || 'day'}{(pkg.duration_value || 1) > 1 ? 's' : ''}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-4">
                                        {/* What it does */}
                                        {(pkg.what_it_does || pkg.includes || pkg.features || []).length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">What it does:</p>
                                                <ul className="space-y-1.5">
                                                    {(pkg.what_it_does || pkg.includes || pkg.features || []).map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm">
                                                            <span className="text-purple-500 mt-0.5">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        <div className="pt-4">
                                            <Button 
                                                className={`w-full ${
                                                    selectedPackage === pkg.id
                                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                                variant={selectedPackage === pkg.id ? 'default' : 'outline'}
                                            >
                                                {selectedPackage === pkg.id ? 'Selected ✓' : 'Select Package'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Submit */}
                {packages.length > 0 && (
                    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <p className="text-gray-600">
                                        {selectedPackage ? (
                                            <>
                                                Selected: <strong>{packages.find(p => p.id === selectedPackage)?.name}</strong>
                                                {' - '}
                                                <strong>AED {packages.find(p => p.id === selectedPackage)?.price}</strong>
                                            </>
                                        ) : (
                                            'Select a package to continue'
                                        )}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!selectedPackage || isSubmitting}
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-8"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Request Promotion
                                        </>
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                Your request will be reviewed by admin. Payment details will be shared upon approval.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
