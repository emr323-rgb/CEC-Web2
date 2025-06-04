/**
 * Helper functions for handling video URL resolution in different environments
 */

interface VideoUrlOptions {
  fallbackToRelative?: boolean;
  stripDomain?: boolean;
}

/**
 * Resolves video URLs for different deployment environments
 * This helps handle the different URL structures that might occur in dev vs production
 * 
 * @param url Original video URL from the API
 * @param options Configuration options
 * @returns An array of possible URLs to try
 */
export function resolveVideoUrl(url: string | undefined | null, options: VideoUrlOptions = {}): string[] {
  if (!url) return [];
  
  const { fallbackToRelative = true, stripDomain = true } = options;
  const urls: string[] = [url]; // Always include the original URL
  
  // Add a version parameter to avoid caching issues
  const timestamp = Date.now();
  const hasQueryParams = url.includes('?');
  const versionedUrl = `${url}${hasQueryParams ? '&' : '?'}v=${timestamp}`;
  urls.push(versionedUrl);
  
  // If URL is fully qualified (contains protocol and domain)
  if (url.includes('://')) {
    try {
      // Get just the path portion
      const pathOnly = new URL(url).pathname;
      if (stripDomain && pathOnly) {
        urls.push(pathOnly);
        urls.push(`${pathOnly}${hasQueryParams ? '&' : '?'}v=${timestamp}`);
      }
    } catch (e) {
      console.error('Failed to parse URL:', e);
    }
  }
  
  // Handle URLs that start with /uploads/ which may need to be transformed in production
  if (fallbackToRelative && url.startsWith('/uploads/')) {
    // Try without the /uploads prefix (needed in some deployment environments)
    const withoutUploadsPrefix = url.replace('/uploads/', '/');
    urls.push(withoutUploadsPrefix);
    urls.push(`${withoutUploadsPrefix}${hasQueryParams ? '&' : '?'}v=${timestamp}`);
    
    // Also try a completely relative path
    const relativeUrl = url.replace('/uploads/', '');
    urls.push(relativeUrl);
    urls.push(`${relativeUrl}${hasQueryParams ? '&' : '?'}v=${timestamp}`);
  }
  
  // Remove duplicates
  return [...new Set(urls)];
}

/**
 * Generates an array of URLs for video sources to improve compatibility
 * 
 * @param url Original video URL from the API
 * @param type Video MIME type (defaults to 'video/mp4')
 * @returns An array of URLs to use for video sources
 */
export function generateVideoSources(url: string | undefined | null, type: string = 'video/mp4'): string[] {
  if (!url) return [];
  
  return resolveVideoUrl(url);
}

/**
 * Enhanced video autoplay function that tries multiple methods to ensure videos can 
 * autoplay even in restricted environments like mobile browsers.
 * 
 * @param videoElement The video element to configure and play
 * @returns Cleanup function for event listeners
 */
export function setupEnhancedAutoplay(videoElement: HTMLVideoElement | null): () => void {
  if (!videoElement) return () => {};
  
  // Configure video for maximum compatibility
  const video = videoElement;
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.loop = true;
  video.volume = 0;
  
  // Add all possible attributes for maximum compatibility
  video.setAttribute('playsinline', ''); 
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('loop', '');
  
  // Reset video playback to beginning
  video.currentTime = 0;
  
  // Force reload if there are source elements
  if (video.querySelector('source')) {
    // Reapply the sources to trigger reload
    const sources = Array.from(video.querySelectorAll('source'));
    sources.forEach(source => {
      const newSource = document.createElement('source');
      newSource.src = source.src;
      newSource.type = source.type;
      source.parentNode?.replaceChild(newSource, source);
    });
    
    // Force reload after source manipulation
    video.load();
  }
  
  // Multiple attempt function with comprehensive fallbacks
  const attemptPlay = () => {
    console.log('Attempting enhanced video autoplay...');
    
    try {
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log('Autoplay successful'))
          .catch(error => {
            console.warn('Primary autoplay failed, trying alternate methods:', error);
            
            // Try with short delay
            setTimeout(() => {
              video.play()
                .then(() => console.log('Delayed autoplay successful'))
                .catch(e => {
                  console.error('Delayed autoplay failed:', e);
                  
                  // Last resort - try with user gesture simulation
                  try {
                    // This is a trick that sometimes works in deployment environments
                    video.controls = true;
                    setTimeout(() => {
                      video.controls = false;
                      video.play()
                        .catch(e => console.error('All autoplay methods failed'));
                    }, 50);
                  } catch (finalError) {
                    console.error('All video autoplay attempts failed');
                  }
                });
            }, 200);
          });
      } else {
        // Fallback for browsers that don't return a promise from play()
        try {
          video.play();
        } catch (error) {
          console.error('Error during play attempt:', error);
        }
      }
    } catch (error) {
      console.error('Error setting up autoplay:', error);
    }
  };
  
  // Set up event handlers for multiple opportunities to play
  const canPlayHandler = () => {
    console.log('Video can play event fired');
    video.play().catch(e => console.warn('Play on canplay failed:', e));
  };
  
  const canPlayThroughHandler = () => {
    console.log('Video canplaythrough event fired');
    video.play().catch(e => console.warn('Play on canplaythrough failed:', e));
  };
  
  const loadedDataHandler = () => {
    console.log('Video loadeddata event fired');
    video.play().catch(e => console.warn('Play on loadeddata failed:', e));
  };
  
  const visibilityChangeHandler = () => {
    if (document.visibilityState === 'visible' && video.paused) {
      video.play()
        .then(() => console.log('Video resumed on visibility change'))
        .catch(e => console.warn('Failed to resume on visibility change:', e));
    }
  };
  
  // Add the event listeners
  video.addEventListener('canplay', canPlayHandler);
  video.addEventListener('canplaythrough', canPlayThroughHandler);
  video.addEventListener('loadeddata', loadedDataHandler);
  document.addEventListener('visibilitychange', visibilityChangeHandler);
  
  // Attempt to play immediately
  attemptPlay();
  
  // Also try with delays for maximum compatibility
  const timeouts: number[] = [];
  [100, 500, 1000, 2000].forEach(delay => {
    const timeout = window.setTimeout(attemptPlay, delay);
    timeouts.push(timeout);
  });
  
  // Return cleanup function
  return () => {
    video.removeEventListener('canplay', canPlayHandler);
    video.removeEventListener('canplaythrough', canPlayThroughHandler);
    video.removeEventListener('loadeddata', loadedDataHandler);
    document.removeEventListener('visibilitychange', visibilityChangeHandler);
    timeouts.forEach(t => window.clearTimeout(t));
  };
}