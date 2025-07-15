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

export const getReelColumns = (handlePreview) => [
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
    title: "Preview",
    dataIndex: "fileUrl",
    key: "fileUrl",
    render: (fileUrl) => {
      return (
        <Button
          className="bg-primary text-white px-4"
          onClick={() => handlePreview(fileUrl)}
        >
          Preview
        </Button>
      );
    },
  },
];
