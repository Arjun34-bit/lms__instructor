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
    render: (course) => course?.title || "-",
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
    dataIndex: "approvalStatus",
    key: "status",
    render: (approvalStatus) => {
      const color = approvalStatus === "approved" ? "green" : "orange";
      return <Tag color={color}>{approvalStatus?.toUpperCase()}</Tag>;
    },
  },
  {
    title: "Link",
    dataIndex: "urlLink",
    key: "urlLink",
    render: (urlLink) => {
      if (urlLink !== "" && urlLink !== null) {
        return (
          <Button className="bg-primary text-white px-4">Share Link</Button>
        );
      } else {
        <span className="bg-primary text-red-200 px-4">
          Link Not Provided.
        </span>;
      }
    },
  },
  {
    title: "Join",
    key: "join",
    render: (record) => {
      const { id, title, startTime, endTime, approvalStatus } = record;
      const isLive = checkIfLiveClass(startTime, endTime, approvalStatus);
      if (!isLive) {
        return (
          <Button
            className="bg-primary text-white px-4"
            // onClick={() => handleInstructorClassRoomJoin(classId)}
            onClick={() =>
              (window.location.href = `/live-class-room/${title
                ?.split(" ")
                .join("")
                ?.toLowerCase()}-${id}`)
            }
          >
            Join
          </Button>
        );
      }
      return <Tag color={"orange"}>Upcoming...</Tag>;
    },
  },
];
