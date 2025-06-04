import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LargeVideoUploadTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Log file info
      console.log('Selected file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (250MB limit)
    const maxSize = 250 * 1024 * 1024; // 250MB in bytes
    if (selectedFile.size > maxSize) {
      toast({
        title: "Error",
        description: `File size exceeds 250MB limit. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB`,
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('section', 'homepage');
      formData.append('key', 'test_large_video');
      formData.append('title', 'Test Large Video Upload');
      formData.append('content', 'This is a test of the large video upload functionality');
      
      console.log("Starting large video upload...");
      console.log("Form data keys:", Array.from(formData.keys()));
      console.log("Video file size:", selectedFile.size);
      
      // Use XMLHttpRequest for upload progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          console.log(`Upload progress: ${percentComplete}%`);
          setProgress(percentComplete);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log("Upload complete! Server response:", xhr.responseText);
          setUploading(false);
          toast({
            title: "Success",
            description: "Video uploaded successfully",
          });
          
          // Reset form
          setSelectedFile(null);
          setProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          console.error("Video upload error:", xhr.responseText);
          setUploading(false);
          
          // Try to parse error message from response
          let errorMessage = "Failed to upload video";
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error || errorResponse.message || errorMessage;
            if (errorResponse.details) {
              errorMessage += `: ${errorResponse.details}`;
            }
          } catch (e) {
            // If can't parse, use generic message
            errorMessage = `Server responded with status ${xhr.status}: ${xhr.statusText}`;
          }
          
          toast({
            title: "Upload Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      });
      
      xhr.addEventListener('error', () => {
        console.error("Video upload error:", xhr.responseText);
        setUploading(false);
        toast({
          title: "Network Error",
          description: "Connection error occurred during upload. This could be due to network issues or the server timing out.",
          variant: "destructive",
        });
      });
      
      xhr.addEventListener('abort', () => {
        console.log("Upload aborted");
        setUploading(false);
        toast({
          title: "Upload Cancelled",
          description: "Video upload was cancelled",
          variant: "destructive",
        });
      });
      
      // Set timeout for large uploads (10 minutes)
      xhr.timeout = 600000; // 10 minutes in milliseconds
      xhr.addEventListener('timeout', () => {
        console.error("Upload timed out after 10 minutes");
        setUploading(false);
        toast({
          title: "Upload Timeout",
          description: "The upload took too long and timed out after 10 minutes.",
          variant: "destructive",
        });
      });
      
      // Use the dedicated large video upload endpoint
      xhr.open('POST', '/api/center/large-video-upload');
      xhr.send(formData);
    } catch (error) {
      console.error("Video upload error:", error);
      setUploading(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Large Video Upload Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-300 p-4 rounded text-amber-800 text-sm">
              <p className="font-medium mb-2">This is a specialized test page for large video uploads</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Uses a dedicated endpoint with streaming upload capabilities</li>
                <li>Optimized for files 30MB-250MB in size</li>
                <li>Extended timeout (10 minutes)</li>
                <li>Detailed error reporting and progress tracking</li>
                <li>Designed for extremely large files (like promotional videos)</li>
              </ul>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="video" className="block text-sm font-medium">
                  Select Video File (max 250MB)
                </label>
                <Input
                  id="video"
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500">
                    Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {progress < 100 
                        ? `Uploading: ${progress}%` 
                        : "Upload complete! Processing..."
                      }
                    </span>
                    <span className="text-xs text-gray-500">
                      {progress < 100 ? `${progress}/100` : "Done"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border border-gray-300">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        progress < 100 ? "bg-blue-500" : "bg-green-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Start Upload"
                  )}
                </Button>
              </div>
            </form>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Technical Information</h3>
              <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                <li>Endpoint: /api/center/large-video-upload</li>
                <li>Method: POST</li>
                <li>Content-Type: multipart/form-data</li>
                <li>Backend: Node.js with multer for streaming uploads</li>
                <li>Timeout: 10 minutes (600,000ms)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}