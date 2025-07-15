import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Alert } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";

import AntdSpinner from "../../Spinner/Spinner";
import toast from "react-hot-toast";
import { addReelSchema } from "./schema/addReelSchema";
import { fetchAllMasterDataApi } from "../../../api/queries/commonQueries";
import {
  fetchAssignedCoursesApi,
  getAllCoursesApi,
} from "../../../api/queries/courseQueries";
import { addReelAPi } from "../../../api/queries/reelQueries";
import { formatDuration } from "../../../utils/helper";
import { genComponentStyleHook } from "antd/es/theme/internal";

const AddReel = ({ visible, onClose }) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [subjects, setSubjects] = useState([]);

  const { data: masterData, isLoading: masterDataLoading } = useQuery({
    queryFn: fetchAllMasterDataApi,
    keepPreviousData: true,
  });

  const {
    data: assignedCoursesData,
    isLoading: assignedCoursesDataLoading,
    refetch: assignedCourseRefetch,
  } = useQuery({
    queryKey: ["assignedCoursesData"],
    queryFn: () => fetchAssignedCoursesApi(),
    keepPreviousData: true,
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(addReelSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      courseId: "",
      courseLessionId: "",
      video: "",
    },
  });

  const selectedCourseId = watch("courseId");

  const [courseLessions, setCourseLessions] = useState([]);

  useEffect(() => {
    const getCourseLession = (courseId) => {
      const selectedCourse = assignedCoursesData?.data?.find(
        (course) => course.id === courseId
      );
      const lessions = selectedCourse?.CourseLession || [];
      setCourseLessions(lessions);
    };

    reset((prev) => ({ ...prev, courseLessionId: "" }));

    if (selectedCourseId) {
      getCourseLession(selectedCourseId);
    }
  }, [selectedCourseId, assignedCoursesData]);

  const [previews, setPreviews] = useState();
  const [orientations, setOrientations] = useState({});
  const [durations, setDurations] = useState(0);

  const handleFileChange = (e, onChange) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviews(null);
      setOrientations(null);
      onChange(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = previewUrl;

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const { duration, videoWidth, videoHeight } = video;

      const orientation =
        videoWidth > videoHeight
          ? "Landscape"
          : videoWidth < videoHeight
          ? "Portrait"
          : "Square";

      if (orientation === "Landscape") {
        toast.error(
          "Landscape videos are not allowed. Please upload a Potrait video."
        );
        setPreviews(null);
        setOrientations(null);
        onChange(null);
      } else {
        setDurations(duration);
        setPreviews(previewUrl);
        setOrientations(orientation);
        onChange(file);
      }
    };
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("courseId", data.courseId);
      formData.append("courseLessionId", data.courseLessionId || "");
      formData.append("video", data.video);
      const res = await addReelAPi(formData);
      setSuccess(`${res?.data?.title} Reel has been added successfully`);
      toast.success(`${res?.data?.title} Reel has been added successfully`);
      reset();
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1000);
      return;
    } catch (error) {
      setError("Failed to add reel. Please try again.");
      toast.error(error?.response?.data?.message || error?.message);
    }
  };

  return (
    <Modal
      title="Upload a Reel"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      {error && (
        <Alert message={error} type="error" showIcon className="my-2" />
      )}
      {success && (
        <Alert message={success} type="success" showIcon className="my-2" />
      )}
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Caption"
          validateStatus={errors.title ? "error" : ""}
          help={errors.title?.message}
          required
        >
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Reel Title" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          validateStatus={errors.description ? "error" : ""}
          help={errors.description?.message}
          required
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input.TextArea {...field} placeholder="Describe Reel" rows={4} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Add Tags"
          validateStatus={errors.tags ? "error" : ""}
          help={errors.tags?.message}
          required
        >
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Type keyword to search tags"
                onChange={(val) => field.onChange(val)}
                onBlur={field.onBlur}
                value={field.value}
                options={masterData?.data?.categories?.map((tag) => ({
                  value: tag?.name,
                  label: tag?.name,
                }))}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Select Course"
          validateStatus={errors.courseId ? "error" : ""}
          help={errors.courseId?.message}
          required
        >
          <Controller
            name="courseId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                style={{ width: "100%" }}
                placeholder="Type keyword to search course"
                onChange={(val) => field.onChange(val)}
                onBlur={field.onBlur}
                value={field.value}
                options={assignedCoursesData?.data?.map((tag) => ({
                  value: tag?.id,
                  label: tag?.title,
                }))}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Select Course Lession"
          validateStatus={errors.courseLessionId ? "error" : ""}
          help={errors.courseLessionId?.message}
        >
          <Controller
            name="courseLessionId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                style={{ width: "100%" }}
                placeholder="Type keyword to search courseLession"
                onChange={(val) => field.onChange(val)}
                onBlur={field.onBlur}
                value={field.value}
                options={courseLessions?.map((tag) => ({
                  value: tag?.id,
                  label: tag?.lectureName,
                }))}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Upload Reel"
          validateStatus={errors.video ? "error" : ""}
          help={errors.video?.message}
        >
          <Controller
            name="video"
            control={control}
            render={({ field }) => (
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, field.onChange)}
              />
            )}
          />
        </Form.Item>

        {durations ? <p>Duration : {formatDuration(durations)}</p> : ""}

        {previews && (
          <div className="mt-2">
            <video
              src={previews}
              width="45%"
              height="300px"
              controls
              muted
              playsInline
              style={{ borderRadius: "8px", border: "1px solid #ccc" }}
            />
          </div>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {isSubmitting ? "Uploading..." : "Upload Reel"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddReel;
