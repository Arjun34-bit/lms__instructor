import { Tag } from "antd";

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

export const getReelColumns = () => [
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Tags",
    dataIndex: "tags",
    key: "tags",
  },
  {
    title: "Preview",
    dataIndex: "preview",
    key: "preview",
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
];
