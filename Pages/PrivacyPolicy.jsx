import React, { useState, useEffect } from 'react';
import { SiteContent } from '@/entities/SiteContent';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const siteContents = await SiteContent.filter({ slug: 'privacy-policy' });
      if (siteContents.length > 0) {
        setContent(siteContents[0].content);
      } else {
        setContent("<h1>Privacy Policy</h1><p>Content not available yet. Please check back later.</p>");
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      setContent("<h1>Error</h1><p>Failed to load content.</p>");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Profile")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4 prose max-w-none">
           {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>
      </div>
    </div>
  );
}