import React, { useState, useEffect } from "react";
import { AppSettings } from "@/entities/AppSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, CreditCard, Megaphone, Phone, Settings, Shield, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";

export default function AdminAppSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const allSettings = await AppSettings.list();
      if (allSettings.length > 0) {
        // Ensure all expected fields have default values
        const existingSettings = allSettings[0];
        setSettings({
          subscription_prices: { monthly: 30, quarterly: 80, yearly: 300 },
          subscriptions_enabled: true,
          promotion_price: 10,
          promotion_packages: [],
          promotion_enabled: true,
          admin_whatsapp: '',
          admin_email: '',
          features_enabled: {},
          maintenance_mode: false,
          app_version: '1.0.0',
          ...existingSettings
        });
      } else {
        // Create default settings if none exist
        const newSettings = await AppSettings.create({});
        setSettings(newSettings);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };
  
  const handlePriceChange = (parent, field, value) => {
      setSettings(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [field]: parseFloat(value) || 0 }
      }));
  }

  const handlePromotionPackageChange = (index, field, value) => {
      const newPackages = [...settings.promotion_packages];
      newPackages[index] = { ...newPackages[index], [field]: value };
      setSettings(prev => ({ ...prev, promotion_packages: newPackages }));
  }

  const addPromotionPackage = () => {
      const newPackage = {
          id: `promo_${Date.now()}`,
          name: "New Package",
          price: 10,
          duration_days: 7,
          features: ["Feature 1"],
          description: "Package description"
      };
      setSettings(prev => ({
          ...prev,
          promotion_packages: [...(prev.promotion_packages || []), newPackage]
      }));
  };

  const removePromotionPackage = (index) => {
      const newPackages = settings.promotion_packages.filter((_, i) => i !== index);
      setSettings(prev => ({ ...prev, promotion_packages: newPackages }));
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await AppSettings.update(settings.id, settings);
      alert("✅ Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings", error);
      alert("❌ Failed to save settings. Please try again.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-gray-100 rounded-xl">
                <Settings className="w-6 h-6 text-gray-700" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-gray-900">App Settings</h1>
                <p className="text-gray-500 text-sm">Configure global application parameters</p>
             </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px] shadow-lg shadow-emerald-200"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] bg-white p-1 rounded-xl shadow-sm border border-gray-100 h-12">
            <TabsTrigger value="subscriptions" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 font-medium">Subscriptions</TabsTrigger>
            <TabsTrigger value="promotions" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 font-medium">Promotions</TabsTrigger>
            <TabsTrigger value="contact" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 font-medium">Contact</TabsTrigger>
            <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 font-medium">General</TabsTrigger>
          </TabsList>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6 mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-bold uppercase text-xs tracking-wider">Monetization</span>
                </div>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>Manage pricing for user role subscriptions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-emerald-900">Enable Subscriptions</Label>
                    <p className="text-sm text-emerald-700">Require payment for professional roles (Vendor, Agent, Driver)</p>
                  </div>
                  <Switch 
                    checked={settings.subscriptions_enabled}
                    onCheckedChange={(checked) => handleInputChange("subscriptions_enabled", checked)}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 p-4 border rounded-xl bg-white hover:border-emerald-200 transition-colors">
                    <Label className="text-gray-600">Monthly Price (AED)</Label>
                    <Input 
                        type="number" 
                        value={settings.subscription_prices?.monthly}
                        onChange={(e) => handlePriceChange("subscription_prices", "monthly", e.target.value)}
                        className="text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-2 p-4 border rounded-xl bg-white hover:border-emerald-200 transition-colors">
                    <Label className="text-gray-600">Quarterly Price (AED)</Label>
                    <Input 
                        type="number" 
                        value={settings.subscription_prices?.quarterly}
                        onChange={(e) => handlePriceChange("subscription_prices", "quarterly", e.target.value)}
                         className="text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-2 p-4 border rounded-xl bg-white hover:border-emerald-200 transition-colors">
                    <Label className="text-gray-600">Yearly Price (AED)</Label>
                    <Input 
                        type="number" 
                        value={settings.subscription_prices?.yearly}
                        onChange={(e) => handlePriceChange("subscription_prices", "yearly", e.target.value)}
                         className="text-lg font-bold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promotions Tab */}
          <TabsContent value="promotions" className="space-y-6 mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                         <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <Megaphone className="w-5 h-5" />
                            <span className="font-bold uppercase text-xs tracking-wider">Marketing</span>
                        </div>
                        <CardTitle>Promotion Packages</CardTitle>
                        <CardDescription>Configure packages for content promotion.</CardDescription>
                    </div>
                    <Button onClick={addPromotionPackage} size="sm" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                        <Plus className="w-4 h-4 mr-2" /> Add Package
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-purple-900">Enable Promotions</Label>
                    <p className="text-sm text-purple-700">Allow users to pay to feature their content</p>
                  </div>
                  <Switch 
                    checked={settings.promotion_enabled}
                    onCheckedChange={(checked) => handleInputChange("promotion_enabled", checked)}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>

                <div className="grid gap-6">
                    {settings.promotion_packages?.map((pkg, index) => (
                        <div key={pkg.id} className="border rounded-xl p-6 bg-white space-y-4 relative group">
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removePromotionPackage(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Package Name</Label>
                                    <Input 
                                        value={pkg.name} 
                                        onChange={(e) => handlePromotionPackageChange(index, 'name', e.target.value)}
                                        className="font-semibold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Price (AED)</Label>
                                        <Input 
                                            type="number" 
                                            value={pkg.price} 
                                            onChange={(e) => handlePromotionPackageChange(index, 'price', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Duration (Days)</Label>
                                        <Input 
                                            type="number" 
                                            value={pkg.duration_days} 
                                            onChange={(e) => handlePromotionPackageChange(index, 'duration_days', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input 
                                    value={pkg.description} 
                                    onChange={(e) => handlePromotionPackageChange(index, 'description', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6 mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Phone className="w-5 h-5" />
                    <span className="font-bold uppercase text-xs tracking-wider">Support</span>
                </div>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Set up administrative contact details for user support.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Admin WhatsApp Number</Label>
                    <div className="flex items-center gap-2">
                        <Input 
                            value={settings.admin_whatsapp}
                            onChange={(e) => handleInputChange("admin_whatsapp", e.target.value)}
                            placeholder="+971501234567"
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                        Used for direct support links and automated message redirection (e.g., subscription confirmation).
                        Format: +971...
                    </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6 mt-6">
             <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                 <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-bold uppercase text-xs tracking-wider">System</span>
                </div>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Maintenance and version control.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-gray-900">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Disable app access for non-admins</p>
                  </div>
                  <Switch 
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => handleInputChange("maintenance_mode", checked)}
                  />
                </div>
                
                 <div className="space-y-2">
                    <Label>App Version</Label>
                    <Input 
                        value={settings.app_version}
                        onChange={(e) => handleInputChange("app_version", e.target.value)}
                    />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}