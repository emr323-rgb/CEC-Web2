import React, { useEffect, useRef, useState } from 'react';

interface EnhancedVideoPlayerProps {
  src: string;
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  onLoadComplete?: () => void;
  onError?: (error: string) => void;
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  src,
  className = '',
  autoplay = true,
  muted = true,
  loop = true,
  controls = false,
  onLoadComplete,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hostname, setHostname] = useState('');
  const [videoSrcState, setVideoSrcState] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname);
      setVideoSrcState(src);
    }
  }, [src]);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    const checkVideoAvailability = async () => {
      try {
        const response = await fetch(src, { method: 'HEAD' });
        console.log(`Video availability check: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log('Video file is accessible!');
        } else {
          console.error('Video file is not accessible:', response.status, response.statusText);
          setError(`Video not accessible (${response.status})`);
        }
      } catch (err) {
        console.error('Error checking video availability:', err);
        setError(`Network error: ${err}`);
      }
    };

    // Check if video is available
    checkVideoAvailability();

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded, attempting to play...');
      setLoaded(true);
      
      // Call the onLoadComplete callback if provided
      if (onLoadComplete) {
        onLoadComplete();
      }
      
      if (autoplay) {
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video playback started successfully');
            })
            .catch((err) => {
              console.error('Video playback was prevented:', err);
              const errorMsg = `Playback prevented: ${err.message || 'Unknown error'}`;
              setError(errorMsg);
              
              // Call the onError callback if provided
              if (onError) {
                onError(errorMsg);
              }
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
      console.error(`Video error details: ${errorMessage}`);
      
      // Call the onError callback if provided
      if (onError) {
        onError(errorMessage);
      }
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, [src, autoplay]);

  // Log detailed information about the video
  useEffect(() => {
    console.log(`Enhanced Video Player details:
      - Hostname: ${hostname}
      - Video source: ${videoSrcState}
      - Loaded: ${loaded}
      - Error: ${error || 'None'}
    `);
  }, [hostname, videoSrcState, loaded, error]);

  return (
    <>
      <video
        ref={videoRef}
        className={className}
        muted={muted}
        loop={loop}
        playsInline
        controls={controls}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Development debug overlay - only visible for admin users */}
      {process.env.NODE_ENV === 'development' && error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-sm z-50">
          Video Error: {error}
        </div>
      )}
    </>
  );
};

export default EnhancedVideoPlayer;