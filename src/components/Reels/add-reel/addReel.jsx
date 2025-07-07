import React, { useState } from "react";
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

  const onSubmit = async (data) => {
    try {
      const res = await addReelAPi(data);
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
          validateStatus={errors.courseLessonId ? "error" : ""}
          help={errors.courseLessonId?.message}
        >
          <Controller
            name="courseLession"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                style={{ width: "100%" }}
                placeholder="Type keyword to search courseLession"
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
                onChange={(e) => field.onChange(e.target.files[0])}
              />
            )}
          />
        </Form.Item>

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
