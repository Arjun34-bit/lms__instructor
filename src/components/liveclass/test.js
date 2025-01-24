import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketProvider";
import toast from "react-hot-toast";
import { Button } from "antd";
import { getLocalStorageUser } from "../../utils/localStorageUtils";
import SimplePeer from "simple-peer";
import * as process from "process";

window.global = window;
window.process = process;

const ClassRoom = () => {
  const { classId } = useParams();
  const socket = useSocket();
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      });

    socket.on("signal", (data) => {
      if (peer) {
        peer.signal(data);
      }
    });

    return () => {
      socket.off("signal");
    };
  }, [peer]);

  const callPeer = () => {
    const newPeer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    newPeer.on("signal", (data) => {
      socket.emit("signal", data);
    });

    newPeer.on("stream", (remoteStream) => {
      remoteVideoRef.current.srcObject = remoteStream;
    });

    setPeer(newPeer);
  };

  const answerCall = () => {
    const newPeer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    newPeer.on("signal", (data) => {
      socket.emit("signal", data);
    });

    newPeer.on("stream", (remoteStream) => {
      remoteVideoRef.current.srcObject = remoteStream;
    });

    setPeer(newPeer);
  };

  // Handle student join response
  const handleStudentJoinResponse = useCallback((data) => {
    const { message } = data;
    toast.success(message);
  }, []);

  useEffect(() => {
    socket?.on("joinStudentResponse", handleStudentJoinResponse);

    return () => {
      socket?.off("joinStudentResponse", handleStudentJoinResponse);
    };
  }, [socket, handleStudentJoinResponse]);

  const handleStudentJoin = () => {
    const userData = getLocalStorageUser();
    socket?.emit("joinStudent", {
      userId: userData?.userId,
      name: userData?.name,
      role: userData?.role,
      classId,
    });
  };

  return (
    <div
      className="content-area p-4"
      style={{
        marginLeft: "250px",
        marginTop: "30px",
        flexGrow: 1,
      }}
    >
      <div>
        <Button onClick={handleStudentJoin}>Join as Student</Button>
      </div>
      <h1>You have joined with classId as {classId}</h1>

      {/* Video Streaming */}
      <h1>Simple Video Conferencing</h1>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          style={{ width: "300px", marginBottom: "10px" }}
        />
        <video ref={remoteVideoRef} autoPlay style={{ width: "300px" }} />
      </div>
      <div style={{display: "flex", justifyContent: "space-evenly"}}>
        <button onClick={callPeer}>Call</button>
        <button onClick={answerCall}>Answer</button>
      </div>
    </div>
  );
};

export default ClassRoom;
