import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Device } from "mediasoup-client";
import "./LiveClass.css";

function LiveClass() {
  const videoRef = useRef(null);
  const [params, setParams] = useState({
    encoding: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 },
  });
  const [device, setDevice] = useState(null);
  const [socket, setSocket] = useState(null);
  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  const [producerTransport, setProducerTransport] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    console.log("Initializing Socket.IO connection");
    const socket = io("http://localhost:4000/mediasoup");
    setSocket(socket);
    console.log("Socket.IO instance created:", socket);
    socket.on("connection-success", (data) => {
      console.log("Received connection-success:", data);
      socket.emit("setBroadcaster", () => {
        console.log("Emitted setBroadcaster");
      });
    });
    socket.on("viewerCount", ({ count }) => {
      console.log(`Received viewer count: ${count}`);
      setViewerCount(count);
    });
    socket.on("connect_error", (error) => {
      console.error("Socket.IO connect error:", error);
    });
    return () => {
      console.log("Disconnecting Socket.IO");
      socket.disconnect();
    };
  }, []);

  const startCamera = async () => {
    try {
      console.log("Requesting camera access");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log("Camera stream acquired:", stream);
      if (videoRef.current) {
        const track = stream.getVideoTracks()[0];
        console.log("Video track:", track);
        videoRef.current.srcObject = stream;
        setParams((current) => {
          const newParams = { ...current, track };
          console.log("Updated params with track:", newParams);
          return newParams;
        });
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const getRouterRtpCapabilities = () => {
    console.log("Emitting getRouterRtpCapabilities");
    socket.emit("getRouterRtpCapabilities", (data) => {
      console.log("Received routerRtpCapabilities:", data);
      setRtpCapabilities(data.routerRtpCapabilities);
      console.log("Set rtpCapabilities state:", data.routerRtpCapabilities);
    });
  };

  const createDevice = async () => {
    if (!rtpCapabilities) {
      console.log("Cannot create device: rtpCapabilities is null");
      alert("Please get Router RTP Capabilities first!");
      return;
    }
    try {
      console.log("Creating mediasoup Device with rtpCapabilities:", rtpCapabilities);
      const newDevice = new Device();
      await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
      console.log("Device loaded successfully:", newDevice);
      setDevice(newDevice);
      console.log("Set device state:", newDevice);
    } catch (error) {
      console.error("Error creating device:", error);
      if (error.name === "UnsupportedError") {
        console.error("Browser not supported");
      }
    }
  };

  const createSendTransport = () => {
    if (!device) {
      console.log("Cannot create send transport: device is null");
      alert("Please create a Device first!");
      return;
    }
    console.log("Emitting createTransport for sender");
    socket.emit("createTransport", { sender: true }, ({ params }) => {
      console.log("Received createTransport response:", params);
      if (params.error) {
        console.error("Error in createTransport:", params.error);
        return;
      }
      const transport = device?.createSendTransport(params);
      console.log("Created send transport:", transport);
      setProducerTransport(transport);
      console.log("Set producerTransport state:", transport);
      transport?.on("connect", ({ dtlsParameters }, callback, errback) => {
        console.log("Send transport connect event, dtlsParameters:", dtlsParameters);
        try {
          socket.emit("connectProducerTransport", { dtlsParameters });
          console.log("Emitted connectProducerTransport");
          callback();
          console.log("Called connect callback");
        } catch (error) {
          console.error("Error in connectProducerTransport:", error);
          errback(error);
        }
      });
      transport?.on("produce", (parameters, callback, errback) => {
        const { kind, rtpParameters } = parameters;
        console.log("Send transport produce event, parameters:", parameters);
        try {
          socket.emit("transport-produce", { kind, rtpParameters }, ({ id }) => {
            console.log("Received transport-produce response, producer ID:", id);
            callback({ id });
            console.log("Called produce callback with ID:", id);
          });
          console.log("Emitted transport-produce");
        } catch (error) {
          console.error("Error in transport-produce:", error);
          errback(error);
        }
      });
    });
  };

  const connectSendTransport = async () => {
    if (!producerTransport) {
      console.log("Cannot connect send transport: producerTransport is null");
      alert("Please create a Send Transport first!");
      return;
    }
    try {
      console.log("Producing media with params:", params);
      const localProducer = await producerTransport?.produce(params);
      console.log("Created local producer:", localProducer);
      localProducer?.on("trackended", () => console.log("Producer track ended"));
      localProducer?.on("transportclose", () => console.log("Producer transport closed"));
    } catch (error) {
      console.error("Error producing media:", error);
    }
  };

  return (
    <main className="main">
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline className="video" />
      </div>
      <div className="status">Viewers: {viewerCount}</div>
      <div className="button-container">
        <button onClick={startCamera} className="button">
          Start Camera
        </button>
        <button onClick={getRouterRtpCapabilities} className="button">
          Get Router RTP Capabilities
        </button>
        <button onClick={createDevice} className="button">
          Create Device
        </button>
        <button onClick={createSendTransport} className="button">
          Create Send Transport
        </button>
        <button onClick={connectSendTransport} className="button">
          Connect Send Transport
        </button>
      </div>
    </main>
  );
}

export default LiveClass;