import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  playOnScroll?: boolean; // New prop to enable/disable scroll-based playback
}

export function VideoPlayer({
  src,
  title,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  className = '',
  playOnScroll = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Update time display and progress bar
    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
    };

    // Play and pause handlers
    const handlePlaying = () => setIsPlaying(true);
    const handlePaused = () => setIsPlaying(false);
    
    // Register event listeners
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePaused);
    video.addEventListener('ended', handlePaused);
    video.addEventListener('loadedmetadata', updateProgress);

    // Fullscreen change detection
    document.addEventListener('fullscreenchange', () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    });

    // Cleanup event listeners on unmount
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePaused);
      video.removeEventListener('ended', handlePaused);
      video.removeEventListener('loadedmetadata', updateProgress);
      document.removeEventListener('fullscreenchange', () => {});
    };
  }, []);

  // Scroll-based playback control
  useEffect(() => {
    if (!playOnScroll || !videoRef.current) return;
    
    const video = videoRef.current;
    const videoContainer = containerRef.current;
    let scrollTimer: number | null = null;
    let isHandlingScroll = false;
    
    const handleScroll = () => {
      if (!videoContainer || isHandlingScroll) return;
      
      // Set flag to prevent concurrent executions
      isHandlingScroll = true;
      
      // Clear previous timeout
      if (scrollTimer) {
        window.clearTimeout(scrollTimer);
      }
      
      // Debounce the scroll handling to prevent rapid play/pause calls
      scrollTimer = window.setTimeout(() => {
        const rect = videoContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate how much of the video is visible in the viewport
        const visiblePercentage = Math.min(
          Math.max(
            0,
            Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
          ) / rect.height,
          1
        ) * 100;
        
        // Play video when at least 50% visible, pause when less than 50% visible
        if (visiblePercentage >= 50) {
          if (video.paused) {
            // Only attempt to play if video is currently paused
            console.log('Scroll-based play attempt');
            try {
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('Scroll-based play successful');
                    setIsPlaying(true);
                  })
                  .catch(err => {
                    console.error('Error playing video on scroll:', err);
                  })
                  .finally(() => {
                    isHandlingScroll = false;
                  });
              } else {
                isHandlingScroll = false;
              }
            } catch (error) {
              console.error('Error attempting to play on scroll:', error);
              isHandlingScroll = false;
            }
          } else {
            isHandlingScroll = false;
          }
        } else {
          if (!video.paused) {
            // Only pause if it's currently playing
            console.log('Scroll-based pause');
            video.pause();
            setIsPlaying(false);
          }
          isHandlingScroll = false;
        }
      }, 150); // 150ms debounce time
    };
    
    // Initial check with a small delay to let the page settle
    setTimeout(handleScroll, 1000);
    
    // Add scroll event listener with throttling
    let lastScrollTime = 0;
    const throttledScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime > 100) { // throttle to max once per 100ms
        lastScrollTime = now;
        handleScroll();
      }
    };
    
    window.addEventListener('scroll', throttledScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (scrollTimer) {
        window.clearTimeout(scrollTimer);
      }
    };
  }, [playOnScroll]);

  // Play/pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      console.log('Attempting to play video from click');
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video playback started successfully from click');
              setIsPlaying(true);
            })
            .catch(err => {
              console.error('Error playing video from click:', err);
              
              // If play fails, try again with muted
              if (!video.muted) {
                console.log('Trying with muted video as fallback');
                video.muted = true;
                video.play()
                  .then(() => {
                    console.log('Muted playback successful');
                    setIsPlaying(true);
                  })
                  .catch(err2 => {
                    console.error('Even muted playback failed:', err2);
                  });
              }
            });
        }
      } catch (error) {
        console.error('Error during play attempt:', error);
      }
    } else {
      console.log('Pausing video from click');
      video.pause();
      setIsPlaying(false);
    }
  };

  // Mute toggle
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Seek functionality
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Format time display (mm:ss)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Skip forward/backward
  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.min(Math.max(0, video.currentTime + seconds), video.duration);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg shadow-md ${className}`}
    >
      {title && (
        <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/50 to-transparent p-3 z-10">
          <h3 className="text-white font-medium text-lg drop-shadow-md">{title}</h3>
        </div>
      )}
      
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover cursor-pointer"
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          controls={false} // Ensure controls attribute is explicitly set to false
          onClick={togglePlay}
          onLoadedMetadata={() => {
            console.log('Video metadata loaded');
            if (autoPlay && videoRef.current) {
              // Force the video element to play manually after metadata is loaded
              try {
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                  playPromise
                    .then(() => {
                      console.log('Auto-play successful');
                      setIsPlaying(true);
                    })
                    .catch(err => {
                      console.error('Auto-play failed:', err);
                    });
                }
              } catch (error) {
                console.error('Error attempting to play:', error);
              }
            }
          }}
        />
        {/* Play/Pause overlay indicator that appears briefly when hovering */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-70 transition-opacity duration-300">
          <div className="bg-black/30 rounded-full p-4">
            {isPlaying ? 
              <Pause className="h-12 w-12 text-white" /> : 
              <Play className="h-12 w-12 text-white" />
            }
          </div>
        </div>
      </div>
      
      {controls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex flex-col gap-1">
          {/* Progress bar */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          
          {/* Controls row */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              {/* Play/pause button */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-primary transition-colors p-1 rounded-full"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
              
              {/* Skip backward 10s */}
              <button
                onClick={() => skipTime(-10)}
                className="text-white hover:text-primary transition-colors p-1 rounded-full"
                aria-label="Skip backward 10 seconds"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              
              {/* Skip forward 10s */}
              <button
                onClick={() => skipTime(10)}
                className="text-white hover:text-primary transition-colors p-1 rounded-full"
                aria-label="Skip forward 10 seconds"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              
              {/* Volume control */}
              <button
                onClick={toggleMute}
                className="text-white hover:text-primary transition-colors p-1 rounded-full"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              
              {/* Time display */}
              <span className="text-white text-xs drop-shadow-md">
                {formatTime(currentTime)} / {formatTime(duration || 0)}
              </span>
            </div>
            
            {/* Fullscreen button */}
            <button
              onClick={toggleFullScreen}
              className="text-white hover:text-primary transition-colors p-1 rounded-full"
              aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}