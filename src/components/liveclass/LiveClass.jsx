import React, { useEffect, useRef, useState } from "react";
import "./LiveClass.css";
import { io } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';

const LiveClass = () => {
  const [socketId, setSocketId] = useState('');
  const [rtpCapabilities, setrtpCapabilities] = useState(null);
  const socketRef = useRef(null);

  const localVideo = useRef(null);
  const [mediaParams, setMediaParams] = useState({}); // renamed from params
  const deviceRef = useRef(null);
  const producerTransportRef = useRef(null);
  const producerRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  // Add states for UI feedback
  const [remoteVideoReady, setRemoteVideoReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remoteStream, setRemoteStream] = useState(null);

  const consumerTransportRef = useRef(null);
  const consumerRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:3001/mediasoup", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connection-success", (data) => {
      console.log("Connected with socket id:", data.socketId);
      setSocketId(data.socketId);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
      setError(`Connection error: ${err.message}`);
    });

    return () => {
      socket.off("connection-success");
      socket.disconnect();
    };
  }, []);

  // Effect to handle auto-play when remote stream is ready
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      
      // Try to autoplay - may be blocked by browser policies
      const playPromise = remoteVideoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Remote video playing automatically');
          })
          .catch(err => {
            console.warn('Autoplay prevented by browser:', err.message);
            // We'll let the user click play manually
          });
      }
    }
  }, [remoteStream]);

  console.log("socketid", socketId);

  const streamSuccess = async (stream) => {
    if (localVideo.current) {
      localVideo.current.srcObject = stream;
    }
    const track = stream.getVideoTracks()[0];

    setMediaParams((prev) => ({
      track,
      ...prev,
    }));
  };

  const handleGetLocalVideo = () => {
    setLoading(true);
    setError('');
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        streamSuccess(stream);
        setLoading(false);
      })
      .catch(err => {
        console.error("getUserMedia error:", err);
        setError(`Camera access error: ${err.message}`);
        setLoading(false);
      });
  };

  const handleGetRTPCapabilities = () => {
    setLoading(true);
    setError('');
    return new Promise((resolve, reject) => {
      socketRef.current.emit('getRouterRtpCapabilities');

      socketRef.current.once('routerRtpCapabilities', (rtpCapabilities) => {
        setrtpCapabilities(rtpCapabilities);
        console.log('Router RTP Capabilities:', rtpCapabilities);
        setLoading(false);
        resolve(rtpCapabilities);
      });

      socketRef.current.once('error', (error) => {
        setError(`RTP Capabilities error: ${error}`);
        setLoading(false);
        reject(error);
      });
    });
  };

  const handleCreateDevice = async () => {
    setLoading(true);
    setError('');
    if (!rtpCapabilities || !rtpCapabilities.codecs) {
      const errorMsg = "RTP Capabilities not ready. Please click button 2 first.";
      console.warn(errorMsg, rtpCapabilities);
      setError(errorMsg);
      setLoading(false);
      return;
    }
    try {
      const device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });
      deviceRef.current = device;
      console.log('Device created successfully');
      setLoading(false);
      return device;
    } catch (error) {
      console.error("Error creating device:", error);
      setError(`Device creation error: ${error.message}`);
      setLoading(false);
    }
  };

  const handleCreateSendTransport = () => {
    setLoading(true);
    setError('');
    
    if (!deviceRef.current || !deviceRef.current.loaded) {
      const errorMsg = "Device not created. Please complete steps 1-3 first.";
      setError(errorMsg);
      setLoading(false);
      return;
    }
    
    socketRef.current.emit('createWebRtcTransport', { sender: true });

    socketRef.current.once('createWebRtcTransport', ({ params, error }) => {
      if (error) {
        console.log(error);
        setError(`Transport creation error: ${error}`);
        setLoading(false);
        return;
      }

      console.log('Send transport params:', params);
      setLoading(false);
    });
  };

  const handleConnectSendTransportAndProduce = async () => {
    setLoading(true);
    setError('');
    
    const device = deviceRef.current;
    const track = mediaParams.track;
    
    console.log('Device loaded:', device?.loaded);
    console.log('Track before producing:', track);
    
    if (!device || !track) {
      const errorMsg = "Device or media track not ready. Please complete steps 1-4 first.";
      setError(errorMsg);
      setLoading(false);
      return;
    }

    if (producerTransportRef.current) {
      console.warn("Producer transport already exists:", producerTransportRef.current.id);
      
      try {
        producerTransportRef.current.close();
        console.log("Closed previous producer transport");
      } catch (err) {
        console.error("Failed to close previous producer transport:", err);
      }
      
      producerTransportRef.current = null;
    }
    
    
    console.log("Requesting server to create new WebRTC transport...");
    socketRef.current.emit('createWebRtcTransport', { sender: true });
    
    socketRef.current.once('createWebRtcTransport', async ({ params, error }) => {
      if (error) {
        console.error('Transport creation error:', error);
        setError(`Transport creation error: ${error}`);
        setLoading(false);
        return;
      }
      
      console.log('Transport parameters received from server:', params);
      
    
      const sendTransport = device.createSendTransport(params);
      producerTransportRef.current = sendTransport;
      
      console.log('Send transport created:', sendTransport.id);
      
      
      sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        console.log("Send transport 'connect' event fired");
        
        try {
        
          socketRef.current.once('transport-connect-response', (response) => {
            if (response && response.success) {
              console.log("Transport connected successfully");
              callback();
            } else {
              console.error("Transport connect failed:", response?.error || "Unknown error");
              setError(`Transport connect failed: ${response?.error || "Unknown error"}`);
              errback(new Error(response?.error || "Transport connect failed"));
            }
          });
          
          // Send the connect request
          socketRef.current.emit('transport-connect', {
            transportId: sendTransport.id,
            dtlsParameters,
          });
          
          console.log("Sent 'transport-connect' to server");
        } catch (error) {
          console.error('transport-connect error:', error);
          setError(`Transport connect error: ${error.message}`);
          errback(error);
        }
      });
      
     
      sendTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
        console.log("🎙️ Send transport 'produce' event fired", kind);
        
        try {
          // Switch to using the once/emit pattern since the server doesn't support callback properly
          socketRef.current.once('transport-produce-response', (response) => {
            if (response.error) {
              console.error('Transport produce error:', response.error);
              setError(`Transport produce error: ${response.error}`);
              errback(new Error(response.error));
              return;
            }
            
            console.log('Producer ID received from server:', response.id);
            callback({ id: response.id });
          });
          
          // Send the produce request to the server
          socketRef.current.emit(
            'transport-produce',
            {
              transportId: sendTransport.id,
              kind,
              rtpParameters,
              appData,
            }
          );
      
          console.log(`Sent transport-produce request for ${kind}`);
        } catch (error) {
          console.error('Emit error in transport-produce:', error);
          setError(`Transport produce error: ${error.message}`);
          errback(error);
        }
      });
      
      console.log("Send transport 'produce' event listener attached");
      
      
      try {
        console.log("Calling sendTransport.produce with track:", track?.kind);
        
        const producer = await sendTransport.produce({ track });
        
        console.log("Producer successfully created:", {
          id: producer.id,
          kind: producer.kind,
          paused: producer.paused,
          closed: producer.closed
        });
        
        producerRef.current = producer;
        
        producer.on('transportclose', () => {
          console.warn('Producer transport closed');
          // Cleanup if needed
        });
        
        producer.on('trackended', () => {
          console.log('Producer track ended');
          // Handle track end if needed
        });
        
        setLoading(false);
        
      } catch (err) {
        console.error('Produce failed:', err);
        setError(`Produce failed: ${err.message}`);
        setLoading(false);
      }
    });
  };
  
  
  const handleCreateRecvTransport = () => {
    setLoading(true);
    setError('');
    
    if (!deviceRef.current || !deviceRef.current.loaded) {
      const errorMsg = "Device not created. Please complete steps 1-5 first.";
      setError(errorMsg);
      setLoading(false);
      return;
    }
    
    socketRef.current.emit('createWebRtcTransport', { sender: false });
  
    socketRef.current.once('createWebRtcTransport', ({ params, error }) => {
      if (error) {
        console.log(error);
        setError(`Receive transport error: ${error}`);
        setLoading(false);
        return;
      }
  
      console.log('Receive transport params:', params);
      
      // Create the receive transport
      consumerTransportRef.current = deviceRef.current.createRecvTransport(params);
      
      // Set up transport connection listeners
      consumerTransportRef.current.on('connect', ({ dtlsParameters }, callback, errback) => {
        socketRef.current.emit('transport-connect', {
          transportId: consumerTransportRef.current.id,
          dtlsParameters
        });
        
        socketRef.current.once('transport-connect-response', (response) => {
          if (response.success) {
            callback();
          } else {
            setError(`Consumer transport connect error: ${response.error || 'Unknown error'}`);
            errback(new Error(response.error || 'Failed to connect transport'));
          }
        });
      });
      
      console.log('Consumer transport created:', consumerTransportRef.current.id);
      setLoading(false);
    });
  };

  const handleConnectRecvTransportAndConsume = () => {
    setLoading(true);
    setError('');
    setRemoteVideoReady(false);
    setRemoteStream(null); // Reset remote stream
    
    if (!consumerTransportRef.current) {
      const errorMsg = "Receive transport not created. Please click button 6 first.";
      setError(errorMsg);
      setLoading(false);
      return;
    }
    
    // Get the producer ID - In a 1:1 case, we can simply consume the producer from the other participant
    socketRef.current.emit('get-producers');
    
    socketRef.current.once('producers-list', async ({ producers }) => {
      if (!producers || producers.length === 0) {
        console.log('No producers available to consume');
        setError('No video streams available to consume. Make sure another participant is sharing video.');
        setLoading(false);
        return;
      }
      
      console.log('Available producers:', producers);
      
      // For 1:1, just consume the first available producer
      const producerId = producers[0].producerId;
      
      // Proceed with consumption
      socketRef.current.emit('consume', {
        rtpCapabilities: deviceRef.current.rtpCapabilities,
        remoteProducerId: producerId,
        transportId: consumerTransportRef.current.id
      });
      
      socketRef.current.once('consume', async (response) => {
        if (response.error) {
          console.error('Consume error:', response.error);
          setError(`Consume error: ${response.error}`);
          setLoading(false);
          return;
        }
        
        console.log('Consume response:', response);
        
        try {
          // Create consumer
          const consumer = await consumerTransportRef.current.consume({
            id: response.id,
            producerId: response.producerId,
            kind: response.kind,
            rtpParameters: response.rtpParameters
          });
          
          consumerRef.current = consumer;
          
          // Create a new MediaStream from the consumer's track
          const stream = new MediaStream();
          stream.addTrack(consumer.track);
          
          // Store the stream in state
          setRemoteStream(stream);
          
          // Resume the consumer to start receiving media
          socketRef.current.emit('consumer-resume');
          
          // Set state to indicate remote video is ready
          setRemoteVideoReady(true);
          console.log('Consumer created and stream ready');
          
          setLoading(false);
        } catch (err) {
          console.error('Consumer creation failed:', err);
          setError(`Consumer creation failed: ${err.message}`);
          setLoading(false);
        }
      });
    });
  };
  
  // Handle manual play for remote video
  const handlePlayRemoteVideo = () => {
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.play()
        .then(() => {
          console.log('Remote video playing successfully');
        })
        .catch((err) => {
          console.error('Manual play error:', err);
          setError(`Manual play error: ${err.message}. Please try clicking again.`);
        });
    } else {
      setError('No video stream available. Please complete steps 6 and 7 first.');
    }
  };

  return (
    <div className="liveclass-container">
      <div className="video-section">
        <h2 className="section-title">Local Video</h2>
        <video
          className="video-box"
          id="localVideo"
          ref={localVideo}
          autoPlay
          playsInline
          muted
        ></video>

        <div className="button-group">
          <button onClick={handleGetLocalVideo} disabled={loading}>1. Get Local Video</button>
          <button onClick={handleGetRTPCapabilities} disabled={loading}>2. Get RTP Capabilities</button>
          <button onClick={handleCreateDevice} disabled={loading}>3. Create Device</button>
          <button onClick={handleCreateSendTransport} disabled={loading}>4. Create Send Transport</button>
          <button onClick={handleConnectSendTransportAndProduce} disabled={loading}>
            5. Connect Send Transport and Produce
          </button>
        </div>
        <p>socket id: {socketId}</p>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="video-section">
        <div className="video-box">
          <h2 className="section-title">Remote Video</h2>
          {remoteVideoReady ? (
            <>
              <video 
                ref={remoteVideoRef} 
                className="remote-video"
                playsInline 
                autoPlay
                onClick={handlePlayRemoteVideo}
                style={{ cursor: 'pointer', width: '100%', height: 'auto' }}
              />
              <div className="play-indicator">
                <button 
                  onClick={handlePlayRemoteVideo}
                  className="play-button"
                >
                  Play Remote Video
                </button>
                <p className="helper-text">Click the video or button to play</p>
              </div>
            </>
          ) : (
            <>
              <div className="empty-video-placeholder">
                {loading ? <div className="spinner">Loading...</div> : "No remote video"}
              </div>
            </>
          )}
        </div>
        <div className="button-group">
          <button onClick={handleCreateRecvTransport} disabled={loading}>6. Create Recv Transport</button>
          <button onClick={handleConnectRecvTransportAndConsume} disabled={loading}>
            7. Connect Recv Transport and Consume
          </button>
        </div>
        <div className="connection-status">
          <p>Consumer status: {remoteVideoReady ? "Connected" : "Not connected"}</p>
          {remoteVideoReady && !loading && (
            <p className="success-message">Remote video ready! Click to play if not playing automatically.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveClass;