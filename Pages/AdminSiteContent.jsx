import React, { useState, useEffect } from "react";
import { SiteContent } from "@/entities/SiteContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function AdminSiteContent() {
  const [content, setContent] = useState({
    'about-us': '',
    'privacy-policy': '',
    'agreements': ''
  });
  const [contentIds, setContentIds] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const allContent = await SiteContent.list();
      const newContent = { ...content };
      const newContentIds = { ...contentIds };
      
      allContent.forEach(item => {
        if (item.slug in newContent) {
          newContent[item.slug] = item.content;
          newContentIds[item.slug] = item.id;
        }
      });
      
      setContent(newContent);
      setContentIds(newContentIds);
    } catch (error) {
      console.error("Error fetching site content:", error);
    }
    setIsLoading(false);
  };

  const handleContentChange = (slug, value) => {
    setContent(prev => ({ ...prev, [slug]: value }));
  };

  const handleSave = async (slug) => {
    setIsSaving(true);
    try {
      const id = contentIds[slug];
      const data = { 
        slug,
        title: slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), // Auto-generate title
        content: content[slug]
      };
      if (id) {
        await SiteContent.update(id, data);
      } else {
        const newRecord = await SiteContent.create(data);
        setContentIds(prev => ({ ...prev, [slug]: newRecord.id }));
      }
      alert(`${data.title} content saved!`);
    } catch (error) {
      console.error(`Error saving ${slug}:`, error);
      alert(`Failed to save ${slug} content.`);
    }
    setIsSaving(false);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("AdminDashboard")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Site Content Management</h1>
            <p className="text-gray-600 mt-1">Edit the content of static pages like About Us.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <Tabs defaultValue="about-us" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about-us">About Us</TabsTrigger>
              <TabsTrigger value="privacy-policy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="agreements">Agreements</TabsTrigger>
            </TabsList>
            
            {Object.keys(content).map(slug => (
              <TabsContent value={slug} key={slug}>
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-4">
                    <ReactQuill 
                      theme="snow" 
                      value={content[slug]} 
                      onChange={(value) => handleContentChange(slug, value)}
                      modules={quillModules}
                      className="bg-white"
                    />
                    <div className="flex justify-end">
                      <Button onClick={() => handleSave(slug)} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save {slug.replace('-', ' ')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}