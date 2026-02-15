
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Assuming react-router-dom for Link component
import { Job } from "@/entities/Job";
import { User } from "@/entities/User";
import { createPageUrl } from "@/utils"; // Correctly import the utility
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Search,
  Filter,
  ExternalLink,
  Plus,
  AlertCircle,
  CalendarPlus, // New import for "Add Event"
  ShoppingCart, // New import for "Sell Item"
  Building // New import for "Add Business"
} from "lucide-react";

const JobCard = ({ job }) => {
  const categoryColors = {
    hospitality: "bg-pink-100 text-pink-700",
    construction: "bg-orange-100 text-orange-700", 
    transport: "bg-blue-100 text-blue-700",
    domestic: "bg-green-100 text-green-700",
    sales: "bg-purple-100 text-purple-700",
    technology: "bg-indigo-100 text-indigo-700",
    healthcare: "bg-red-100 text-red-700",
    other: "bg-gray-100 text-gray-700"
  };

  const typeColors = {
    full_time: "bg-green-100 text-green-700",
    part_time: "bg-blue-100 text-blue-700",
    contract: "bg-purple-100 text-purple-700",
    temporary: "bg-amber-100 text-amber-700"
  };

  const isExpiringSoon = job.expires_at && new Date(job.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
      
      <CardHeader className="relative">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {job.is_urgent && (
                <Badge className="bg-red-500 text-white text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}
              {isExpiringSoon && (
                <Badge variant="outline" className="text-amber-600 border-amber-600 text-xs">
                  Expires Soon
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
              {job.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{job.location?.city}, {job.location?.emirate}</span>
            </div>
          </div>
          {job.salary_range && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">{job.salary_range}</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm line-clamp-3">{job.description}</p>
          
          <div className="flex flex-wrap gap-2">
            <Badge className={categoryColors[job.category] || categoryColors.other}>
              {(job.category || 'other').replace('_', ' ')}
            </Badge>
            {job.job_type && (
              <Badge className={typeColors[job.job_type] || typeColors.full_time}>
                {(job.job_type || 'other').replace('_', ' ')}
              </Badge>
            )}
          </div>
          
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {job.requirements.slice(0, 3).map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{req}</span>
                  </li>
                ))}
                {job.requirements.length > 3 && (
                  <li className="text-xs text-gray-500">+{job.requirements.length - 3} more requirements</li>
                )}
              </ul>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Posted {new Date(job.created_date).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2">
              {job.contact?.phone && (
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`tel:${job.contact.phone}`, '_self')}
                  className="border-purple-500 text-purple-600 hover:bg-purple-50"
                >
                  Call
                </Button>
              )}
              {(job.contact?.whatsapp || job.contact?.email) && (
                <Button 
                  size="sm"
                  onClick={() => {
                    if (job.contact.whatsapp) {
                      window.open(`https://wa.me/${job.contact.whatsapp.replace('+', '')}?text=Hello, I'm interested in the ${job.title} position I found on CashLink Africa`, '_blank');
                    } else if (job.contact.email) {
                      window.open(`mailto:${job.contact.email}?subject=Interest in ${job.title} position`, '_self');
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Apply
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Jobs() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, categoryFilter, locationFilter, typeFilter]);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Load approved jobs
      const allJobs = await Job.filter({ status: 'approved' });
      setJobs(allJobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
      setJobs([]);
    }
    setIsLoading(false);
  };

  const filterJobs = () => {
    let filtered = jobs;
    
    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(job => job.category === categoryFilter);
    }
    
    if (locationFilter !== 'all') {
      filtered = filtered.filter(job => job.location?.emirate === locationFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(job => job.job_type === typeFilter);
    }
    
    // Sort urgent jobs first, then by date
    filtered.sort((a, b) => {
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      return new Date(b.created_date) - new Date(a.created_date);
    });
    
    setFilteredJobs(filtered);
  };

  const categories = [
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'construction', label: 'Construction' },
    { value: 'transport', label: 'Transport' },
    { value: 'domestic', label: 'Domestic' },
    { value: 'sales', label: 'Sales' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'other', label: 'Other' }
  ];

  const jobTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'temporary', label: 'Temporary' }
  ];

  const emirates = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

  // REMOVED the incorrect local createPageUrl function.

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Briefcase className="w-10 h-10 text-purple-600" />
                Job Opportunities
              </h1>
              <p className="text-gray-600 mt-2">Find your next opportunity within the African community</p>
            </div>
            {user && (
              <Link to={createPageUrl("PostJob")}>
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Post Job
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-purple-600">{jobs.length}</p>
              <p className="text-sm text-gray-600">Total Jobs</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-red-600">{jobs.filter(j => j.is_urgent).length}</p>
              <p className="text-sm text-gray-600">Urgent</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">{jobs.filter(j => j.job_type === 'full_time').length}</p>
              <p className="text-sm text-gray-600">Full Time</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-blue-600">{jobs.filter(j => j.job_type === 'part_time').length}</p>
              <p className="text-sm text-gray-600">Part Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {jobTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {emirates.map((emirate) => (
                    <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Positions</h2>
            <Badge variant="outline" className="px-3 py-1">
              {filteredJobs.length} jobs found
            </Badge>
          </div>
          
          {filteredJobs.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or check back later</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
