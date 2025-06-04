import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface DirectVimeoEmbedProps {
  videoId: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'vertical' | 'widescreen';
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

/**
 * A direct Vimeo embed component that doesn't rely on our API but embeds directly
 * This is most reliable for deployment environments
 */
const DirectVimeoEmbed: React.FC<DirectVimeoEmbedProps> = ({
  videoId,
  className,
  aspectRatio = 'widescreen',
  autoplay = true,
  loop = true,
  muted = true,
  controls = false,
  onLoad,
  onError
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle aspect ratio classes
  const aspectRatioClass = (() => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      case 'vertical': return 'aspect-[9/16]';
      case 'widescreen': return 'aspect-[16/9]';
      default: return 'aspect-video';
    }
  })();

  // Create Vimeo URL with parameters
  const vimeoSrc = `https://player.vimeo.com/video/${videoId}?background=${!controls ? '1' : '0'}&autoplay=${autoplay ? '1' : '0'}&loop=${loop ? '1' : '0'}&muted=${muted ? '1' : '0'}&controls=${controls ? '1' : '0'}`;

  // Handle load events
  const handleLoad = () => {
    console.log('Vimeo iframe loaded');
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle errors
  const handleError = () => {
    const errorMsg = 'Failed to load Vimeo video';
    console.error(errorMsg);
    setError(errorMsg);
    if (onError) onError(errorMsg);
  };

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClass, className)}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-12 h-12 border-4 border-[#5a9e97] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-red-500 text-sm">Failed to load video</p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={vimeoSrc}
        className={cn('absolute inset-0 w-full h-full', isLoaded ? 'opacity-100' : 'opacity-0')}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
      ></iframe>
    </div>
  );
};

export default DirectVimeoEmbed;