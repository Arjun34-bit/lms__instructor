import { Button, Tag } from "antd";

const checkIfLiveClass = (startTime, endTime, status) => {
  if (status !== "approved") {
    return false;
  }
  const now = new Date();
  return new Date(startTime) <= now && now <= new Date(endTime);
};

export const getLiveClassColumns = (handleInstructorClassRoomJoin) => [
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Course",
    dataIndex: "course",
    key: "course",
  },
  {
    title: "Start Time",
    dataIndex: "startTime",
    key: "startTime",
    render: (startTime) => new Date(startTime).toLocaleString(),
  },
  {
    title: "End Time",
    dataIndex: "endTime",
    key: "endTime",
    render: (endTime) => new Date(endTime).toLocaleString(),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const color = status === "approved" ? "green" : "orange";
      return <Tag color={color}>{status.toUpperCase()}</Tag>;
    },
  },
  {
    title: "Join",
    key: "join",
    render: (record) => {
      const { classId, startTime, endTime, status } = record;
      const isLive = checkIfLiveClass(startTime, endTime, status);
      if (isLive) {
        return (
          <Button
            className="bg-primary text-white px-4"
            onClick={() => handleInstructorClassRoomJoin(classId)}
          >
            Join
          </Button>
        );
      }
      return <Tag color={"orange"}>Upcoming...</Tag>;
    },
  },
];
