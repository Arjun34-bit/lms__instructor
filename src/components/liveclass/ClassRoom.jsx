import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketProvider";
import toast from "react-hot-toast";
// import { getLocalStorageUser } from "../../utils/localStorageUtils";
import SimplePeer from "simple-peer";
import { FaChevronCircleLeft } from "react-icons/fa";

const ClassRoom = () => {
  const { classId } = useParams();
  const socket = useSocket();
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState({});
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const navigate = useNavigate();

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
      const { userId, signal } = data;
      if (peers[userId]) {
        peers[userId].signal(signal);
      }
    });

    return () => {
      socket.off("signal");
    };
  }, [peers, socket]);

  const createPeer = (userId, initiator) => {
    const newPeer = new SimplePeer({
      initiator,
      trickle: false,
      stream: stream,
    });

    newPeer.on("signal", (data) => {
      socket.emit("signal", { userId, signal: data });
    });

    newPeer.on("stream", (remoteStream) => {
      remoteVideoRefs.current[userId].srcObject = remoteStream;
    });

    setPeers((prevPeers) => ({ ...prevPeers, [userId]: newPeer }));
  };

  useEffect(() => {
    socket.on("joinStudentResponse", (data) => {
      const { message, userId } = data;
      toast.success(message);
      createPeer(userId, false); // Create peer as a non-initiator
    });

    return () => {
      socket.off("joinStudentResponse");
    };
  }, [socket]);

  // const handleStudentJoin = () => {
  //   const userData = getLocalStorageUser();
  //   socket.emit("joinStudent", {
  //     userId: userData?.userId,
  //     name: userData?.name,
  //     role: userData?.role,
  //     classId,
  //   });
  // };

  const leaveClassRoom = () => {
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    socket.emit("leaveClass", { classId });
    navigate(-1);
  };

  return (
    <div className="content-area" style={{ flexGrow: 1 }}>
      <div
        style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10 }}
      >
        <FaChevronCircleLeft
          onClick={leaveClassRoom}
          style={{ fontSize: "30px", color: "white", cursor: "pointer" }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100vw",
            height: "100vh",
            backgroundColor: "#000",
            overflow: "hidden",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          {Object.keys(peers).map((userId) => (
            <video
              key={userId}
              ref={(el) => (remoteVideoRefs.current[userId] = el)}
              autoPlay
              style={{
                width: "300px",
                height: "300px",
                backgroundColor: "#000",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassRoom;
