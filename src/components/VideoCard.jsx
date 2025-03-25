import React, { useRef, useState, useEffect } from 'react';
import FooterLeft from './FooterLeft';
import FooterRight from './FooterRight';
import './VideoCard.css';

function VideoCard({ 
  url, 
  videoId,
  username, 
  description, 
  song, 
  likes, 
  shares, 
  comments, 
  saves, 
  profilePic, 
  setVideoRef, 
  autoplay,
  onLike,
  onSave,
  onUserClick 
}) {
  const [playing, setPlaying] = useState(autoplay);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      setVideoRef(videoRef.current);
    }
  }, [setVideoRef]);

  const onVideoPress = () => {
    if (!videoRef.current) return;
    
    if (playing) {
      const pausePromise = videoRef.current.pause();
      if (pausePromise !== undefined) {
        pausePromise.catch(error => {
          console.error('Error pausing video:', error);
        });
      }
      setPlaying(false);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing video:', error);
        });
      }
      setPlaying(true);
    }
  };

  return (
    <div className="video">
      <video
        ref={videoRef}
        onClick={onVideoPress}
        className="player"
        loop
        playsInline
        preload="metadata"
        poster={url.replace(/\.[^/.]+$/, "_thumb.jpg")} // Add thumbnail support
        src={url}
      />
      <div className="bottom-controls">
        <div className="footer-left">
          <FooterLeft 
            username={username} 
            description={description} 
            song={song}
            onUserClick={() => onUserClick(username)}
          />
        </div>
        <div className="footer-right">
          <FooterRight 
            likes={likes} 
            shares={shares} 
            comments={comments} 
            saves={saves} 
            profilePic={profilePic}
            onLike={() => onLike(videoId)}
            onSave={() => onSave(videoId)}
            onProfileClick={() => onUserClick(username)}
          />
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
