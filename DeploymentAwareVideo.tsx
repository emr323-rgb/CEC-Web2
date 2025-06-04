import React, { useEffect, useRef, useState } from 'react';

interface DeploymentAwareVideoProps {
  src: string;
  className?: string;
}

// Define multiple potential URLs to try
type VideoSource = {
  url: string;
  type: string;
};

const DeploymentAwareVideo: React.FC<DeploymentAwareVideoProps> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSources, setVideoSources] = useState<VideoSource[]>([]);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [videoKey, setVideoKey] = useState<string>(`video-${Date.now()}`);

  useEffect(() => {
    // Check if we're in deployment or preview
    const isDeploy = window.location.hostname.includes('.replit.app');
    setIsDeployed(isDeploy);
    
    // Generate multiple possible video sources for maximum compatibility
    const videoFile = src.split('/').pop() || '';
    
    // Force a unique key to ensure complete remounting between attempts
    setVideoKey(`video-${isDeploy ? 'deploy' : 'preview'}-${Date.now()}`);
    
    // Basic paths
    const relativePath = `/uploads/videos/${videoFile}`;
    const absolutePath = `${window.location.origin}${relativePath}`;
    
    // Additional path variations to try
    const directRelative = `/videos/${videoFile}`;
    const directAbsolute = `${window.location.origin}/videos/${videoFile}`;
    const fullPathDirectAbsolute = `${window.location.origin}/uploads/videos/${videoFile}`;
    
    // Create array of sources to try in order of likelihood to work
    const sources: VideoSource[] = [];
    
    if (isDeploy) {
      // For deployment, try absolute URLs first, then relative as fallback
      sources.push({ url: absolutePath, type: 'video/mp4' });
      sources.push({ url: fullPathDirectAbsolute, type: 'video/mp4' });
      sources.push({ url: directAbsolute, type: 'video/mp4' });
      sources.push({ url: relativePath, type: 'video/mp4' });
      sources.push({ url: directRelative, type: 'video/mp4' });
      console.log("Deployment site detected. Using these URLs in order:", sources.map(s => s.url));
    } else {
      // For preview, try relative paths first
      sources.push({ url: relativePath, type: 'video/mp4' });
      sources.push({ url: directRelative, type: 'video/mp4' });
      sources.push({ url: absolutePath, type: 'video/mp4' });
      console.log("Preview site detected. Using these URLs in order:", sources.map(s => s.url));
    }
    
    setVideoSources(sources);
    
    // Try to pre-fetch the first few URLs to check availability
    const checkVideoAvailability = async () => {
      let success = false;
      
      for (const source of sources.slice(0, 3)) { // Try first 3 sources only
        try {
          console.log(`Checking availability of: ${source.url}`);
          const response = await fetch(source.url, { 
            method: 'HEAD',
            // Add cache-busting parameter
            cache: 'no-store'
          });
          
          if (response.ok) {
            console.log(`Video file is accessible at: ${source.url}!`);
            success = true;
            break;
          } else {
            console.warn(`Video file could not be accessed at ${source.url}:`, response.status);
          }
        } catch (error) {
          console.warn(`Error checking video availability at ${source.url}:`, error);
        }
      }
      
      setIsVideoLoaded(success);
    };
    
    checkVideoAvailability();
    
    // Setup a function to try playing the video
    const tryPlayVideo = () => {
      const videoElement = videoRef.current;
      if (videoElement) {
        // Reset the video element first
        videoElement.load();
        
        // Add an event listener for when metadata is loaded
        const handleLoadedMetadata = () => {
          console.log("Video metadata loaded, attempting to play...");
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Video playback started successfully");
              })
              .catch(error => {
                console.error("Video playback was prevented:", error);
              });
          }
          
          // Remove the event listener once triggered
          videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
        
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      }
    };
    
    // Try playing after a short delay to ensure DOM is ready
    const playTimer = setTimeout(() => {
      tryPlayVideo();
    }, 500);
    
    // Cleanup function
    return () => {
      clearTimeout(playTimer);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, [src]);

  return (
    <div className={className}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        key={videoKey}
      >
        {videoSources.map((source, index) => (
          <source key={`${index}-${source.url}`} src={source.url} type={source.type} />
        ))}
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default DeploymentAwareVideo;