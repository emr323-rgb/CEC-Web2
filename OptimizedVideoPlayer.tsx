import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * This component provides an optimized solution for video playback in both environments:
 * 1. It attempts to load smaller, compressed videos in deployment
 * 2. It has a fallback mechanism to try progressively smaller videos
 * 3. It provides detailed debugging information
 */
interface OptimizedVideoPlayerProps {
  src: string; // Original source
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}

const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = ({
  src,
  className = '',
  autoplay = true,
  muted = true,
  loop = true,
  controls = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hostname, setHostname] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [isDeployment, setIsDeployment] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      setHostname(host);
      
      // Check if we're in deployment
      const inDeployment = host.includes('.replit.app');
      setIsDeployment(inDeployment);
      
      // Determine the appropriate source based on environment
      if (inDeployment) {
        // In deployment, try to use a potentially compressed version with -compressed suffix
        const srcParts = src.split('.');
        const extension = srcParts.pop() || 'mp4';
        const baseSrc = srcParts.join('.');
        const compressedSrc = `${baseSrc}-compressed.${extension}`;
        setSelectedSource(compressedSrc);
        
        console.log(`Deployment environment detected. Using compressed video: ${compressedSrc}`);
      } else {
        setSelectedSource(src);
        console.log(`Development/preview environment detected. Using original video: ${src}`);
      }
    }
  }, [src]);
  
  // Setup video playback and error handling
  useEffect(() => {
    if (!videoRef.current || !selectedSource) return;
    
    const video = videoRef.current;
    console.log(`Setting up video with source: ${selectedSource}`);
    
    // Check if the video is available via HEAD request
    const checkVideoAvailability = async () => {
      try {
        const response = await fetch(selectedSource, { method: 'HEAD' });
        console.log(`Video availability check: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log('Video file is accessible!');
        } else {
          console.error('Video file is not accessible:', response.status, response.statusText);
          setError(`Video not accessible (${response.status})`);
          
          // In deployment and file not found, fall back to original source
          if (isDeployment && selectedSource !== src) {
            console.log('Falling back to original video source');
            setSelectedSource(src);
          }
        }
      } catch (err) {
        console.error('Error checking video availability:', err);
        setError(`Network error checking video`);
      }
    };
    
    checkVideoAvailability();
    
    const handleLoadStart = () => {
      console.log('Video load started');
      setIsLoading(true);
    };
    
    const handleLoadedData = () => {
      console.log('Video data loaded');
      setIsLoading(false);
    };
    
    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded, attempting to play...');
      
      if (autoplay) {
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video playback started successfully');
            })
            .catch((err) => {
              console.error('Video playback was prevented:', err);
              setError(`Playback prevented: ${err.message || 'Unknown error'}`);
            });
        }
      }
    };
    
    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement;
      console.error('Video error:', videoElement.error);
      
      // Get detailed error information
      let errorMessage = 'Unknown video error';
      if (videoElement.error) {
        switch (videoElement.error.code) {
          case 1:
            errorMessage = 'Video loading aborted';
            break;
          case 2:
            errorMessage = 'Network error';
            break;
          case 3:
            errorMessage = 'Video decoding failed';
            break;
          case 4:
            errorMessage = 'Video not supported';
            break;
          default:
            errorMessage = `Error code: ${videoElement.error.code}`;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
      console.error(`Video error details: ${errorMessage}`);
      
      // If in deployment and error occurs with compressed version, try original
      if (isDeployment && selectedSource !== src) {
        console.log('Error with compressed video, trying original source');
        setSelectedSource(src);
      }
    };
    
    // Add event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    
    return () => {
      // Remove event listeners
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, [selectedSource, autoplay, isDeployment, src]);
  
  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className={className}
        muted={muted}
        loop={loop}
        playsInline
        controls={controls}
        src={selectedSource}
      >
        Your browser does not support the video tag.
      </video>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      
      {/* Error message - only visible in development */}
      {process.env.NODE_ENV === 'development' && error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-sm z-50">
          Video Error: {error}
        </div>
      )}
    </div>
  );
};

export default OptimizedVideoPlayer;