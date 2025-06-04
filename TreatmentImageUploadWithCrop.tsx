import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import Cropper, { Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

type TreatmentImageUploadWithCropProps = {
  onImageUploaded: (imageUrl: string) => void;
  existingImageUrl?: string;
  aspectRatio?: number;
};

export default function TreatmentImageUploadWithCrop({
  onImageUploaded,
  existingImageUrl,
  aspectRatio = 16 / 9, // Default aspect ratio for treatment images
}: TreatmentImageUploadWithCropProps) {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setIsCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
      e.target.value = ""; // Reset the input
    }
  };

  const handleCrop = async () => {
    if (!image || !croppedAreaPixels) {
      return;
    }

    setIsUploading(true);

    try {
      // Create a canvas to draw the cropped image
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = image;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      ctx.drawImage(
        img,
        croppedAreaPixels.x * scaleX,
        croppedAreaPixels.y * scaleY,
        croppedAreaPixels.width * scaleX,
        croppedAreaPixels.height * scaleY,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error("Canvas to Blob conversion failed");
          }
          resolve(blob);
        }, "image/jpeg");
      });

      // Create form data for upload
      const formData = new FormData();
      formData.append("image", blob, "treatment-image.jpg");

      // Upload the cropped image
      const response = await fetch("/api/treatment-image/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      onImageUploaded(data.imageUrl);
      setIsCropDialogOpen(false);
      
      toast({
        title: "Image uploaded",
        description: "Your treatment image has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="treatment-image-upload">Treatment Image</Label>
        <div className="flex items-center gap-4">
          <div className="min-h-[150px] min-w-[200px] rounded-md border border-input bg-gray-50 flex items-center justify-center overflow-hidden">
            {existingImageUrl ? (
              <img
                src={existingImageUrl}
                alt="Treatment Image"
                className="max-h-[150px] max-w-[200px] object-cover"
              />
            ) : (
              <div className="text-gray-400 text-sm text-center p-4">
                No image uploaded
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              id="treatment-image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("treatment-image-upload")?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <p className="text-xs text-gray-500">
              Upload an image for this treatment program. The image will be
              cropped to fit the required dimensions.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
          <DialogTitle>Crop Treatment Image</DialogTitle>
          <DialogDescription>
            Adjust the crop area to frame the image properly.
          </DialogDescription>

          <div className="relative flex-1 my-4 min-h-[300px]">
            {image && (
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Zoom</Label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="py-4"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCropDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleCrop} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save & Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}