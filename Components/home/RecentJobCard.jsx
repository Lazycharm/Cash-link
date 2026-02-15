import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, DollarSign } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function RecentJobCard({ job }) {
  const typeColors = {
    full_time: "bg-green-100 text-green-700",
    part_time: "bg-blue-100 text-blue-700",
    contract: "bg-purple-100 text-purple-700",
    temporary: "bg-amber-100 text-amber-700"
  };

  return (
    <Link to={createPageUrl('Jobs')}>
      <Card className="group relative h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm flex flex-col justify-center">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-2">
            <div className="p-3 bg-purple-100 rounded-lg mt-1">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              {job.job_type && <Badge className={`text-xs mb-1 ${typeColors[job.job_type] || typeColors.full_time}`}>{job.job_type.replace('_', ' ')}</Badge>}
              <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors truncate">{job.title}</h3>
            </div>
          </div>
          <div className="space-y-1 mt-2 pl-1">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{job.location?.city}, {job.location?.emirate}</span>
            </div>
            {job.salary_range && (
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{job.salary_range}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}