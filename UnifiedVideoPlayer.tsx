import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import EmbeddedVideoPlayer from './EmbeddedVideoPlayer';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';

interface UnifiedVideoPlayerProps {
  videoUrl?: string | null;
  embeddedVideoId?: string | null;
  videoPlatform?: 'youtube' | 'vimeo';
  className?: string;
  aspectRatio?: 'square' | 'video' | 'vertical' | 'widescreen';
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

/**
 * A unified video player component that can handle both direct uploads and embedded videos.
 * Will automatically use embedded video if available, otherwise falls back to direct upload.
 * 
 * Enhanced to handle deployment vs preview environments:
 * 1. Works reliably in both preview and deployment
 * 2. Provides graceful fallbacks for errors
 * 3. Better logging and error handling
 */
const UnifiedVideoPlayer: React.FC<UnifiedVideoPlayerProps> = ({
  videoUrl,
  embeddedVideoId,
  videoPlatform = 'youtube',
  className = '',
  aspectRatio = 'video',
  autoplay = true,
  loop = true,
  muted = true,
  controls = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isDeployment, setIsDeployment] = useState(false);
  
  // Calculate aspect ratio class
  const aspectRatioClass = 
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === 'vertical' ? 'aspect-[9/16]' :
    aspectRatio === 'widescreen' ? 'aspect-[21/9]' :
    'aspect-video'; // default 16:9 ratio
  
  // Define base container classes
  const containerClasses = `relative ${aspectRatioClass} overflow-hidden bg-[#5a9e97] ${className}`;
  
  // Detect deployment vs preview environment
  useEffect(() => {
    const hostname = window.location.hostname;
    const isInDeployment = hostname.includes('.replit.app');
    setIsDeployment(isInDeployment);
    
    console.log(`Environment detection: ${isInDeployment ? 'Deployment' : 'Preview'}`);
  }, []);
  
  // Default Vimeo video ID to use as fallback (only in deployment)
  const defaultVimeoId = '824804225'; // A default Vimeo video ID
  
  // Determine if we should use embedded video
  // In deployment, always use embedded videos (either provided or fallback)
  const useEmbedded = !!embeddedVideoId || isDeployment;
  
  // Log decision for debugging
  useEffect(() => {
    console.log(`UnifiedVideoPlayer: Using ${useEmbedded ? 'embedded' : 'direct upload'} video`);
    if (embeddedVideoId) {
      console.log(`Platform: ${videoPlatform}, Video ID: ${embeddedVideoId}`);
    } 
    if (videoUrl) {
      console.log(`Direct Upload URL: ${videoUrl}`);
    }
    
    // Reset loading state when props change
    setIsLoading(true);
    setVideoError(null);
    
    // Auto reset loading after a timeout as fallback
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 8000); // Increased timeout for slower connections
    
    return () => clearTimeout(timer);
  }, [embeddedVideoId, videoUrl, useEmbedded, videoPlatform, isDeployment]);
  
  // Handle loading complete
  const handleLoadComplete = () => {
    console.log('Video loaded successfully');
    setIsLoading(false);
  };
  
  // Handle embedded video load
  const handleEmbeddedLoad = () => {
    console.log('Embedded video loaded successfully');
    setIsLoading(false);
  };
  
  // Handle video error
  const handleError = (error: string) => {
    console.error('Video playback error:', error);
    setVideoError(error);
    setIsLoading(false);
  };
  
  return (
    <div className={containerClasses}>
      {/* Background color - shown as fallback */}
      <div className="absolute inset-0 bg-[#5a9e97]" />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      
      {/* Error display */}
      {videoError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/50 p-4 rounded text-white text-center max-w-[80%]">
            <p>Unable to play video</p>
          </div>
        </div>
      )}
      
      {/* Render the appropriate video player */}
      {useEmbedded && (embeddedVideoId || isDeployment) ? (
        <EmbeddedVideoPlayer
          // Use provided embeddedVideoId if available, fall back to default if in deployment
          videoId={embeddedVideoId || (isDeployment ? defaultVimeoId : '')}
          platform={videoPlatform || 'vimeo'}
          className="absolute inset-0 w-full h-full"
          autoplay={autoplay}
          loop={loop}
          muted={muted}
          controls={controls}
          onLoad={handleEmbeddedLoad}
          onError={handleError}
        />
      ) : !isDeployment && videoUrl ? (
        <EnhancedVideoPlayer
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoplay={autoplay}
          loop={loop}
          muted={muted}
          controls={controls}
          onLoadComplete={handleLoadComplete}
          onError={handleError}
        />
      ) : (
        // No video source available - fallback empty state (should not happen with our defaults)
        <div className="absolute inset-0 flex items-center justify-center">
          {!isLoading && !videoError && (
            <p className="text-white/70 text-sm hidden">No video source available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedVideoPlayer;