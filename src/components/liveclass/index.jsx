import { GiTeacher, GiCalendar } from "react-icons/gi";
import { FiPlusCircle } from "react-icons/fi";
import { Table, Card, Button } from "antd";
import { getLiveClassColumns } from "./data/liveClassColumns";
import { liveClassData } from "./data/data";
import { useSocket } from "../../context/SocketProvider";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getLocalStorageUser } from "../../utils/localStorageUtils";
import { useQuery } from "@tanstack/react-query";
import AddClass from "./AddClass";
import { fetchLiveClassesApi } from "../../api/queries/classesQueries";

const LiveClasses = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const socket = useSocket();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const {
    data: liveClassesData,
    isLoading,
    refetch: liveClassesRefetch,
  } = useQuery({
    queryKey: ["liveClassesData"],
    queryFn: () => fetchLiveClassesApi(),
    keepPreviousData: true,
  });

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
          <Button
            type="primary"
            style={{ padding: "20px 10px" }}
            onClick={() => setIsModalVisible(true)}
          >
            <FiPlusCircle style={{ fontSize: "20px" }} /> Schedule New Class
          </Button>
        </div>
      </div>

      {/* upcoming classes */}
      <div>
        <Card style={{ width: "18rem", marginTop: "30px" }} bordered={true}>
          <Card.Meta
            avatar={<GiCalendar style={{ fontSize: "30px" }} />}
            title="Upcoming Classes"
            description={
              <div>
                <p style={{ fontSize: 17, fontWeight: 600 }}>2</p>
              </div>
            }
          />
        </Card>
      </div>
      {/* tables to see all upcoming and live classes */}
      <div className="mt-5">
        <Table
          className="shadow-sm"
          columns={liveClassColumns}
          bordered
          // dataSource={data?.data || []  }
          dataSource={
            Array.isArray(liveClassesData?.data) ? liveClassesData.data : []
          }
        />
      </div>
      <AddClass
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        classesRefetch={liveClassesRefetch}
      />
    </div>
  );
};

export default LiveClasses;
