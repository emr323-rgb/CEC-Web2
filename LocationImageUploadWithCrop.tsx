import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, Check, Maximize, Minimize } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Cropper from 'react-easy-crop';

// Define Area type locally
interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LocationImageUploadWithCropProps {
  currentImageUrl: string | null;
  onImageUploaded: (imageUrl: string) => void;
}

export default function LocationImageUploadWithCrop({ 
  currentImageUrl, 
  onImageUploaded 
}: LocationImageUploadWithCropProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(currentImageUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageSrc(reader.result);
          setShowCropper(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context is not available');
    }

    // Set canvas dimensions to the cropped size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Convert the canvas to a data URL
    return canvas.toDataURL('image/jpeg');
  };

  const applyAndUploadCrop = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
        setPreviewUrl(croppedImageUrl);
        setShowCropper(false);
        
        // Convert data URL to a Blob
        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'cropped-location-image.jpg', { type: 'image/jpeg' });
        
        // Upload the cropped image
        uploadFile(file);
      } catch (error) {
        console.error('Error applying crop:', error);
        toast({
          title: 'Error',
          description: 'Failed to process the cropped image',
          variant: 'destructive',
        });
      }
    }
  };

  const cancelCrop = () => {
    setShowCropper(false);
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Use the dedicated location image upload endpoint with multer
      const response = await fetch('/api/location-image/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.file && data.file.path) {
        setUploadedImageUrl(data.file.path);
        onImageUploaded(data.file.path);
        toast({
          title: "Image uploaded successfully",
          description: "The location photo has been uploaded and cropped.",
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
        <Label htmlFor="location-image">Location Photo</Label>
        
        <div className="flex items-center gap-4">
          <Input
            id="location-image"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
            disabled={isUploading || showCropper}
          />
        </div>
        
        {isUploading && (
          <div className="flex items-center space-x-2 text-sm text-teal-600 mt-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading image...</span>
          </div>
        )}
      </div>
      
      {showCropper && imageSrc && (
        <div className="rounded-lg border overflow-hidden p-4 space-y-4">
          <h3 className="font-medium text-sm">Position and crop the location photo</h3>
          <p className="text-xs text-muted-foreground">Adjust to create an attractive, properly framed location image</p>
          
          <div className="relative h-[300px] mt-2">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={16/9}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              objectFit="horizontal-cover"
              showGrid={true}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Minimize className="h-4 w-4" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
            <Maximize className="h-4 w-4" />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={cancelCrop}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={applyAndUploadCrop}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Apply Crop
            </Button>
          </div>
        </div>
      )}
      
      {previewUrl && !showCropper && (
        <div className="relative w-full mt-4">
          <img 
            src={previewUrl} 
            alt="Location photo preview" 
            className="rounded-md object-cover w-full h-48"
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
      
      {!previewUrl && !showCropper && uploadedImageUrl && (
        <div className="relative w-full mt-4">
          <img 
            src={uploadedImageUrl} 
            alt="Location photo" 
            className="rounded-md object-cover w-full h-48"
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
      
      {!previewUrl && !showCropper && !uploadedImageUrl && (
        <div className="p-8 border border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground">
          <Upload className="h-8 w-8 mb-2" />
          <p>No image selected</p>
          <p className="text-xs mt-1">Upload an image using the file input above</p>
        </div>
      )}
    </div>
  );
}