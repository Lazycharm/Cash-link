import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Job } from "@/entities/Job";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase,
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function JobDetail() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('id');
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    try {
      const jobs = await Job.list();
      const foundJob = jobs.find(j => j.id === jobId);
      setJob(foundJob);
    } catch (error) {
      console.error("Error loading job:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
        <div className="max-w-4xl mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <Link to={createPageUrl("Jobs")}>
            <Button>Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Jobs")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
        </div>

        {/* Main Info */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
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
                <CardTitle className="text-2xl text-gray-900 mb-3">{job.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{job.location?.city}, {job.location?.emirate}</span>
                  </div>
                  {job.salary_range && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-green-600">{job.salary_range}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Posted {new Date(job.created_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={categoryColors[job.category] || categoryColors.other}>
                    {job.category.replace('_', ' ')}
                  </Badge>
                  {job.job_type && (
                    <Badge className={typeColors[job.job_type] || typeColors.full_time}>
                      {job.job_type.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Job Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-600">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Apply Now</h3>
              <div className="flex gap-3">
                {job.contact?.phone && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(`tel:${job.contact.phone}`, '_self')}
                    className="border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    Call Now
                  </Button>
                )}
                {(job.contact?.whatsapp || job.contact?.email) && (
                  <Button 
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
                    Apply via {job.contact.whatsapp ? 'WhatsApp' : 'Email'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}