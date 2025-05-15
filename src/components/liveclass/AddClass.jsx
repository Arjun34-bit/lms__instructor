import React, { useState } from "react";
import { Button, Form, Input, Modal, Select, DatePicker, Alert } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addClassSchema } from "./schema/addClassSchema";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { cousedummydata } from "./data/data";
import toast from "react-hot-toast";
import { addLiveClassApi } from "../../api/queries/classesQueries";
import AntdSpinner from "../Spinner/Spinner";
import { getAllCoursesApiWithoutPageNo } from "../../api/queries/courseQueries";

const AddClass = ({
  visible,
  onClose,
  classesRefetch,
}) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: getAllCoursesApiWithoutPageNo(),
    keepPreviousData: true,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(addClassSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: "",
      startDate: null,
      endDate: null,
    },
  });

  const onSubmit = async (data) => {
    try {
        console.log(data ,"add live class data");
      const addedClass = await addLiveClassApi(data);
      setSuccess(`Class "${addedClass?.data?.title}" has been scheduled successfully`);
      toast.success(`Class scheduled successfully`);
      reset();
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1000);
      classesRefetch();
    } catch (error) {
      setError("Failed to schedule class. Please try again.");
      toast.error(error?.response?.data?.message || error?.message);
    }
  };

  if (coursesLoading) {
    return <AntdSpinner />;
  }

  return (
    <Modal title="Schedule New Class" open={visible} onCancel={onClose} footer={null}>
      {error && (
        <Alert message={error} type="error" showIcon className="my-2" />
      )}
      {success && (
        <Alert message={success} type="success" showIcon className="my-2" />
      )}
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Class Title"
          validateStatus={errors.title ? "error" : ""}
          help={errors.title?.message}
          required
        >
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter class title" />
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
              <Input.TextArea
                {...field}
                placeholder="Enter course description"
                rows={4}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Course"
          validateStatus={errors.courseId ? "error" : ""}
          help={errors.courseId?.message}
          required
        >
          <Controller
            name="courseId"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select course">
                {cousedummydata &&
                  cousedummydata?.map((course, index) => (
                    <Select.Option key={index} value={course?.id}>
                      {course?.title}
                    </Select.Option>
                  ))}
              </Select>
            )}
          />
        </Form.Item>
       
        <Form.Item
          label="Start Date & Time"
          validateStatus={errors.startDate ? "error" : ""}
          help={errors.startDate?.message}
          required
        >
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date ? date.toDate() : null)}
                style={{ width: "100%" }}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="End Date & Time"
          validateStatus={errors.endDate ? "error" : ""}
          help={errors.endDate?.message}
          required
        >
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: "100%" }}
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date ? date.toDate() : null)}
              />
            )}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {isSubmitting ? "Scheduling..." : "Schedule Class"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddClass;