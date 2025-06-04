import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * This component provides a backup solution for video playback issues in deployment:
 * 1. It loads a single static image as the background instead of a video
 * 2. It has a strong fallback to a teal color in case the image doesn't load
 * 3. It maintains the same layout and design as the video version
 */
const CompressedVideoBanner: React.FC = () => {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isDeployment, setIsDeployment] = useState(false);
  
  useEffect(() => {
    // Check if we're in deployment environment
    const hostname = window.location.hostname;
    const isInDeployment = hostname.includes('.replit.app');
    setIsDeployment(isInDeployment);
    
    // Set a static image as background for deployment
    if (isInDeployment) {
      setBgImage('/uploads/images/teal-gradient-bg.jpg');
    } else {
      // In preview, try to use video normally via the EnhancedVideoPlayer
      setBgImage(null);
    }
  }, []);
  
  // If we're not in deployment, don't render this component
  if (!isDeployment) return null;
  
  return (
    <div className="relative w-full h-screen max-h-[800px] min-h-[600px]">
      {/* Teal background fallback - always present */}
      <div className="absolute inset-0 bg-[#5a9e97]"></div>
      
      {/* Background image - optional */}
      {bgImage && (
        <div className="absolute inset-0">
          <img 
            src={bgImage}
            alt="Banner Background" 
            className="w-full h-full object-cover opacity-70"
            onLoad={() => setBackgroundLoaded(true)}
            onError={() => console.error('Failed to load banner background image')}
          />
          
          {!backgroundLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
      )}
      
      {/* Optional overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/10"></div>
    </div>
  );
};

export default CompressedVideoBanner;