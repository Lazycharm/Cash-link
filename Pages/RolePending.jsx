import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MessageSquare, LogOut, FileText, CheckCircle } from 'lucide-react';
import { User } from '@/entities/User';
import { AppSettings } from '@/entities/AppSettings';

export default function RolePending() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [whatsappLink, setWhatsappLink] = React.useState('');

  React.useEffect(() => {
    // Redirect if KYC is approved
    if (profile?.kyc_status === 'approved') {
      const dashboardRoutes = {
        vendor: '/vendor-dashboard',
        agent: '/agent-dashboard',
        driver: '/driver-dashboard'
      };
      navigate(dashboardRoutes[profile.role] || '/', { replace: true });
    }
  }, [profile, navigate]);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await AppSettings.list();
        if (settings.length > 0 && settings[0].admin_whatsapp) {
          const whatsappNumber = settings[0].admin_whatsapp.replace(/\D/g, '');
          const message = encodeURIComponent("Hello CashLink Support, I'm checking on my KYC verification status.");
          setWhatsappLink(`https://wa.me/${whatsappNumber}?text=${message}`);
        }
      } catch (error) {
        console.error("Could not load app settings for WhatsApp link", error);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const roleLabels = {
    vendor: 'Business Owner',
    agent: 'Money Agent',
    driver: 'Driver'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">KYC Verification Pending</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile?.role && profile.role !== 'customer' && (
            <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-2 px-4 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Role Approved: {roleLabels[profile.role] || profile.role}</span>
            </div>
          )}
          
          <p className="text-gray-600 text-lg">
            Your KYC documents are under review by our verification team.
          </p>
          <p className="text-gray-600">
            You will receive a notification as soon as your documents are verified. This usually takes less than 24 hours.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-left">
            <h4 className="font-semibold text-blue-800 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents Submitted
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              {profile?.kyc_documents?.length > 0 
                ? `${profile.kyc_documents.length} document(s) submitted for verification.`
                : 'No documents submitted yet. Please go to your profile to submit KYC documents.'
              }
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button className="w-full" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" /> Contact Support
                </Button>
              </a>
            )}
            <Button onClick={handleLogout} className="w-full" variant="secondary">
              <LogOut className="w-4 h-4 mr-2" /> Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}