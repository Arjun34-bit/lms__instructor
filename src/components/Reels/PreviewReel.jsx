import React, { useState } from "react";
import { Modal, Spin } from "antd";

const PreviewReel = ({ videoUrl, visible, onClose }) => {
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  return (
    <Modal
      title="Preview Reel"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
      bodyStyle={{ padding: 0, borderRadius: "12px", overflow: "hidden" }}
    >
      {videoUrl ? (
        <div className="w-full h-[600px] relative flex items-center justify-center ml-3">
          <input type="hidden" />
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            height={500}
            width={300}
            className="object-cover border rounded-lg"
          />
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">No video available</div>
      )}
    </Modal>
  );
};

export default PreviewReel;
