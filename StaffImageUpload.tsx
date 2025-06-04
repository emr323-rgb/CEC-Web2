import { useState, useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StaffImageUploadProps {
  currentImageUrl: string | null;
  onImageUploaded: (imageUrl: string) => void;
}

export default function StaffImageUpload({ currentImageUrl, onImageUploaded }: StaffImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(currentImageUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Auto-upload when file is selected
      uploadFile(file);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    console.log("Handling file upload with staff-image endpoint:", file.name);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Log the request being sent
      console.log("Sending staff image upload to /api/staff-image/upload");
      
      const response = await fetch('/api/staff-image/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        // No need to set Content-Type header with FormData, the browser sets it with boundary
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Upload response:", data);
      
      if (data.success && data.file.path) {
        setUploadedImageUrl(data.file.path);
        onImageUploaded(data.file.path);
        toast({
          title: "Image uploaded successfully",
          description: "The staff photo has been uploaded.",
        });
      } else {
        throw new Error('Upload response missing file path');
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      // Revert to the previous image
      setPreviewUrl(uploadedImageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="staff-image">Staff Photo</Label>
        
        <div className="flex items-center gap-4">
          <Input
            id="staff-image"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
            disabled={isUploading}
          />
        </div>
        
        {isUploading && (
          <div className="flex items-center space-x-2 text-sm text-teal-600 mt-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading image...</span>
          </div>
        )}
      </div>
      
      {previewUrl && (
        <div className="relative w-full max-w-xs mt-4">
          <img 
            src={previewUrl} 
            alt="Staff photo preview" 
            className="rounded-md object-cover w-full max-h-64"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {!previewUrl && uploadedImageUrl && (
        <div className="mt-2 text-sm text-muted-foreground">
          Current image: {uploadedImageUrl.split('/').pop()}
        </div>
      )}
      
      {!previewUrl && !uploadedImageUrl && (
        <div className="p-8 border border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground">
          <Upload className="h-8 w-8 mb-2" />
          <p>No image selected</p>
          <p className="text-xs mt-1">Upload an image using the file input above</p>
        </div>
      )}
    </div>
  );
}