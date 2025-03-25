import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import VideoCard from './components/VideoCard';
import BottomNavbar from './components/BottomNavbar';
import TopNavbar from './components/TopNavbar';
import LoginForm from './components/LoginForm';

// This array holds information about different videos
const videoUrls = [
  {
    url: require('./videos/video1.mp4'),
    profilePic: 'https://p16-sign-useast2a.tiktokcdn.com/tos-useast2a-avt-0068-giso/9d429ac49d6d18de6ebd2a3fb1f39269~c5_100x100.jpeg?x-expires=1688479200&x-signature=pjH5pwSS8Sg1dJqbB1GdCLXH6ew%3D',
    username: 'csjackie',
    description: 'Lol nvm #compsci #chatgpt #ai #openai #techtok',
    song: 'Original sound - Famed Flames',
    likes: 430,
    comments: 13,
    saves: 23,
    shares: 1,
  },
  {
    url: require('./videos/video2.mp4'),
    profilePic: 'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/eace3ee69abac57c39178451800db9d5~c5_100x100.jpeg?x-expires=1688479200&x-signature=wAkVmwL7lej15%2B16ypSWQOqTP8s%3D',
    username: 'dailydotdev',
    description: 'Every developer brain @francesco.ciulla #developerjokes #programming #programminghumor #programmingmemes',
    song: 'tarawarolin wants you to know this isnt my sound - Chaplain J Rob',
    likes: '13.4K',
    comments: 3121,
    saves: 254,
    shares: 420,
  },
  {
    url: require('./videos/video3.mp4'),
    profilePic: 'https://p77-sign-va.tiktokcdn.com/tos-maliva-avt-0068/4e6698b235eadcd5d989a665704daf68~c5_100x100.jpeg?x-expires=1688479200&x-signature=wkwHDKfNuIDqIVHNm29%2FRf40R3w%3D',
    username: 'wojciechtrefon',
    description: '#programming #softwareengineer #vscode #programmerhumor #programmingmemes',
    song: 'help so many people are using my sound - Ezra',
    likes: 5438,
    comments: 238,
    saves: 12,
    shares: 117,
  },
  {
    url: require('./videos/video4.mp4'),
    profilePic: 'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/4bda52cf3ad31c728153859262c329db~c5_100x100.jpeg?x-expires=1688486400&x-signature=ssUbbCpZFJj6uj33D%2BgtcqxMvgQ%3D',
    username: 'faruktutkus',
    description: 'Wait for the end | Im RTX 4090 TI | #softwareengineer #softwareengineer #coding #codinglife #codingmemes ',
    song: 'orijinal ses - Computer Science',
    likes: 9689,
    comments: 230,
    saves: 1037,
    shares: 967,
  },
];

function App() {
  const [videos, setVideos] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [loginError, setLoginError] = useState('');
  const videoRefs = useRef([]);

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

  const fetchRankedVideos = async () => {
    try {
      if (!token) {
        console.error('No token available');
        return;
      }

      const response = await fetch('https://oback.dacryptogame.com/api/videos/ranked', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Videos response:', data); // Debug log

      if (response.ok) {
        setVideos(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch videos:', data);
        if (response.status === 401) {
          // Token expired or invalid
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  // Add token persistence
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRankedVideos();
    }
  }, [isAuthenticated]);

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

  // This function handles the reference of each video
  const handleVideoRef = (index) => (ref) => {
    videoRefs.current[index] = ref;
  };

  return (
    <div className="app">
      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} error={loginError} />
      ) : (
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
              key={index}
              username={video.user}
              description={video.title}
              likes={video.likes}
              saves={video.saves}
              url={video.url}
              setVideoRef={handleVideoRef(index)}
              autoplay={index === 0}
            />
          ))}
          <BottomNavbar className="bottom-navbar" />
        </div>
      )}
    </div>
  );
}

export default App;
