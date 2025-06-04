import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, Video, Trash2, CheckCircle, Film, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Video info type definition
interface VideoInfo {
  exists: boolean;
  name?: string;
  size?: number;
  path?: string;
  lastModified?: string;
}

// Maximum file size for video uploads (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export function VideoManager() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Fetch current video information
  const { data: videoInfo, isLoading: isLoadingInfo } = useQuery<VideoInfo>({
    queryKey: ['/api/video-settings'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/video-settings');
      const data = await res.json();
      return data as VideoInfo;
    }
  });

  // Upload video mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      
      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to upload video');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Video uploaded successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/video-settings'] });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete video mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/api/delete-video');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/video-settings'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete video',
        variant: 'destructive',
      });
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file is a video
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'Invalid file',
          description: 'Please select a video file',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: 'Video size must be less than 100MB',
          variant: 'destructive',
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  // Handle upload button click
  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  // Handle delete button click
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete the current video?')) {
      deleteMutation.mutate();
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" /> 
            Hero Video Manager
          </CardTitle>
          <CardDescription>
            Upload and manage the therapy video displayed on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInfo ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {videoInfo?.exists ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="border rounded-lg overflow-hidden">
                      <video
                        src={videoInfo.path}
                        controls
                        className="w-full aspect-video object-cover"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-md">
                      <div className="space-y-1">
                        <p className="font-semibold">Filename:</p>
                        <p>{videoInfo.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold">Size:</p>
                        <p>{videoInfo.size ? formatFileSize(videoInfo.size) : 'Unknown'}</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <p className="font-semibold">Last modified:</p>
                        <p>{videoInfo.lastModified ? formatDistanceToNow(new Date(videoInfo.lastModified), { addSuffix: true }) : 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <AlertTitle>Video is active on the homepage</AlertTitle>
                    <AlertDescription>
                      This video is currently being displayed in the hero section of the homepage.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-between items-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/video-settings'] })}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete Video
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border border-dashed rounded-lg p-10 flex flex-col items-center justify-center bg-muted/20">
                    <Video className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg">No video uploaded</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1 mb-4 max-w-md">
                      Upload a video file to display on the homepage hero section.
                      The video will automatically play and fill the hero section.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-medium mb-4">
                  {videoInfo?.exists ? 'Replace Video' : 'Upload New Video'}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-upload">Select video file</Label>
                    <Input
                      id="video-upload"
                      type="file"
                      ref={fileInputRef}
                      accept="video/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">
                      Accepted formats: MP4, WebM, MOV (max size: 100MB)
                    </p>
                  </div>
                  
                  {selectedFile && (
                    <div className="bg-muted/50 p-3 rounded-md text-sm">
                      <p><span className="font-semibold">Selected:</span> {selectedFile.name}</p>
                      <p><span className="font-semibold">Size:</span> {formatFileSize(selectedFile.size)}</p>
                      <p><span className="font-semibold">Type:</span> {selectedFile.type}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-6">
          <div className="text-sm text-muted-foreground">
            {selectedFile ? 'Ready to upload' : 'No file selected'}
          </div>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="flex items-center gap-2"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {videoInfo?.exists ? 'Replace Video' : 'Upload Video'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}