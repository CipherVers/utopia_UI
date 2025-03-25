import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import VideoCard from './components/VideoCard';
import BottomNavbar from './components/BottomNavbar';
import TopNavbar from './components/TopNavbar';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';  // Add this import

function App() {
  const [videos, setVideos] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [loginError, setLoginError] = useState('');
  const videoRefs = useRef([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState('feed');
  const [selectedUser, setSelectedUser] = useState(null);

  const handleLogin = async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('grant_type', 'password'); // Add this line

      const response = await fetch('https://oback.dacryptogame.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formData
      });

      const data = await response.json();
      console.log('Login response:', data); // Debug log

      if (response.ok && data.access_token) {
        setToken(data.access_token);
        setIsAuthenticated(true);
        setLoginError('');
        localStorage.setItem('token', data.access_token); // Save token
      } else {
        setLoginError(data.detail || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please try again.');
    }
  };

  const fetchRankedVideos = async (pageNumber) => {
    try {
      if (!token || isLoading || !hasMore) return;

      setIsLoading(true);
      const response = await fetch(
        `https://oback.dacryptogame.com/api/videos/ranked?sort_by=trending&page=${pageNumber}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      console.log('Videos response:', data);

      if (response.ok) {
        const processedVideos = Array.isArray(data) ? data.map(video => ({
          ...video,
          url: video.url.startsWith('http') ? video.url : `https://oback.dacryptogame.com${video.url}`
        })) : [];
        
        if (processedVideos.length === 0) {
          setHasMore(false);
        } else {
          setVideos(prevVideos => [...prevVideos, ...processedVideos]);
          setPage(pageNumber + 1);
        }
      } else {
        if (response.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Combine useEffects and fix dependency warning
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      setVideos([]); // Clear existing videos
      setPage(1); // Reset page
      setHasMore(true); // Reset hasMore
      fetchRankedVideos(1); // Fetch first page
    }
  }, [isAuthenticated, token]); // Add token as dependency

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.8, // Adjust this value to change the scroll trigger point
    };

    // This function handles the intersection of videos
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const videoElement = entry.target;
          videoElement.play();
        } else {
          const videoElement = entry.target;
          videoElement.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // We observe each video reference to trigger play/pause
    videoRefs.current.forEach((videoRef) => {
      observer.observe(videoRef);
    });

    // We disconnect the observer when the component is unmounted
    return () => {
      observer.disconnect();
    };
  }, [videos]);

  // Update the scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.container');
      if (!container) return;

      const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
      if (isNearBottom && !isLoading && hasMore) {
        fetchRankedVideos(page);
      }
    };

    const container = document.querySelector('.container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [page, isLoading, hasMore]);

  // This function handles the reference of each video
  const handleVideoRef = (index) => (ref) => {
    videoRefs.current[index] = ref;
  };

  const handleLike = async (videoId) => {
    try {
      const response = await fetch(`https://oback.dacryptogame.com/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setVideos(prevVideos =>
          prevVideos.map(video =>
            video.id === videoId
              ? { ...video, likes: video.likes + 1 }
              : video
          )
        );
      }
    } catch (error) {
      console.error('Failed to like video:', error);
    }
  };

  const handleSave = async (videoId) => {
    try {
      const response = await fetch(`https://oback.dacryptogame.com/api/videos/${videoId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setVideos(prevVideos =>
          prevVideos.map(video =>
            video.id === videoId
              ? { ...video, saves: video.saves + 1 }
              : video
          )
        );
      }
    } catch (error) {
      console.error('Failed to save video:', error);
    }
  };

  const handleUserClick = (username) => {
    setSelectedUser(username);
    setCurrentView('profile');
  };

  return (
    <div className="app">
      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} error={loginError} />
      ) : currentView === 'feed' ? (
        <div className="container">
          <TopNavbar 
            className="top-navbar" 
            onLogout={() => {
              setIsAuthenticated(false);
              setToken('');
              localStorage.removeItem('token');
            }}
          />
          {videos.map((video, index) => (
            <VideoCard
              key={video.id || index}
              videoId={video.id}
              username={video.user}
              description={video.title}
              likes={video.likes || 0}
              saves={video.saves || 0}
              url={video.url}
              setVideoRef={handleVideoRef(index)}
              autoplay={index === 0}
              onLike={handleLike}
              onSave={handleSave}
              onUserClick={handleUserClick}
              profilePic={video.profilePic}
            />
          ))}
          <BottomNavbar className="bottom-navbar" />
        </div>
      ) : (
        <UserProfile 
          token={token}
          username={selectedUser}
          onBack={() => setCurrentView('feed')}
        />
      )}
    </div>
  );
}

export default App;
