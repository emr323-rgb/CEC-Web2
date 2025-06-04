import React, { useEffect, useRef, useState } from 'react';

interface EmbeddedVideoPlayerProps {
  videoId: string;
  platform: 'youtube' | 'vimeo';
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

const EmbeddedVideoPlayer: React.FC<EmbeddedVideoPlayerProps> = ({
  videoId,
  platform,
  className = '',
  autoplay = true,
  loop = true,
  muted = true,
  controls = false,
  onLoad,
  onError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generate the embed URL based on platform and options
  const generateEmbedUrl = () => {
    try {
      if (!videoId) return '';
      
      if (platform === 'youtube') {
        // YouTube embed parameters
        // https://developers.google.com/youtube/player_parameters
        const params = new URLSearchParams({
          autoplay: autoplay ? '1' : '0',
          mute: muted ? '1' : '0',
          loop: loop ? '1' : '0',
          controls: controls ? '1' : '0',
          playlist: loop ? videoId : '', // Required for looping to work
          rel: '0', // Don't show related videos
          modestbranding: '1', // Less YouTube branding
        });
        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      } else if (platform === 'vimeo') {
        // Vimeo embed parameters
        // https://developer.vimeo.com/player/sdk/embed
        const params = new URLSearchParams({
          autoplay: autoplay ? '1' : '0',
          muted: muted ? '1' : '0',
          loop: loop ? '1' : '0',
          controls: controls ? '1' : '0',
          transparent: '1',
          background: !controls ? '1' : '0', // For a cleaner player when controls are off
          dnt: '1', // Do not track
        });
        return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
      }
      
      return '';
    } catch (err) {
      console.error('Error generating embed URL:', err);
      setError(`Failed to generate embed URL: ${err instanceof Error ? err.message : String(err)}`);
      onError?.(`Failed to generate embed URL: ${err instanceof Error ? err.message : String(err)}`);
      return '';
    }
  };
  
  const embedUrl = generateEmbedUrl();
  
  // Handle iframe load complete
  const handleIframeLoad = () => {
    setLoaded(true);
    console.log(`Embedded ${platform} video loaded successfully`);
    onLoad?.();
  };
  
  // Handle iframe error
  const handleIframeError = (e: any) => {
    const errorMsg = `Failed to load ${platform} video: ${e.message || 'Unknown error'}`;
    console.error(errorMsg, e);
    setError(errorMsg);
    onError?.(errorMsg);
  };
  
  // Apply styling and perform post-load operations
  useEffect(() => {
    if (!iframeRef.current) return;
    
    // Add event listeners
    const iframe = iframeRef.current;
    iframe.addEventListener('load', handleIframeLoad);
    iframe.addEventListener('error', handleIframeError);
    
    // Set a timeout to assume error if not loaded
    const timeout = setTimeout(() => {
      if (!loaded && !error) {
        const timeoutMsg = `Timeout loading ${platform} video`;
        console.warn(timeoutMsg);
        setError(timeoutMsg);
        onError?.(timeoutMsg);
      }
    }, 10000); // 10 second timeout
    
    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      iframe.removeEventListener('error', handleIframeError);
      clearTimeout(timeout);
    };
  }, [loaded, error, platform]);
  
  // Log details for debugging
  useEffect(() => {
    console.log(`Embedded Video Player:
      - Platform: ${platform}
      - Video ID: ${videoId || 'None'}
      - URL: ${embedUrl || 'None'}
      - Autoplay: ${autoplay}
      - Loop: ${loop}
      - Muted: ${muted}
      - Controls: ${controls}
      - Loaded: ${loaded}
      - Error: ${error || 'None'}
    `);
    
    // Reset state when video ID changes
    setLoaded(false);
    setError(null);
  }, [platform, videoId, embedUrl, autoplay, loop, muted, controls]);
  
  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Semi-transparent overlay until loaded (better UX) */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-black/20 z-10" />
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20">
          <div className="bg-black/50 p-2 rounded-md">
            <p className="text-sm text-white/70">Video unavailable</p>
          </div>
        </div>
      )}
      
      {videoId && !error ? (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={`${platform} video player`}
        ></iframe>
      ) : !error ? (
        <div className="flex items-center justify-center h-full w-full bg-black/10">
          <p className="text-sm text-white/70">No video ID provided</p>
        </div>
      ) : null}
    </div>
  );
};

export default EmbeddedVideoPlayer;