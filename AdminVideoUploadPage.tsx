import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Film } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import AdminLayout from '@/layouts/AdminLayout';
import { VideoUpload } from '@/components/admin/VideoUpload';
import { VideoPlayer } from '@/components/VideoPlayer';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Define the structure for our content data
interface SiteContent {
  id?: number;
  key: string;
  section: string;
  title: string;
  content: string;
  videoUrl: string | null;
  updatedAt?: string;
}

interface AdminVideoUploadPageProps {
  section?: string;
  contentKey?: string;
}

export default function AdminVideoUploadPage({ section: propSection, contentKey: propKey }: AdminVideoUploadPageProps = {}) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [key, setKey] = useState(propKey || '');
  const [section, setSection] = useState(propSection || '');
  
  // Get video type from URL (hero, about, etc.) when props aren't provided
  const videoType = location.split('/').pop() || 'hero';
  
  // Set the appropriate key and section based on the video type or props
  useEffect(() => {
    // Only set from URL if not provided via props
    if (!propSection && !propKey) {
      if (videoType === 'hero') {
        setKey('homepage_hero_video');
        setSection('homepage');
      } else if (videoType === 'about') {
        setKey('about_video');
        setSection('about');
      }
    }
  }, [videoType, propSection, propKey]);
  
  // Fetch existing content if available
  const { data: existingContent, isLoading } = useQuery<SiteContent>({
    queryKey: [`/api/center/content/${key}`],
    enabled: !!key,
    // Extend useQuery with callbacks
    retry: false,
    refetchOnWindowFocus: false
  });
  
  // Use useEffect to handle data updates
  useEffect(() => {
    if (existingContent) {
      setTitle(existingContent.title || '');
      setContent(existingContent.content || '');
    }
  }, [existingContent]);
  
  // Mutation to create/update content
  const contentMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const response = await apiRequest(
        existingContent ? 'PUT' : 'POST',
        existingContent && existingContent.id
          ? `/api/center/content/${existingContent.id}` 
          : `/api/center/content`,
        {
          key,
          section,
          title: data.title,
          content: data.content
        }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Content saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/center/content/${key}`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to save content: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const handleSaveContent = () => {
    contentMutation.mutate({ title, content });
  };
  
  // Get the page title based on video type
  const getPageTitle = () => {
    switch (videoType) {
      case 'hero':
        return 'Homepage Hero Video';
      case 'about':
        return 'About Page Video';
      default:
        return 'Video Upload';
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
            <p className="text-gray-500">Upload and manage video content</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Content Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Video Information</CardTitle>
              <CardDescription>
                Add a title and description for the video content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for this video"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter a description or caption for this video"
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveContent} disabled={contentMutation.isPending}>
                {contentMutation.isPending ? 'Saving...' : 'Save Information'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Video Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Video Upload</CardTitle>
              <CardDescription>
                Upload a video file to be displayed in the {videoType === 'hero' ? 'homepage hero section' : 'about page'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Current video preview if it exists */}
              {existingContent && existingContent.videoUrl && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Current Video</h3>
                  <div className="overflow-hidden rounded-md border bg-black aspect-video">
                    <VideoPlayer 
                      src={existingContent.videoUrl} 
                      controls 
                      playOnScroll={true}
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Last updated: {existingContent.updatedAt ? new Date(existingContent.updatedAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              )}
              
              {/* Video upload component */}
              <VideoUpload 
                section={section}
                contentKey={key}
                title={title}
                content={content}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: [`/api/center/content/${key}`] });
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Video Guidelines Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Video Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2">Technical Requirements</h3>
                <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                  <li>Recommended resolution: 1920x1080 (16:9)</li>
                  <li>Maximum file size: 200MB</li>
                  <li>Supported formats: MP4, WebM, Ogg</li>
                  <li>Optimal length: 30-60 seconds</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Content Recommendations</h3>
                <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                  <li>Show healing, therapy, and recovery</li>
                  <li>Include diverse representation</li>
                  <li>Avoid text overlays (added separately)</li>
                  <li>Subtle movements work best</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Best Practices</h3>
                <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                  <li>Consider the mobile viewing experience</li>
                  <li>Choose videos that work well with text overlay</li>
                  <li>Select footage that conveys trust and hope</li>
                  <li>Ensure proper lighting and clarity</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}