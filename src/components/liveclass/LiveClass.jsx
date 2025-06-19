import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Device } from "mediasoup-client";
import "./LiveClass.css";
import WhiteBoard from "./WhiteBoard";

import { MdScreenShare, MdStopScreenShare } from "react-icons/md";
import { MdDraw } from "react-icons/md";
import { BsCameraVideoFill, BsCameraVideoOffFill } from "react-icons/bs";
import { BiSolidMicrophone, BiSolidMicrophoneOff } from "react-icons/bi";
import ConsumerBox from "./ConsumerBox";
import { useParams } from "react-router-dom";

function LiveClass() {
  const initializedRef = useRef(false);

  const cameraVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const [device, setDevice] = useState(null);
  const [socket, setSocket] = useState(null);
  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  const [producerTransport, setProducerTransport] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [cameraStream, setCameraStream] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [producers, setProducers] = useState({
    camera: null,
    audio: null,
    screen: null,
    canvas: null,
  });

  const [remoteProducers, setRemoteProducers] = useState([]);

  const [canvasStream, setCanvasStream] = useState(null);

  const [toggleCamera, setToggleCamera] = useState(false);
  const [toggleAudio, setToggleAudio] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [toggleBoard, setToggleBoard] = useState(false);

  const { classId } = useParams();

  useEffect(() => {
    console.log("Initializing Socket.IO connection");
    const socket = io("http://localhost:8287/mediasoup");
    setSocket(socket);
    console.log("Socket.IO instance created:", socket);
    socket.on("connection-success", (data) => {
      console.log("Received connection-success:", data);
      // socket.emit("setBroadcaster", () => {
      //   console.log("Emitted setBroadcaster");
      // });
    });
    // socket.on("viewerCount", ({ count }) => {
    //   console.log(`Received viewer count: ${count}`);
    //   setViewerCount(count);
    // });

    socket.emit("join-room", { roomId: classId }, (data) => {
      console.log("Join room response:", data);
      if (data?.rtpCapabilities) {
        setRtpCapabilities(data.rtpCapabilities);
      } else {
        console.error("Failed to get RTP Capabilities");
      }
    });

    const handleUserCount = ({ roomId, userCount }) => {
      console.log("User count updated:", userCount);
      setViewerCount(userCount);
    };

    socket.on("room-user-count", handleUserCount);
    socket.on("connect_error", (error) => {
      console.error("Socket.IO connect error:", error);
    });
    return () => {
      socket.off("room-user-count", handleUserCount);
      console.log("Disconnecting Socket.IO");
      socket.disconnect();
    };
  }, [classId]);

  useEffect(() => {
    console.log("hello");
    if (!socket) return;

    socket.on("new-producer", async (data) => {
      console.log("New producer available", data);

      setRemoteProducers((prev) => {
        const exists = prev.some((p) => p.producerId === data.producerId);
        if (!exists) {
          return [...prev, data];
        }
        return prev;
      });
    });

    console.log("remote producer", remoteProducers);

    return () => {
      socket.off("new-producer");
    };
  }, [socket, classId]);

  const startCamera = async () => {
    try {
      console.log("Requesting camera access");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log("Camera stream acquired:", stream);
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length === 0) {
        throw new Error("No video tracks in camera stream");
      }
      console.log("Camera video tracks:", videoTracks);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current
          .play()
          .catch((error) =>
            console.error("Error playing camera video:", error)
          );
      }
      setCameraStream(stream);

      await connectSendTransport("camera", stream);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Failed to access camera");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      console.log("Stopping camera stream");
      cameraStream.getTracks().forEach((track) => track.stop());
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = null;
      }
      if (producers.camera) {
        producers.camera.close();
      }
      setCameraStream(null);
      setProducers((prev) => ({ ...prev, camera: null }));
    }
  };

  const startAudio = async () => {
    try {
      console.log("Requesting audio access");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Audio stream acquired:", stream);
      setAudioStream(stream);
      await connectSendTransport("audio", stream);
    } catch (error) {
      console.error("Error accessing audio:", error);
      alert("Failed to access microphone");
    }
  };

  const stopAudio = () => {
    if (audioStream) {
      console.log("Stopping audio stream");
      audioStream.getTracks().forEach((track) => track.stop());
      if (producers.audio) {
        producers.audio.close();
      }
      setAudioStream(null);
      setProducers((prev) => ({ ...prev, audio: null }));
    }
  };

  const startScreenShare = async () => {
    try {
      console.log("Requesting screen share access");
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      console.log("Screen share stream acquired:", stream);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current
          .play()
          .catch((error) =>
            console.error("Error playing screen video:", error)
          );
      }
      setScreenStream(stream);
      await connectSendTransport("screen", stream);
      stream.getVideoTracks()[0].onended = () => {
        console.log("Screen share ended");
        stopScreenShare();
      };
    } catch (error) {
      console.error("Error accessing screen share:", error);
      alert("Failed to start screen share");
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      console.log("Stopping screen share stream");
      screenStream.getTracks().forEach((track) => track.stop());
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      if (producers.screen) {
        producers.screen.close();
      }
      setScreenStream(null);
      setProducers((prev) => ({ ...prev, screen: null }));
    }
  };

  const startBoard = async () => {
    try {
      console.log("Requesting White board access");
      const stream = canvasStream;
      console.log(
        "White Board stream acquired:",
        canvasStream.getVideoTracks()
      );
      console.log("producers.canvas", producers.canvas);

      await connectSendTransport("canvas", stream);
    } catch (error) {
      console.error("Error accessing white board:", error);
      alert("Failed to start white board");
    }
  };

  const getRouterRtpCapabilities = async () => {
    // console.log("Emitting getRouterRtpCapabilities");
    // socket.emit("getRouterRtpCapabilities", { roomId: classId }, (data) => {
    //   console.log("Received routerRtpCapabilities:", data);
    //   setRtpCapabilities(data.routerRtpCapabilities);
    //   return data?.routerRtpCapabilities;
    // });

    console.log("Emitting getRouterRtpCapabilities");

    const data = await new Promise((resolve) => {
      socket.emit(
        "getRouterRtpCapabilities",
        { roomId: classId },
        (response) => {
          resolve(response);
        }
      );
    });

    console.log("Received routerRtpCapabilities:", data);
    setRtpCapabilities(data.routerRtpCapabilities);
    return data?.routerRtpCapabilities;
  };

  // const getRouterRtpCapabilities = () => {
  //   return new Promise((resolve, reject) => {
  //     if (!socket) return reject("Socket not initialized");
  //     socket.emit("getRouterRtpCapabilities", { roomId: classId }, (data) => {
  //       if (data?.routerRtpCapabilities) {
  //         setRtpCapabilities(data.routerRtpCapabilities);

  //         resolve(data.routerRtpCapabilities);
  //       } else {
  //         reject("No RTP capabilities received");
  //       }
  //     });
  //   });
  // };

  const createDevice = async (rtpCapabilities) => {
    if (!rtpCapabilities) {
      console.log("Cannot create device: rtpCapabilities is null");
      alert("Please get Router RTP Capabilities first!");
      return;
    }
    try {
      console.log(
        "Creating mediasoup Device with rtpCapabilities:",
        rtpCapabilities
      );
      const newDevice = new Device();
      await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
      console.log("Device loaded successfully:", newDevice);
      setDevice(newDevice);

      return newDevice;
    } catch (error) {
      console.error("Error creating device:", error);
      if (error.name === "UnsupportedError") {
        console.error("Browser not supported");
      }
      alert("Failed to create device");
    }
  };

  const createSendTransport = async (device) => {
    if (!device) {
      console.log("Cannot create send transport: device is null");
      alert("Please create a Device first!");
      return;
    }
    console.log("Emitting createTransport for sender");
    socket.emit(
      "createTransport",
      { roomId: classId, sender: true },
      ({ params }) => {
        console.log("Received createTransport response:", params);
        if (params.error) {
          console.error("Error in createTransport:", params.error);
          alert("Failed to create transport");
          return;
        }
        const transport = device.createSendTransport(params);
        console.log("Created send transport:", transport);
        setProducerTransport(transport);
        console.log("producerTrasnport", producerTransport);
        transport.on("connect", ({ dtlsParameters }, callback, errback) => {
          console.log(
            "Send transport connect event, dtlsParameters:",
            dtlsParameters
          );
          try {
            socket.emit("connectProducerTransport", {
              roomId: classId,
              dtlsParameters,
            });
            console.log("Emitted connectProducerTransport");
            callback();
          } catch (error) {
            console.error("Error in connectProducerTransport:", error);
            errback(error);
          }
        });
        transport.on(
          "produce",
          ({ roomId, kind, rtpParameters, appData }, callback, errback) => {
            console.log("Send transport produce event, parameters:", {
              roomId,
              kind,
              rtpParameters,
              appData,
            });
            try {
              socket.emit(
                "transport-produce",
                {
                  roomId: classId,
                  kind,
                  rtpParameters,
                  label: appData.label || "",
                },
                ({ id }) => {
                  console.log(
                    "Received transport-produce response, producer ID:",
                    id
                  );
                  callback({ id });
                }
              );
            } catch (error) {
              console.error("Error in transport-produce:", error);
              errback(error);
            }
          }
        );
      }
    );
  };

  // const createSendTransport = () => {
  //   console.log("create send transport called");
  //   return new Promise((resolve, reject) => {
  //     if (!device || !socket) return reject("Device or socket not ready");
  //     socket.emit("createTransport", { sender: true }, ({ params }) => {
  //       if (params?.error) return reject(params.error);
  //       const transport = device.createSendTransport(params);
  //       setProducerTransport(transport);

  //       console.log(producerTransport);

  //       transport.on("connect", ({ dtlsParameters }, callback, errback) => {
  //         socket.emit("connectProducerTransport", { dtlsParameters }, () => {
  //           callback();
  //         });
  //       });

  //       transport.on(
  //         "produce",
  //         ({ kind, rtpParameters, appData }, callback) => {
  //           socket.emit(
  //             "transport-produce",
  //             {
  //               kind,
  //               rtpParameters,
  //               label: appData.label || "",
  //             },
  //             ({ id }) => callback({ id })
  //           );
  //         }
  //       );

  //       resolve(transport);
  //     });
  //   });
  // };

  const connectSendTransport = async (type, stream) => {
    if (!producerTransport) {
      console.log("Cannot connect send transport: producerTransport is null");
      alert("Please create a Send Transport first!");
      return;
    }
    try {
      // Camera Video Producer
      if (type === "camera" && stream && !producers.camera) {
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0) {
          console.error("No video tracks available in camera stream");
          alert("Camera stream has no video tracks");
          return;
        }
        const videoTrack = videoTracks[0];
        console.log("Producing camera video track:", videoTrack);
        const videoProducer = await producerTransport.produce({
          track: videoTrack,
          encodings: [
            { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
            { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
            { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
          ],
          codecOptions: { videoGoogleStartBitrate: 1000 },
          appData: { label: "camera" },
        });
        console.log("Created camera video producer:", videoProducer);
        setProducers((prev) => ({ ...prev, camera: videoProducer }));
        videoProducer.on("trackended", () => {
          console.log("Camera video track ended");
          stopCamera();
        });
        videoProducer.on("transportclose", () =>
          console.log("Camera video transport closed")
        );
      }

      // Audio Producer
      if (type === "audio" && stream && !producers.audio) {
        const audioTrack = stream.getAudioTracks()[0];
        console.log("Producing audio track:", audioTrack);
        const audioProducer = await producerTransport.produce({
          track: audioTrack,
          appData: { label: "audio" },
        });
        console.log("Created audio producer:", audioProducer);
        setProducers((prev) => ({ ...prev, audio: audioProducer }));
        audioProducer.on("trackended", () => {
          console.log("Audio track ended");
          stopAudio();
        });
        audioProducer.on("transportclose", () =>
          console.log("Audio transport closed")
        );
      }

      // Screen Share Producer
      if (type === "screen" && stream && !producers.screen) {
        const screenTrack = stream.getVideoTracks()[0];
        console.log("Producing screen share track:", screenTrack);
        const screenProducer = await producerTransport.produce({
          track: screenTrack,
          encodings: [
            { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
            { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
            { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
          ],
          codecOptions: { videoGoogleStartBitrate: 1000 },
          appData: { label: "screen" },
        });
        console.log("Created screen share producer:", screenProducer);
        setProducers((prev) => ({ ...prev, screen: screenProducer }));
        screenProducer.on("trackended", () => {
          console.log("Screen share track ended");
          stopScreenShare();
        });
        screenProducer.on("transportclose", () =>
          console.log("Screen share transport closed")
        );
      }

      //Board Stream  Streaming Canvas as Video. So on Consumer Side we can use video tag as well as canvas(for realtime draw between intructor and students) tag
      if (type === "canvas" && stream && !producers.canvas) {
        console.log("Hello from canvas");
        const canvasTrack = stream.getVideoTracks()[0];
        console.log("Producing canvas (whiteboard) track:", canvasTrack);
        const canvasProducer = await producerTransport.produce({
          track: canvasTrack,
          appData: { label: "canvas" },
          codecOptions: { videoGoogleStartBitrate: 1000 },
        });
        console.log("Created canvas producer:", canvasProducer);
        setProducers((prev) => ({ ...prev, canvas: canvasProducer }));

        canvasProducer.on("trackended", () => {
          console.log("Canvas video track ended");
          setCanvasStream(null);
          setProducers((prev) => ({ ...prev, canvas: null }));
        });

        canvasProducer.on("transportclose", () =>
          console.log("Canvas transport closed")
        );
      }
    } catch (error) {
      console.error("Error producing media:", error);
      alert("Failed to produce media: " + error.message);
    }
  };

  const handleCamera = () => {
    setToggleCamera(!toggleCamera);
    toggleCamera ? stopCamera() : startCamera();
  };

  const handleAudio = () => {
    setToggleAudio(!toggleAudio);
    toggleAudio ? stopAudio() : startAudio();
  };

  const handleScreen = () => {
    setScreenShare(!screenShare);
    screenShare ? stopScreenShare() : startScreenShare();
  };

  const handleDraw = async () => {
    if (screenShare) {
      alert("Screen Sharing Stopped");
    }
    setScreenShare(false);
    await startBoard();
    setToggleBoard(!toggleBoard);
  };

  //all neccessary fucntion will called on first page refersh

  const startLiveClass = async () => {
    try {
      const rtpCapabilities = await getRouterRtpCapabilities();
      const dev = await createDevice(rtpCapabilities);
      await createSendTransport(dev);
    } catch (err) {
      console.error("Initialization error:", err);
    }
  };

  useEffect(() => {
    if (socket && !initializedRef.current) {
      initializedRef.current = true;
      startLiveClass();
    }
  }, [socket]);

  return (
    <main className="main">
      <div className="video-container">
        <div className="nav-content">
          <div>RoomId : {classId}</div>
          <div className="nav-btns">
            <button className="n-btns" onClick={handleCamera}>
              {toggleCamera ? (
                <BsCameraVideoOffFill size={20} />
              ) : (
                <BsCameraVideoFill size={20} />
              )}
            </button>
            <button className="n-btns" onClick={handleAudio}>
              {toggleAudio ? (
                <BiSolidMicrophoneOff size={20} />
              ) : (
                <BiSolidMicrophone size={20} />
              )}
            </button>
            <button className="n-btns" onClick={handleScreen}>
              {screenShare ? (
                <MdStopScreenShare size={20} />
              ) : (
                <MdScreenShare size={20} />
              )}
            </button>
            <button className="n-btns" onClick={handleDraw}>
              {toggleBoard ? (
                <MdDraw size={20} color="black" />
              ) : (
                <MdDraw size={20} />
              )}
            </button>
          </div>
        </div>
        <div className="screen-wrapper">
          {toggleBoard ? (
            <>
              <WhiteBoard
                className="screen"
                onCanvasReadyStream={async (stream) => {
                  setCanvasStream(stream);
                  await connectSendTransport("canvas", stream);
                }}
              />
              <span className="video-label">Board</span>
            </>
          ) : (
            <>
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="screen"
              />
              <span className="video-label">Screen Share</span>
            </>
          )}
        </div>
        <div className="video-wrapper">
          <video ref={cameraVideoRef} autoPlay playsInline className="video" />
          <span className="video-label">Camera</span>
        </div>
        {/* <div className="video-wrapper">
          <WhiteBoard />
        </div> */}
      </div>
      <div className="status">Current Participants: {viewerCount}</div>
      {/* <div className="button-container">
        <button
          onClick={startCamera}
          disabled={!!cameraStream}
          className="button"
        >
          Start Camera
        </button>
        <button
          onClick={stopCamera}
          disabled={!cameraStream}
          className="button"
        >
          Stop Camera
        </button>
        <button
          onClick={startAudio}
          disabled={!!audioStream}
          className="button"
        >
          Start Audio
        </button>
        <button onClick={stopAudio} disabled={!audioStream} className="button">
          Stop Audio
        </button>
        <button
          onClick={startScreenShare}
          disabled={!!screenStream}
          className="button"
        >
          Start Screen Share
        </button>
        <button
          onClick={stopScreenShare}
          disabled={!screenStream}
          className="button"
        >
          Stop Screen Share
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
      </div> */}

      {/* <div>
        <ConsumerBox socket={socket} device={device} />
      </div> */}
      {remoteProducers.map((producerInfo) => (
        <ConsumerBox
          key={producerInfo.producerId}
          socket={socket}
          device={device}
          producerId={producerInfo.producerId}
          roomId={producerInfo.roomId}
        />
      ))}
    </main>
  );
}

export default LiveClass;
