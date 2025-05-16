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
    });

    return () => {
      socket.off("connection-success");
      socket.disconnect();
    };
  }, []);

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
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => streamSuccess(stream))
      .catch(err => console.error("getUserMedia error:", err));
  };

  const handleGetRTPCapabilities = () => {
    return new Promise((resolve, reject) => {
      socketRef.current.emit('getRouterRtpCapabilities');

      socketRef.current.on('routerRtpCapabilities', (rtpCapabilities) => {
        setrtpCapabilities(rtpCapabilities);
        console.log('Router RTP Capabilities:', rtpCapabilities);
        resolve(rtpCapabilities);
      });

      socketRef.current.on('error', (error) => {
        reject(error);
      });
    });
  };

  const handleCreateDevice = async () => {
    if (!rtpCapabilities || !rtpCapabilities.codecs) {
      console.warn("RTP Capabilities not ready:", rtpCapabilities);
      return;
    }
    try {
      const device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });
      deviceRef.current = device;
      console.log('Device created successfully');
      return device;
    } catch (error) {
      console.error("Error creating device:", error);
    }
  };

  const handleCreateSendTransport = () => {
    socketRef.current.emit('createWebRtcTransport', { sender: true });

    socketRef.current.on('createWebRtcTransport', ({ params }) => {
      if (params.error) {
        console.log(params.error);
        return;
      }

      console.log('Send transport params:', params);
    });
  };

  const handleConnectSendTransportAndProduce = async () => {
    const device = deviceRef.current;
    const track = mediaParams.track;
    
    console.log('Device loaded:', device?.loaded);
    console.log('Track before producing:', track);
    
    if (!device || !track) {
      console.warn("Device or media track not ready");
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
    
    socketRef.current.once('createWebRtcTransport', async ({ params }) => {
      if (params.error) {
        console.error('Transport creation error:', params.error);
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
        
        // Notify application that producer is ready (optional)
        // setIsProducing(true); // Uncomment if you have such state
        
      } catch (err) {
        console.error('Produce failed:', err);
      }
    });
  };
  
  
  const handleCreateRecvTransport = () => {
    socketRef.current.emit('createWebRtcTransport', { sender: false });
  
    socketRef.current.on('createWebRtcTransport', ({ params }) => {
      if (params.error) {
        console.log(params.error);
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
            errback(new Error(response.error || 'Failed to connect transport'));
          }
        });
      });
      
      console.log('Consumer transport created:', consumerTransportRef.current.id);
    });
  };

  const handleConnectRecvTransportAndConsume = () => {
    // Get the producer ID - In a 1:1 case, we can simply consume the producer from the other participant
    // Assuming you have a way to get the producer ID (e.g., through a call to get-producers)
    // For simplicity, assuming there's only one producer to consume
    socketRef.current.emit('get-producers');
    
    socketRef.current.once('producers-list', async ({ producers }) => {
      if (!producers || producers.length === 0) {
        console.log('No producers available to consume');
        return;
      }
      
      // For 1:1, just consume the first available producer
      const producerId = producers[0].producerId;
      
      // Proceed with consumption
      socketRef.current.emit('consume', {
        rtpCapabilities: deviceRef.current.rtpCapabilities,
        remoteProducerId: producerId,
        transportId: consumerTransportRef.current.id
      });
      
      socketRef.current.once('consume', async ({ params }) => {
        if (params.error) {
          console.error('Consume error:', params.error);
          return;
        }
        
        // Create consumer
        const consumer = await consumerTransportRef.current.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters
        });
        
        consumerRef.current = consumer;
        
        // Create a new MediaStream from the consumer's track
        const stream = new MediaStream();
        stream.addTrack(consumer.track);
        
        // Set the stream to the remote video element
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.play().catch((err) => console.error('Autoplay error:', err));
        }
          remoteVideoRef.current.play()
            .then(() => {
              console.log('Remote video playing successfully');
            })
            .catch((err) => {
              console.error('Autoplay error:', err);
              // Add a UI indicator for user to click to play
              alert('Please click on the video to play it (autoplay blocked by browser)');
              
              // Add a click event listener to play on user interaction
              remoteVideoRef.current.addEventListener('click', () => {
                remoteVideoRef.current.play();
              });
            });
        
        // Resume the consumer to start receiving media
        socketRef.current.emit('consumer-resume');
        
        console.log('Consumer created and stream connected to remote video element');
      });
    });
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
          <button onClick={handleGetLocalVideo}>1. Get Local Video</button>
          <button onClick={handleGetRTPCapabilities}>2. Get RTP Capabilities</button>
          <button onClick={handleCreateDevice}>3. Create Device</button>
          <button onClick={handleCreateSendTransport}>4. Create Send Transport</button>
          <button onClick={handleConnectSendTransportAndProduce}>
            5. Connect Send Transport and Produce
          </button>
        </div>
        <p>socket id: {socketId}</p>
      </div>

      <div className="video-section">
        <div  className="video-box">
        <h2 className="section-title">Remote Video</h2>
        <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            muted={false}
          />
        </div>
        <div className="button-group">
          <button onClick={handleCreateRecvTransport}>6. Create Recv Transport</button>
          <button onClick={handleConnectRecvTransportAndConsume}>
            7. Connect Recv Transport and Consume
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveClass;
