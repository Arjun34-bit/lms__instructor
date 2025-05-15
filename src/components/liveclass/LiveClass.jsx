import React, { useEffect, useRef, useState } from "react";
import "./LiveClass.css";
import { io } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';

const LiveClass = () => {
    const [socketId, setSocketId] = useState('');
    const [rtpCapabilities, setrtpCapabilities] = useState(null);

    const localVideo = useRef(null);
    const [params, setParams] = useState({});
    

  useEffect(() => {
    const socket = io("http://localhost:3001/mediasoup", {
        transports: ["websocket"],
      });
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



  console.log("socketid",socketId);

  const streamSuccess = async (stream) => {
    if (localVideo.current) {
      localVideo.current.srcObject = stream;
    }
    const track = stream.getVideoTracks()[0];

    setParams((prevParams) => ({
      track,
      ...prevParams,
    }));
  };
  

  const handleGetLocalVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => streamSuccess(stream))
      .catch(err => console.error("getUserMedia error:", err));
  };

  const handleGetRTPCapabilities = () => {
    const socket = io("http://localhost:3001/mediasoup", {
        transports: ["websocket"],
      });
    return new Promise((resolve, reject) => {
        socket.emit('getRouterRtpCapabilities');
    
        socket.on('routerRtpCapabilities', (rtpCapabilities) => {
            setrtpCapabilities(rtpCapabilities)
          console.log('Router RTP Capabilities:', rtpCapabilities);
          resolve(rtpCapabilities);
        });
    
        socket.on('error', (error) => {
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
      await device.load({
        routerRtpCapabilities: rtpCapabilities, 
      });
  
      console.log('RTP Capabilities:', rtpCapabilities);
      console.log('Device created successfully');
      return device;
    } catch (error) {
      console.error("Error creating device:", error);
    }
  };
  

  const handleCreateSendTransport = () => {
    // TODO: Create send transport
  };

  const handleConnectSendTransportAndProduce = () => {
    // TODO: Connect send transport and produce stream
  };

  const handleCreateRecvTransport = () => {
    // TODO: Create receive transport
  };

  const handleConnectRecvTransportAndConsume = () => {
    // TODO: Connect receive transport and consume stream
  };

  return (
    <div className="liveclass-container">
      <div className="video-section">
        <h2 className="section-title" >Local Video</h2>
        <video
  className="video-box"
  id="localVideo"
  ref={localVideo}
  autoPlay
  playsInline
  muted
//   style={{ width: '640px', height: '360px' }}
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
        <p>socket id:{socketId}</p>
      </div>

      <div className="video-section">
        <h2 className="section-title">Remote Video</h2>
        <div className="video-box" id="remoteVideo">
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
