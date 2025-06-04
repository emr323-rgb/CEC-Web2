import React, { useEffect, useRef } from 'react';

interface SimpleVideoPlayerProps {
  src: string;
  className?: string;
  posterImage?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  src,
  className = '',
  posterImage,
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Setup video element with most optimized settings for autoplay
    video.muted = muted;
    video.playsInline = true;
    video.preload = "auto";
    
    // Force video to load and play when possible
    const attemptPlay = async () => {
      try {
        if (autoPlay) {
          await video.play();
          console.log("Video playing successfully");
        }
      } catch (err) {
        console.error("Error playing video:", err);
      }
    };

    // Setup play attempts
    video.addEventListener('canplay', attemptPlay);
    video.addEventListener('loadedmetadata', attemptPlay);
    
    // Also attempt to play immediately after mounting
    attemptPlay();

    // Clean up
    return () => {
      video.removeEventListener('canplay', attemptPlay);
      video.removeEventListener('loadedmetadata', attemptPlay);
      video.pause();
    };
  }, [autoPlay, muted, src]);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={posterImage}
      muted={muted}
      loop={loop}
      controls={controls}
      playsInline
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default SimpleVideoPlayer;