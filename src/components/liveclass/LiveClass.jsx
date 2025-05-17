import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Device } from "mediasoup-client";
import "./LiveClass.css";

function LiveClass() {
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
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
  const [consumerTransport, setConsumerTransport] = useState(null);

  useEffect(() => {
    console.log("Initializing Socket.IO connection");
    const socket = io("http://localhost:4000/mediasoup");
    setSocket(socket);
    console.log("Socket.IO instance created:", socket);
    socket.on("connection-success", (data) => {
      console.log("Received connection-success:", data);
      startCamera();
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
        return;
      }
      const transport = device?.createRecvTransport(params);
      console.log("Created receive transport:", transport);
      setConsumerTransport(transport);
      console.log("Set consumerTransport state:", transport);
      transport?.on("connect", ({ dtlsParameters }, callback, errback) => {
        console.log("Receive transport connect event, dtlsParameters:", dtlsParameters);
        try {
          socket.emit("connectConsumerTransport", { dtlsParameters });
          console.log("Emitted connectConsumerTransport");
          callback();
          console.log("Called connect callback");
        } catch (error) {
          console.error("Error in connectConsumerTransport:", error);
          errback(error);
        }
      });
    });
  };

  const connectRecvTransport = () => {
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
        return;
      }
      try {
        const consumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });
        console.log("Created consumer:", consumer);
        const { track } = consumer;
        console.log("Consumer track:", track);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = new MediaStream([track]);
          console.log("Attached track to remote video element");
        }
        socket.emit("resumePausedConsumer", () => {
          console.log("Emitted resumePausedConsumer");
        });
      } catch (error) {
        console.error("Error consuming media:", error);
      }
    });
  };

  return (
    <main className="main">
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline className="video" />
        <video ref={remoteVideoRef} autoPlay playsInline className="video" />
      </div>
      <div className="button-container">
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

export default LiveClass;