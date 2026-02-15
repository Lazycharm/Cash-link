import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, BadgeCheck, ArrowRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SetupIncomplete({ user, requiredRole }) {
    const needsKyc = user.kyc_status !== 'approved';
    const needsSubscription = user.subscription_status !== 'active' || (user.subscription_expires && new Date(user.subscription_expires) <= new Date());

    if (!needsKyc && !needsSubscription) {
        return null; // Don't render if setup is complete
    }

    const KycStatus = () => {
        switch (user.kyc_status) {
            case 'pending':
                return (
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-600"/>
                        <p className="text-sm text-yellow-600">Pending Review - Your documents are being reviewed by our admin team.</p>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600"/>
                        <p className="text-sm text-red-600">Rejected - Please re-submit your documents.</p>
                    </div>
                );
            default:
                return <p className="text-sm text-gray-600">Your identity needs to be verified.</p>;
        }
    };

    const SubscriptionStatus = () => {
        if (user.subscription_status === 'expired' || (user.subscription_expires && new Date(user.subscription_expires) <= new Date())) {
            return <p className="text-sm text-gray-600">Your subscription has expired.</p>;
        }
        return <p className="text-sm text-gray-600">You do not have an active subscription.</p>;
    };

    return (
        <Card className="border-0 shadow-xl bg-orange-50 border-orange-200 mb-6">
            <CardHeader>
                <CardTitle className="text-2xl text-orange-900">Complete Your {requiredRole} Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-orange-800">To access all features of your {requiredRole} account, please complete the following steps:</p>
                <div className="space-y-4">
                    {needsKyc && (
                        <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <Shield className="w-5 h-5" />
                                    KYC Verification
                                </h4>
                                <KycStatus />
                            </div>
                            <Link to={createPageUrl("Profile")}>
                                <Button size="sm" variant="outline">
                                    {user.kyc_status === 'pending' ? 'View Status' : 'Verify Now'} 
                                    <ArrowRight className="w-4 h-4 ml-2"/>
                                </Button>
                            </Link>
                        </div>
                    )}
                    {needsSubscription && (
                        <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <BadgeCheck className="w-5 h-5" />
                                    Subscription
                                </h4>
                                <SubscriptionStatus />
                            </div>
                            <Link to={createPageUrl("Subscribe")}>
                                <Button size="sm" variant="outline">
                                    Subscribe Now <ArrowRight className="w-4 h-4 ml-2"/>
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}