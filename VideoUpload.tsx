import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';

interface VideoUploadProps {
  section: string;
  contentKey: string;
  onSuccess?: () => void;
  title?: string;
  content?: string;
}

export function VideoUpload({ section, contentKey, onSuccess, title, content }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('Starting video upload...');
      // Log keys in a better way to avoid TypeScript iterator issues
      const formDataKeys: string[] = [];
      // Using typed callback to satisfy TypeScript
      formData.forEach((value: FormDataEntryValue, key: string) => {
        formDataKeys.push(key);
      });
      console.log('Form data keys:', formDataKeys);
      
      // Get the video file
      const videoFile = formData.get('video') as File;
      if (!videoFile || !(videoFile instanceof File)) {
        throw new Error("No valid video file provided");
      }
      
      console.log('Video file size:', videoFile.size);
      
      try {
        // Show upload starting
        setUploadProgress(1);
        
        // Use XMLHttpRequest to track upload progress
        const response = await new Promise<Response>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          // Set up progress tracking
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              console.log(`Upload progress: ${percentComplete}%`);
              setUploadProgress(percentComplete);
            }
          };
          
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              // Create a Response object to match fetch API
              const response = new Response(xhr.responseText, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: new Headers({
                  'Content-Type': xhr.getResponseHeader('Content-Type') || 'application/json'
                })
              });
              resolve(response);
            } else {
              try {
                // Try to parse the error response
                const errorData = JSON.parse(xhr.responseText);
                reject(new Error(errorData.message || errorData.error || `Upload failed with status ${xhr.status}: ${xhr.statusText}`));
              } catch (e) {
                reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
              }
            }
          };
          
          xhr.onerror = () => {
            reject(new Error('Network error during upload. Please check your connection and try again.'));
          };
          
          xhr.ontimeout = () => {
            reject(new Error('The upload request timed out. Please try again with a smaller file or check your connection.'));
          };
          
          xhr.onabort = () => {
            reject(new Error('The upload was aborted.'));
          };
          
          // Set longer timeout for large uploads
          xhr.timeout = 600000; // 10 minutes (in milliseconds)
          
          // Use different endpoint based on file size
          const useStreamUpload = videoFile.size > 30 * 1024 * 1024; // 30MB threshold
          const uploadEndpoint = useStreamUpload 
            ? '/api/center/large-video-upload' 
            : '/api/center/video-upload';
            
          console.log(`Using ${useStreamUpload ? 'streaming' : 'standard'} upload endpoint: ${uploadEndpoint}`);
          
          xhr.open('POST', uploadEndpoint);
          xhr.send(formData);
        });
        
        console.log('Upload response status:', response.status);
        setUploadProgress(100); // Upload complete
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload error response:', errorText);
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.message || 'Failed to upload video');
          } catch (e) {
            throw new Error(errorText || 'Failed to upload video');
          }
        }
        
        const responseData = await response.json();
        console.log('Upload success response:', responseData);
        return responseData;
      } catch (error) {
        console.error('Video upload error:', error);
        setUploadProgress(0); // Reset progress on error
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Video uploaded successfully',
        description: 'Your video has been uploaded and saved.',
        variant: 'default',
      });
      setSelectedFile(null);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: [`/api/center/content/${contentKey}`] });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Video upload failed',
        description: error.message || 'There was an error uploading your video.',
        variant: 'destructive',
      });
      setUploadProgress(0);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a video file to upload.',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (limit to 200MB)
    const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB in bytes
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'The selected file exceeds the maximum size limit of 200MB.',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a valid video file (MP4, WebM, or Ogg).',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('section', section);
    formData.append('key', contentKey);
    
    if (title) formData.append('title', title);
    if (content) formData.append('content', content);

    mutation.mutate(formData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Upload Video</h3>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="video">Select Video File</Label>
          <Input
            id="video"
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            onChange={handleFileChange}
            disabled={mutation.isPending}
            className="cursor-pointer"
          />
          {selectedFile && (
            <p className="text-sm text-gray-500">
              Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        {uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {uploadProgress < 100 
                  ? `Uploading: ${uploadProgress}%` 
                  : "Upload complete! Processing..."
                }
              </span>
              <span className="text-xs text-gray-500">
                {uploadProgress < 100 ? `${uploadProgress}/100` : "Done"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border border-gray-300">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  uploadProgress < 100 ? "bg-blue-500" : "bg-green-500"
                }`}
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!selectedFile || mutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : mutation.isSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Uploaded
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
              </>
            )}
          </Button>
        </div>
      </form>
      
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Supported formats: MP4, WebM, Ogg. Maximum file size: 200MB. <br />
          <span className="text-xs">For large files, please be patient during upload and avoid refreshing the page.</span>
        </p>
      </div>
    </div>
  );
}