
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/entities/User";
import { Notification } from "@/entities/Notification";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Bell,
  Store,
  DollarSign,
  LogOut,
  ChevronRight,
  Loader2,
  Settings,
  Shield,
  Car,
  BadgeCheck,
  Banknote,
  Edit,
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ProfileMenuItem component definition based on the outline's implied usage
const ProfileMenuItem = ({ icon: Icon, text, href, badgeCount }) => (
  <Link to={href} className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-gray-600" />
      <span>{text}</span>
      {badgeCount > 0 && (
        <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-red-100 bg-red-600 rounded-full">
          {badgeCount}
        </span>
      )}
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </Link>
);

const KycSection = ({ user, onUpdate }) => {
    const [selectedDocType, setSelectedDocType] = useState('passport');
    const [kycFile, setKycFile] = useState(null);
    const [isUploadingKyc, setIsUploadingKyc] = useState(false);
    const [error, setError] = useState(null);
    const { updateProfile } = useAuth();

    const handleFileChange = (file) => {
        setKycFile(file);
        setError(null);
    };

    const handleSubmitKyc = async () => {
        if (!kycFile) {
            setError("Please select a document to upload.");
            return;
        }
        
        setIsUploadingKyc(true);
        setError(null);

        try {
            const { file_url } = await UploadFile({ file: kycFile });
            const uploadedDocument = {
                type: selectedDocType,
                url: file_url,
                name: kycFile.name,
                uploaded_at: new Date().toISOString()
            };

            // Append new document to existing ones
            // Handle case where kyc_documents might be {} (object) instead of [] (array)
            const existingDocs = Array.isArray(user.kyc_documents) ? user.kyc_documents : [];
            const newDocs = [...existingDocs, uploadedDocument];
            await updateProfile({ 
                kyc_documents: newDocs, 
                kyc_status: 'pending' 
            });

            alert("KYC document submitted successfully! An admin will review it shortly.");
            setKycFile(null);
            onUpdate(); // Reload user data
        } catch (err) {
            console.error("KYC Upload Error:", err);
            setError("Failed to upload document. Please try again.");
        }
        setIsUploadingKyc(false);
    };

    const renderStatusBadge = () => {
        switch (user.kyc_status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-700 border-green-200"><FileCheck2 className="w-4 h-4 mr-2" />Approved</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-700"><Clock className="w-4 h-4 mr-2" />Pending Review</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><AlertTriangle className="w-4 h-4 mr-2" />Rejected</Badge>;
            default:
                return <Badge variant="secondary">Not Submitted</Badge>;
        }
    };
    
    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>KYC Verification</span>
                    {renderStatusBadge()}
                </CardTitle>
                <CardDescription>
                    {user.kyc_status === 'approved' 
                        ? "Your identity has been successfully verified."
                        : "Verify your identity to access all features."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {user.kyc_status !== 'approved' && (
                    <div className="space-y-4">
                        {user.kyc_status === 'rejected' && <p className="text-red-600 text-sm">Your previous submission was rejected. Please re-upload your document.</p>}
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-blue-800 text-sm font-medium">Choose one document type to verify your identity:</p>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium">Document Type</label>
                            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="passport">Passport</SelectItem>
                                    <SelectItem value="emirates_id">Emirates ID</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium">
                                Upload {selectedDocType === 'passport' ? 'Passport' : 'Emirates ID'}
                            </label>
                            <Input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileChange(e.target.files[0])} 
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF (max 5MB)</p>
                        </div>
                        
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        
                        <Button onClick={handleSubmitKyc} disabled={isUploadingKyc || !kycFile} className="w-full">
                            {isUploadingKyc ? <Loader2 className="animate-spin mr-2" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                            Submit for Verification
                        </Button>
                    </div>
                )}
                {user.kyc_documents?.length > 0 && (
                     <div className="mt-4">
                        <h4 className="font-medium mb-2">Submitted Documents:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                           {user.kyc_documents.map((doc, i) => (
                               <li key={i}><a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline capitalize">{doc.type.replace('_', ' ')}</a></li>
                           ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setIsLoading(false);
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      await User.update(user.id, { profile_image: file_url });
      await loadUser(); // Reload user to reflect new image
    } catch (error) {
      console.error("Failed to upload profile image:", error);
    }
    setIsUploading(false);
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.href = createPageUrl("Welcome");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!user) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>User not found. Please log in.</p>
        </div>
    )
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  const getDisplayName = (user) => {
    if (user.first_name) return user.first_name;
    if (user.username) return user.username;
    return user.full_name?.split(' ')[0] || 'User';
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      customer: "Customer",
      vendor: "Vendor",
      agent: "Money Agent",
      driver: "Driver",
      admin: "Administrator"
    };
    return roleNames[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center pt-8">
          <div className="relative mx-auto w-fit"> {/* Centering the avatar and edit button */}
            <Avatar className="w-24 h-24 mb-2 border-4 border-white shadow-lg">
              <AvatarImage src={user.profile_image} alt={user.full_name} />
              <AvatarFallback className="text-3xl bg-red-500 text-white">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleProfileImageUpload}
              accept="image/*"
            />
            <Button
              size="icon"
              className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white"
              variant="outline"
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Edit className="w-4 h-4 text-gray-600" />}
            </Button>
          </div>
          <CardTitle className="text-2xl mt-2">{getDisplayName(user)}</CardTitle>
          <CardDescription className="text-gray-600">{user.email}</CardDescription>

          <div className="mt-4 space-y-2">
            {user.app_role && (
                <div className="flex items-center justify-center">
                    <Badge
                        variant="outline"
                        className={`capitalize text-sm font-medium ${
                            user.app_role === 'agent'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : user.app_role === 'vendor'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : user.app_role === 'driver'
                                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                    >
                        {getRoleDisplayName(user.app_role)}
                    </Badge>
                </div>
            )}
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-400 opacity-50">
                <DollarSign className="w-5 h-5 text-gray-400" /> Coming Soon
            </div>
            {user.app_role === 'agent' && (
                <div className="mt-2">
                    <Link to={createPageUrl("MoneyAgentDashboard")}>
                        <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50">
                            <Banknote className="w-4 h-4 mr-2" />
                            Manage Agent Profile
                        </Button>
                    </Link>
                </div>
            )}
          </div>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 space-y-2">
            <ProfileMenuItem icon={UserIcon} text="Edit Personal Info" href="/profile/edit" />
            {user.app_role !== 'customer' && (
              <ProfileMenuItem icon={BadgeCheck} text="Manage Subscription" href={createPageUrl("Subscribe")} />
            )}
            <ProfileMenuItem icon={Settings} text="Settings" href="/profile/settings" />
            <ProfileMenuItem icon={Bell} text="Notifications" href={createPageUrl("Notifications")} badgeCount={0} />
          </CardContent>
        </Card>
        
        {/* KYC Section for professional roles */}
        {['vendor', 'agent', 'driver'].includes(user.app_role) && (
            <KycSection user={user} onUpdate={loadUser} />
        )}

        {user.app_role === 'admin' && ( // Keep admin dashboard if user has 'admin' role
          <Link to={createPageUrl("AdminDashboard")}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-gray-50 cursor-pointer transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-red-600" /> {/* Using Shield as a general admin icon */}
                    <div>
                      <CardTitle className="text-lg">Admin Dashboard</CardTitle>
                      <CardDescription>Manage users, content, and settings</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {user.app_role === "vendor" && (
          <Link to={createPageUrl("VendorDashboard")}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Store className="w-6 h-6 text-purple-600" />
                    <div>
                      <CardTitle className="text-lg">Vendor Dashboard</CardTitle>
                      <CardDescription>View analytics and manage your business</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
        {user.app_role === "agent" && (
          <Link to={createPageUrl("MoneyAgentDashboard")}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-green-600" />
                    <div>
                      <CardTitle className="text-lg">Money Agent Dashboard</CardTitle>
                      <CardDescription>Manage transactions and agent activities</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
        {user.app_role === "driver" && (
          <Link to={createPageUrl("DriverDashboard")}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Car className="w-6 h-6 text-orange-600" />
                    <div>
                      <CardTitle className="text-lg">Driver Dashboard</CardTitle>
                      <CardDescription>Manage vehicle and ride services</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}
