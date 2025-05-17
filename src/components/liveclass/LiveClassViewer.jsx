import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Device } from "mediasoup-client";
import "./LiveClass.css";

function LiveClassViewer() {
  const cameraVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const [device, setDevice] = useState(null);
  const [socket, setSocket] = useState(null);
  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  const [consumerTransport, setConsumerTransport] = useState(null);
  const [status, setStatus] = useState("Waiting for broadcaster...");
  const [consumers, setConsumers] = useState({ camera: null, audio: null, screen: null });

  useEffect(() => {
    console.log("Initializing Socket.IO connection");
    const socket = io("http://localhost:4000/mediasoup");
    setSocket(socket);
    console.log("Socket.IO instance created:", socket);
    socket.on("connection-success", (data) => {
      console.log("Received connection-success:", data);
    });
    socket.on("broadcasterDisconnected", () => {
      console.log("Received broadcasterDisconnected");
      setStatus("Broadcaster disconnected");
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = null;
      }
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      setConsumers({ camera: null, audio: null, screen: null });
    });
    socket.on("connect_error", (error) => {
      console.error("Socket.IO connect error:", error);
      setStatus("Connection error");
    });
    return () => {
      console.log("Disconnecting Socket.IO");
      socket.disconnect();
    };
  }, []);

  const getRouterRtpCapabilities = () => {
    console.log("Emitting getRouterRtpCapabilities");
    socket.emit("getRouterRtpCapabilities", (data) => {
      console.log("Received routerRtpCapabilities:", data);
      setRtpCapabilities(data.routerRtpCapabilities);
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
      console.log("Device RTP capabilities:", newDevice.rtpCapabilities);
      setDevice(newDevice);
    } catch (error) {
      console.error("Error creating device:", error);
      if (error.name === "UnsupportedError") {
        console.error("Browser not supported");
      }
      setStatus("Error creating device");
      alert("Failed to create device");
    }
  };

  const createRecvTransport = () => {
    if (!device) {
      console.log("Cannot create receive transport: device is null");
      alert("Please create a Device first!");
      return;
    }
    console.log("Emitting createTransport for receiver");
    socket.emit("createTransport", { sender: false }, ({ params }) => {
      console.log("Received createTransport response for receiver:", params);
      if (params.error) {
        console.error("Error in createTransport:", params.error);
        setStatus("Error creating transport");
        alert("Failed to create transport");
        return;
      }
      const transport = device?.createRecvTransport(params);
      console.log("Created receive transport:", transport);
      setConsumerTransport(transport);
      transport?.on("connect", ({ dtlsParameters }, callback, errback) => {
        console.log("Receive transport connect event, dtlsParameters:", dtlsParameters);
        try {
          socket.emit("connectConsumerTransport", { dtlsParameters });
          console.log("Emitted connectConsumerTransport");
          callback();
        } catch (error) {
          console.error("Error in connectConsumerTransport:", error);
          errback(error);
          setStatus("Error connecting transport");
        }
      });
    });
  };

  const connectRecvTransport = async () => {
    if (!consumerTransport) {
      console.log("Cannot connect receive transport: consumerTransport is null");
      alert("Please create a Receive Transport first!");
      return;
    }
    console.log("Emitting consumeMedia with rtpCapabilities:", device?.rtpCapabilities);
    socket.emit("consumeMedia", { rtpCapabilities: device?.rtpCapabilities }, async ({ params }) => {
      console.log("Received consumeMedia response:", params);
      if (params.error) {
        console.error("Error in consumeMedia:", params.error);
        setStatus("No broadcaster available");
        return;
      }
      try {
        const newConsumers = { camera: null, audio: null, screen: null };
        const producerIds = [];
        for (const param of params) {
          const { id, producerId, kind, rtpParameters, label } = param;
          try {
            const consumer = await consumerTransport.consume({
              id,
              producerId,
              kind,
              rtpParameters,
            });
            console.log(`Created consumer for ${kind} (${label}):`, consumer);
            const { track } = consumer;
            console.log(`Consumer track for ${kind} (${label}):`, track);
            if (kind === "video" && label === "camera" && cameraVideoRef.current) {
              const stream = new MediaStream([track]);
              cameraVideoRef.current.srcObject = stream;
              cameraVideoRef.current.play().catch(error => {
                console.error("Error playing camera video:", error);
                setStatus("Error playing camera video");
              });
              newConsumers.camera = consumer;
            } else if (kind === "video" && label === "screen" && screenVideoRef.current) {
              const stream = new MediaStream([track]);
              screenVideoRef.current.srcObject = stream;
              screenVideoRef.current.play().catch(error => {
                console.error("Error playing screen video:", error);
                setStatus("Error playing screen video");
              });
              newConsumers.screen = consumer;
            } else if (kind === "audio") {
              const stream = cameraVideoRef.current?.srcObject || new MediaStream();
              stream.addTrack(track);
              if (cameraVideoRef.current) {
                cameraVideoRef.current.srcObject = stream;
                cameraVideoRef.current.play().catch(error => {
                  console.error("Error playing audio:", error);
                  setStatus("Error playing audio");
                });
              }
              newConsumers.audio = consumer;
            }
            producerIds.push(producerId);
          } catch (error) {
            console.error(`Error creating consumer for ${kind} (${label}):`, error);
            setStatus(`Error creating consumer for ${kind} (${label})`);
          }
        }
        setConsumers(newConsumers);
        setStatus(producerIds.length > 0 ? "Watching broadcaster" : "No streams available");
        if (producerIds.length > 0) {
          socket.emit("resumePausedConsumers", producerIds, () => {
            console.log("Emitted resumePausedConsumers for producerIds:", producerIds);
          });
        }
      } catch (error) {
        console.error("Error consuming media:", error);
        setStatus("Error consuming media");
      }
    });
  };

  return (
    <main className="main">
      <div className="video-container">
        <div className="video-wrapper">
          <video ref={cameraVideoRef} autoPlay playsInline className="video" />
          <span className="video-label">Camera</span>
        </div>
        <div className="video-wrapper">
          <video ref={screenVideoRef} autoPlay playsInline className="video" />
          <span className="video-label">Screen Share</span>
        </div>
      </div>
      <div className="status">{status}</div>
      <div className="button-container">
        <button onClick={getRouterRtpCapabilities} className="button">
          Get Router RTP Capabilities
        </button>
        <button onClick={createDevice} className="button">
          Create Device
        </button>
        <button onClick={createRecvTransport} className="button">
          Create Receive Transport
        </button>
        <button onClick={connectRecvTransport} className="button">
          Connect Receive Transport
        </button>
      </div>
    </main>
  );
}

export default LiveClassViewer;