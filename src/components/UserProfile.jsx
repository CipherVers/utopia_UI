import React, { useEffect, useState, useRef } from 'react';
import './UserProfile.css';
import VideoCard from './VideoCard';

function UserProfile({ token, username, onBack }) {
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const videoRefs = useRef([]);

  useEffect(() => {
    const fetchUserVideos = async () => {
      try {
        const response = await fetch(
          `https://oback.dacryptogame.com/api/videos/user/${username}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserVideos(data);
          setError(null);
        } else {
          setError('Failed to fetch user videos');
        }
      } catch (error) {
        console.error('Failed to fetch user videos:', error);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    if (token && username) {
      fetchUserVideos();
    }
  }, [token, username]);

  const handleVideoClick = (index) => {
    setSelectedIndex(index);
    setViewMode('feed');
  };

  const handleVideoRef = (index) => (ref) => {
    videoRefs.current[index] = ref;
  };

  useEffect(() => {
    if (viewMode !== 'feed') return;
    
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.8
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play().catch(err => console.log("Playback error:", err));
        } else {
          entry.target.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    
    videoRefs.current.forEach((videoRef) => {
      if (videoRef) observer.observe(videoRef);
    });

    return () => observer.disconnect();
  }, [viewMode, userVideos, selectedIndex]);

  return (
    <div className="user-profile">
      {viewMode === 'grid' ? (
        <>
          <div className="profile-header">
            <button onClick={onBack} className="back-button">Back</button>
            <h1>@{username}'s Videos</h1>
          </div>
          <div className="video-grid">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : userVideos.length === 0 ? (
              <div className="no-videos">No videos found</div>
            ) : (
              userVideos.map((video, index) => (
                <div 
                  key={video.id} 
                  className="video-thumbnail"
                  onClick={() => handleVideoClick(index)}
                >
                  <div className="thumbnail-image" style={{
                    backgroundImage: `url(${video.url.replace(/\.[^/.]+$/, "_thumb.jpg")})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                    <div className="thumbnail-overlay">
                      <span className="thumbnail-number">{index + 1}</span>
                    </div>
                  </div>
                  <div className="video-info">
                    <p className="video-title">{video.title}</p>
                    <div className="video-stats">
                      <span>{video.likes} likes</span>
                      <span>{video.saves} saves</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="video-feed-container">
          <button 
            onClick={() => setViewMode('grid')} 
            className="back-to-grid"
          >
            Back to Grid
          </button>
          <div className="video-feed">
            {userVideos.slice(selectedIndex).map((video, index) => (
              <VideoCard
                key={video.id}
                videoId={video.id}
                username={video.user || username}
                description={video.title}
                likes={video.likes || 0}
                saves={video.saves || 0}
                comments={0}
                shares={0}
                url={video.url.startsWith('http') ? video.url : `https://oback.dacryptogame.com${video.url}`}
                setVideoRef={handleVideoRef(index)}
                autoplay={index === 0}
                onLike={() => {}}
                onSave={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
