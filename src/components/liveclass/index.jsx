import { GiTeacher, GiCalendar } from "react-icons/gi";
import { FiPlusCircle } from "react-icons/fi";
import { Card, Button } from "react-bootstrap";
import { Table } from "antd";
import { getLiveClassColumns } from "./data/liveClassColumns";
import { liveClassData } from "./data/data";
import { useSocket } from "../../context/SocketProvider";
import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getLocalStorageUser } from "../../utils/localStorageUtils";

const LiveClasses = () => {
  const socket = useSocket();
  const navigate = useNavigate();

  const handleInstructorClassRoomJoin = (classId) => {
    const user = getLocalStorageUser();
    socket?.emit("joinInstructor", { classId, role: user?.role });
  };

  const handleJoinInstructorResponse = useCallback(
    (data) => {
      toast.success(data?.message);
      navigate(data?.classId);
    },
    [navigate]
  );

  useEffect(() => {
    socket?.on("joinInstructorResponse", handleJoinInstructorResponse);

    return () => {
      socket?.off("joinInstructorResponse", handleJoinInstructorResponse);
    };
  }, [socket, handleJoinInstructorResponse]);

  const liveClassColumns = getLiveClassColumns(handleInstructorClassRoomJoin);

  return (
    <div
      className="content-area p-4"
      style={{
        marginLeft: "250px",
        marginRight: "20px",
        marginTop: "30px",
        flexGrow: 1,
      }}
    >
      {/* heading */}
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <div>
            <GiTeacher style={{ marginRight: "10px", fontSize: "30px" }} />
          </div>
          <div>
            <h2>Live Classes</h2>
          </div>
        </div>
        <div style={{ marginRight: "20px" }}>
          <Button>
            <FiPlusCircle style={{ fontSize: "20px" }} /> Schedule New Class
          </Button>
        </div>
      </div>

      {/* upcoming classes */}
      <div>
        <Card style={{ width: "18rem", marginTop: "30px" }}>
          <Card.Body>
            <Card.Title>
              <GiCalendar style={{ fontSize: "30px" }} /> Upcoming Classes
            </Card.Title>
            <Card.Text style={{ padding: "10px" }}>2</Card.Text>
          </Card.Body>
        </Card>
      </div>
      {/* tables to see all upcoming and live classes */}
      <div className="mt-5">
        <Table
          className="shadow-sm"
          columns={liveClassColumns}
          bordered
          dataSource={liveClassData}
        />
      </div>
    </div>
  );
};

export default LiveClasses;
