import React, { useState, useEffect } from "react";
import { SiteContent } from "@/entities/SiteContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Save, ArrowLeft, Plus, Trash2, Edit, MapPin, ExternalLink, FileText, Calculator, Building, AlertTriangle, Scale, Shield, Phone, Mail, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Icon mapping for tools - mapping string names to actual icon components
const iconComponents = {
  FileText,
  Calculator,
  Building,
  AlertTriangle,
  Scale,
  Shield,
  Phone,
  Mail,
  Globe,
  MapPin,
};

export default function AdminUAEHelpCenter() {
  const [tools, setTools] = useState([]);
  const [directories, setDirectories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [editingDirectory, setEditingDirectory] = useState(null);
  const [showToolDialog, setShowToolDialog] = useState(false);
  const [showDirectoryDialog, setShowDirectoryDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const helpCenterData = await SiteContent.getByKey('uae-help-center');
      
      if (helpCenterData && helpCenterData.content) {
        const data = JSON.parse(helpCenterData.content);
        setTools(data.tools || []);
        setDirectories(data.directories || []);
      } else {
        // Default data
        const defaultTools = [
          {
            icon: 'FileText',
            title: "Visa Status Check",
            description: "Check the validity of your residence or visit visa via ICP.",
            link: "https://smartservices.icp.gov.ae/",
            external: true
          },
          {
            icon: 'Calculator',
            title: "Overstay Fine Calculator",
            description: "Estimate fines for visa overstay days.",
            link: "#calculator",
            external: false
          },
          {
            icon: 'Building',
            title: "Rent Increase Check",
            description: "Official RERA calculator for rental increases.",
            link: "https://dubailand.gov.ae/en/eservices/rental-index",
            external: true
          },
          {
            icon: 'AlertTriangle',
            title: "Lost Passport Process",
            description: "Step-by-step guide: Police report to Embassy visit.",
            link: "#lost-passport",
            external: false
          },
          {
            icon: 'Scale',
            title: "Labor Rights (MOHRE)",
            description: "File complaints for unpaid salary or arbitrary dismissal.",
            link: "https://www.mohre.gov.ae/",
            external: true
          },
          {
            icon: 'Shield',
            title: "Police Services",
            description: "Apply for Good Conduct Certificate or report lost items.",
            link: "https://www.dubaipolice.gov.ae/",
            external: true
          }
        ];
        
        const defaultDirectories = [
          { name: "Nigeria Embassy", location: "Villa 14, Jumeirah 2, Dubai", latitude: 25.2048, longitude: 55.2708 },
          { name: "Kenya Consulate", location: "Jumeirah Beach Road, Dubai", latitude: 25.2048, longitude: 55.2708 },
          { name: "Ghana Consulate", location: "Villa 56, Al Satwa", latitude: 25.2048, longitude: 55.2708 },
          { name: "Uganda Consulate", location: "Villa 23, Al Jafiliya", latitude: 25.2048, longitude: 55.2708 }
        ];
        
        setTools(defaultTools);
        setDirectories(defaultDirectories);
      }
    } catch (error) {
      console.error("Error fetching UAE Help Center data:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        tools,
        directories
      };
      
      await SiteContent.upsertByKey('uae-help-center', JSON.stringify(data), 'text');
      alert('UAE Help Center content saved successfully!');
    } catch (error) {
      console.error("Error saving UAE Help Center data:", error);
      alert('Failed to save content. Please try again.');
    }
    setIsSaving(false);
  };

  const handleAddTool = () => {
    setEditingTool({
      icon: 'FileText',
      title: '',
      description: '',
      link: '',
      external: true
    });
    setShowToolDialog(true);
  };

  const handleEditTool = (tool, index) => {
    setEditingTool({ ...tool, index });
    setShowToolDialog(true);
  };

  const handleDeleteTool = (index) => {
    if (confirm('Are you sure you want to delete this tool?')) {
      setTools(tools.filter((_, i) => i !== index));
    }
  };

  const handleSaveTool = () => {
    if (!editingTool.title || !editingTool.link) {
      alert('Please fill in title and link');
      return;
    }
    
    if (editingTool.index !== undefined) {
      // Update existing
      const newTools = [...tools];
      newTools[editingTool.index] = {
        icon: editingTool.icon,
        title: editingTool.title,
        description: editingTool.description,
        link: editingTool.link,
        external: editingTool.external
      };
      setTools(newTools);
    } else {
      // Add new
      setTools([...tools, {
        icon: editingTool.icon,
        title: editingTool.title,
        description: editingTool.description,
        link: editingTool.link,
        external: editingTool.external
      }]);
    }
    setShowToolDialog(false);
    setEditingTool(null);
  };

  const handleAddDirectory = () => {
    setEditingDirectory({
      name: '',
      location: '',
      latitude: '',
      longitude: ''
    });
    setShowDirectoryDialog(true);
  };

  const handleEditDirectory = (directory, index) => {
    setEditingDirectory({ ...directory, index });
    setShowDirectoryDialog(true);
  };

  const handleDeleteDirectory = (index) => {
    if (confirm('Are you sure you want to delete this directory?')) {
      setDirectories(directories.filter((_, i) => i !== index));
    }
  };

  const handleSaveDirectory = () => {
    if (!editingDirectory.name || !editingDirectory.location) {
      alert('Please fill in name and location');
      return;
    }
    
    const directoryData = {
      name: editingDirectory.name,
      location: editingDirectory.location,
      latitude: editingDirectory.latitude ? parseFloat(editingDirectory.latitude) : null,
      longitude: editingDirectory.longitude ? parseFloat(editingDirectory.longitude) : null
    };
    
    if (editingDirectory.index !== undefined) {
      // Update existing
      const newDirectories = [...directories];
      newDirectories[editingDirectory.index] = directoryData;
      setDirectories(newDirectories);
    } else {
      // Add new
      setDirectories([...directories, directoryData]);
    }
    setShowDirectoryDialog(false);
    setEditingDirectory(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("AdminDashboard")}>
              <Button variant="outline" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">UAE Help Center Management</h1>
              <p className="text-gray-600 mt-1">Manage tools, links, and directory locations for the UAE Help Center page.</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tools">Tools & Links</TabsTrigger>
            <TabsTrigger value="directories">Directories & Maps</TabsTrigger>
          </TabsList>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Help Tools & Links</CardTitle>
                  <CardDescription>Manage the tools and external links shown on the UAE Help Center page</CardDescription>
                </div>
                <Button onClick={handleAddTool} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tool
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tools.map((tool, index) => {
                    const IconComponent = iconComponents[tool.icon] || FileText;
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-green-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{tool.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {tool.icon}
                                </Badge>
                                <a 
                                  href={tool.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {tool.link.length > 50 ? tool.link.substring(0, 50) + '...' : tool.link}
                                </a>
                                {tool.external && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    External
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTool(tool, index)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTool(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {tools.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p>No tools added yet. Click "Add Tool" to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Directories Tab */}
          <TabsContent value="directories" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Embassies & Consulates</CardTitle>
                  <CardDescription>Manage directory locations with map coordinates</CardDescription>
                </div>
                <Button onClick={handleAddDirectory} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Directory
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {directories.map((directory, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-blue-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{directory.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{directory.location}</p>
                            {directory.latitude && directory.longitude && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>📍 {directory.latitude}, {directory.longitude}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDirectory(directory, index)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDirectory(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {directories.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p>No directories added yet. Click "Add Directory" to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tool Dialog */}
        <Dialog open={showToolDialog} onOpenChange={setShowToolDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTool?.index !== undefined ? 'Edit Tool' : 'Add New Tool'}</DialogTitle>
              <DialogDescription>Configure the tool or link that will appear on the UAE Help Center page</DialogDescription>
            </DialogHeader>
            {editingTool && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Icon Name</Label>
                  <Select 
                    value={editingTool.icon} 
                    onValueChange={(value) => setEditingTool({ ...editingTool, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(iconComponents).map(icon => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Icon name from lucide-react (e.g., FileText, Calculator)</p>
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={editingTool.title}
                    onChange={(e) => setEditingTool({ ...editingTool, title: e.target.value })}
                    placeholder="e.g., Visa Status Check"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editingTool.description}
                    onChange={(e) => setEditingTool({ ...editingTool, description: e.target.value })}
                    placeholder="Brief description of what this tool does..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link/URL *</Label>
                  <Input
                    value={editingTool.link}
                    onChange={(e) => setEditingTool({ ...editingTool, link: e.target.value })}
                    placeholder="https://example.com or #anchor"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="external"
                    checked={editingTool.external}
                    onChange={(e) => setEditingTool({ ...editingTool, external: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="external" className="cursor-pointer">External link (opens in new tab)</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowToolDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTool} className="bg-green-600 hover:bg-green-700">
                {editingTool?.index !== undefined ? 'Update' : 'Add'} Tool
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Directory Dialog */}
        <Dialog open={showDirectoryDialog} onOpenChange={setShowDirectoryDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDirectory?.index !== undefined ? 'Edit Directory' : 'Add New Directory'}</DialogTitle>
              <DialogDescription>Add embassy or consulate location with map coordinates</DialogDescription>
            </DialogHeader>
            {editingDirectory && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={editingDirectory.name}
                    onChange={(e) => setEditingDirectory({ ...editingDirectory, name: e.target.value })}
                    placeholder="e.g., Nigeria Embassy"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location/Address *</Label>
                  <Textarea
                    value={editingDirectory.location}
                    onChange={(e) => setEditingDirectory({ ...editingDirectory, location: e.target.value })}
                    placeholder="e.g., Villa 14, Jumeirah 2, Dubai"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={editingDirectory.latitude}
                      onChange={(e) => setEditingDirectory({ ...editingDirectory, latitude: e.target.value })}
                      placeholder="25.2048"
                    />
                    <p className="text-xs text-gray-500">For map integration</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={editingDirectory.longitude}
                      onChange={(e) => setEditingDirectory({ ...editingDirectory, longitude: e.target.value })}
                      placeholder="55.2708"
                    />
                    <p className="text-xs text-gray-500">For map integration</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p className="font-medium mb-1">💡 Tip:</p>
                  <p>You can find coordinates by searching the location on Google Maps and copying the lat/lng from the URL.</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDirectoryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDirectory} className="bg-green-600 hover:bg-green-700">
                {editingDirectory?.index !== undefined ? 'Update' : 'Add'} Directory
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
