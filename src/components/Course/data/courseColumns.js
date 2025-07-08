import { Button, Tag } from "antd";

const approvalStatusColor = (approvalStatus) => {
  switch (approvalStatus) {
    case "approved":
      return "green";
    case "pending":
      return "orange";
    case "declined":
      return "red";
    default:
      return "orange";
  }
};

export const getCourseColumns = (onAddLessionClick) => [
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Level",
    dataIndex: "level",
    key: "level",
  },
  {
    title: "Lessions",
    dataIndex: "lessions",
    key: "lessions",
  },
  {
    title: "Start Date",
    dataIndex: "startDate",
    key: "startDate",
    render: (startTime) => new Date(startTime).toDateString(),
  },
  {
    title: "End Date",
    dataIndex: "endDate",
    key: "endDate",
    render: (endTime) => new Date(endTime).toDateString(),
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
    render: (price) => {
      return <>Rs. {price}</>;
    },
  },
  {
    title: "Status",
    dataIndex: "approvalStatus",
    key: "approvalStatus",
    render: (approvalStatus) => {
      const color = approvalStatusColor(approvalStatus);
      return <Tag color={color}>{approvalStatus.toUpperCase()}</Tag>;
    },
  },
  {
    title: "Add Lession",
    dataIndex: "addLession",
    key: "addLession",
    render: (_, record) => {
      return (
        <Button type="primary" onClick={() => onAddLessionClick(record.id)}>
          Add Lession
        </Button>
      );
    },
  },
];
