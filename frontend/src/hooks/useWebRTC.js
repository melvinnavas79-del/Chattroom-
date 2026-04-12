import { useEffect, useRef, useState } from 'react';

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export const useWebRTC = (roomId, currentUser, API) => {
  const [peers, setPeers] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  
  const wsRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const audioContextRef = useRef(null);
  const analyserRef = useRef({});

  useEffect(() => {
    initializeWebRTC();
    return () => cleanup();
  }, [roomId, currentUser.id]);

  const initializeWebRTC = async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      localStreamRef.current = stream;

      // Connect to signaling server
      const wsUrl = API.replace('https', 'wss').replace('http', 'ws').replace('/api', '');
      wsRef.current = new WebSocket(`${wsUrl}/ws/room/${roomId}/${currentUser.id}`);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
      };

      wsRef.current.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        await handleSignalingMessage(message);
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      alert('No se pudo acceder al micrófono. Por favor permite el acceso.');
    }
  };

  const handleSignalingMessage = async (message) => {
    switch (message.type) {
      case 'existing-users':
        // Create peer connections to existing users
        for (const userId of message.users) {
          await createPeerConnection(userId, true);
        }
        break;

      case 'user-joined':
        // New user joined, they will send us an offer
        console.log(`User ${message.userId} joined`);
        break;

      case 'offer':
        await handleOffer(message.offer, message.fromUser);
        break;

      case 'answer':
        await handleAnswer(message.answer, message.fromUser);
        break;

      case 'ice-candidate':
        await handleIceCandidate(message.candidate, message.fromUser);
        break;

      case 'user-left':
        handleUserLeft(message.userId);
        break;

      case 'user-muted':
        handleUserMuted(message.userId, message.muted);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const createPeerConnection = async (userId, shouldCreateOffer) => {
    const peerConnection = new RTCPeerConnection(STUN_SERVERS);
    peerConnectionsRef.current[userId] = peerConnection;

    // Add local audio stream
    localStreamRef.current.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStreamRef.current);
    });

    // Handle incoming audio stream
    peerConnection.ontrack = (event) => {
      console.log(`📻 Receiving audio from ${userId}`);
      const remoteAudio = new Audio();
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play();

      // Setup audio visualization
      setupAudioAnalyzer(userId, event.streams[0]);

      setPeers(prev => ({
        ...prev,
        [userId]: { stream: event.streams[0], audio: remoteAudio }
      }));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetUser: userId
        });
      }
    };

    // Create offer if this is the initiator
    if (shouldCreateOffer) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      sendSignalingMessage({
        type: 'offer',
        offer: offer,
        targetUser: userId
      });
    }

    return peerConnection;
  };

  const handleOffer = async (offer, fromUser) => {
    const peerConnection = await createPeerConnection(fromUser, false);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    sendSignalingMessage({
      type: 'answer',
      answer: answer,
      targetUser: fromUser
    });
  };

  const handleAnswer = async (answer, fromUser) => {
    const peerConnection = peerConnectionsRef.current[fromUser];
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleIceCandidate = async (candidate, fromUser) => {
    const peerConnection = peerConnectionsRef.current[fromUser];
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const handleUserLeft = (userId) => {
    if (peerConnectionsRef.current[userId]) {
      peerConnectionsRef.current[userId].close();
      delete peerConnectionsRef.current[userId];
    }
    
    if (peers[userId]?.audio) {
      peers[userId].audio.pause();
    }

    setPeers(prev => {
      const newPeers = { ...prev };
      delete newPeers[userId];
      return newPeers;
    });

    setSpeakingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  const handleUserMuted = (userId, muted) => {
    if (peers[userId]?.audio) {
      peers[userId].audio.muted = muted;
    }
  };

  const setupAudioAnalyzer = (userId, stream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const analyser = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    
    analyserRef.current[userId] = analyser;

    // Monitor audio levels
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      if (average > 30) {
        setSpeakingUsers(prev => new Set(prev).add(userId));
      } else {
        setSpeakingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
      
      if (peerConnectionsRef.current[userId]) {
        requestAnimationFrame(checkAudioLevel);
      }
    };
    checkAudioLevel();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);

      sendSignalingMessage({
        type: 'mute',
        muted: !audioTrack.enabled
      });
    }
  };

  const sendSignalingMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const cleanup = () => {
    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Stop all remote audio
    Object.values(peers).forEach(peer => {
      if (peer.audio) peer.audio.pause();
    });

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  return {
    isMuted,
    isConnected,
    speakingUsers,
    toggleMute,
    peers
  };
};
