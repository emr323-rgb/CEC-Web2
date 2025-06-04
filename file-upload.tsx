import React, { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Progress } from './progress';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Image, Video, FileIcon } from 'lucide-react';

export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onUpload?: (file: File) => void;
  onComplete?: (url: string) => void;
  maxFiles?: number;
  uploadType?: 'image' | 'video' | 'any';
  className?: string;
}

export function FileUpload({
  accept,
  maxSize = 10,
  onUpload = () => {},
  onComplete,
  maxFiles = 1,
  uploadType = 'any',
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Determine accept types based on uploadType
  const acceptTypes = accept || 
    (uploadType === 'image' 
      ? 'image/*' 
      : uploadType === 'video' 
        ? 'video/*' 
        : 'image/*,video/*');

  const validateFile = (file: File): boolean => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${maxSize}MB`,
        variant: 'destructive',
      });
      return false;
    }

    // Validate file type based on uploadType
    if (uploadType === 'image' && !file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Only image files are allowed',
        variant: 'destructive',
      });
      return false;
    }

    if (uploadType === 'video' && !file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Only video files are allowed',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const selectedFiles = Array.from(e.target.files);
    
    // Check if the total number of files exceeds the limit
    const totalFiles = files.length + selectedFiles.length;
    if (totalFiles > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum of ${maxFiles} files allowed`,
        variant: 'destructive',
      });
      return;
    }
    
    // Validate each file
    const validFiles = selectedFiles.filter(validateFile);
    
    setFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (!e.dataTransfer.files?.length) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    // Check if the total number of files exceeds the limit
    const totalFiles = files.length + droppedFiles.length;
    if (totalFiles > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum of ${maxFiles} files allowed`,
        variant: 'destructive',
      });
      return;
    }
    
    // Validate each file
    const validFiles = droppedFiles.filter(validateFile);
    
    setFiles(prevFiles => [...prevFiles, ...validFiles]);
  }, [files, maxFiles, toast, validateFile]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      for (const file of files) {
        onUpload(file);
        
        // Create form data for the upload
        const formData = new FormData();
        
        if (uploadType === 'video') {
          formData.append('video', file);
          
          // Upload the file - set progress to 30%
          setProgress(30);
          
          try {
            const response = await fetch('/api/file/upload-video', {
              method: 'POST',
              body: formData,
              credentials: 'include',
            });
            
            // Set progress to 70%
            setProgress(70);
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to upload file');
            }
            
            const data = await response.json();
            console.log('Upload response:', data);
            
            // Set progress to 100%
            setProgress(100);
            
            if (onComplete && data.file && data.file.path) {
              onComplete(data.file.path);
            }
          } catch (error) {
            console.error('Upload error:', error);
            toast({
              title: 'Upload failed',
              description: error instanceof Error ? error.message : 'Unknown error occurred',
              variant: 'destructive',
            });
            setUploading(false);
            return;
          }
        } else if (file.type.startsWith('image/')) {
          // For image uploads
          formData.append('image', file);
          
          // Set progress to 30%
          setProgress(30);
          
          try {
            // Try the staff-image endpoint first for better reliability with large images
            console.log('Attempting to use specialized staff-image endpoint');
            const response = await fetch('/api/staff-image/upload', {
              method: 'POST',
              body: formData,
              credentials: 'include',
            });
            
            // Set progress to 70%
            setProgress(70);
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to upload image');
            }
            
            const data = await response.json();
            console.log('Image upload response:', data);
            
            // Set progress to 100%
            setProgress(100);
            
            if (onComplete && data.file && data.file.path) {
              onComplete(data.file.path);
            }
          } catch (error) {
            console.error('Image upload error:', error);
            toast({
              title: 'Image upload failed',
              description: error instanceof Error ? error.message : 'Unknown error occurred',
              variant: 'destructive',
            });
            setUploading(false);
            return;
          }
        } else {
          // For any other file types
          formData.append('file', file);
          
          // Simulate progress for non-image, non-video files
          for (let i = 0; i <= 100; i += 20) {
            setProgress(i);
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // Create a temporary URL (this is not persistent)
          const tempUrl = URL.createObjectURL(file);
          if (onComplete) {
            onComplete(tempUrl);
          }
        }
      }
      
      toast({
        title: 'Upload complete',
        description: `Successfully uploaded ${files.length} file(s)`,
      });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setFiles([]);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-5 w-5" />;
    } else {
      return <FileIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer ${
          dragging ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptTypes}
          onChange={handleFileChange}
          multiple={maxFiles > 1}
          disabled={uploading}
        />
        <div className="flex flex-col items-center justify-center py-4">
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-600">
            Drag & drop files here, or click to browse
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {uploadType === 'image' 
              ? 'Supported formats: JPG, PNG, GIF' 
              : uploadType === 'video' 
                ? 'Supported formats: MP4, WebM, MOV' 
                : 'Supported formats: Images and Videos'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Maximum file size: {maxSize}MB
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="font-medium text-sm mb-2">Selected files:</p>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-2 truncate max-w-[70%]">
                    {getFileIcon(file)}
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 text-center">
            Uploading... {progress}%
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload {files.length > 0 ? `(${files.length})` : ''}
        </Button>
      </div>
    </div>
  );
}