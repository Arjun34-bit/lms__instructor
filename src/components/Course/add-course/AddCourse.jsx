import React, { useState } from "react";
import { Button, Form, Input, Modal, Select, DatePicker, Alert } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addCourseSchema } from "./schema/addCourseSchema";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllMasterDataApi,
  fetchSubjectsApi,
} from "../../../api/queries/commonQueries";
import AntdSpinner from "../../Spinner/Spinner";
import toast from "react-hot-toast";
import { addCourseApi } from "../../../api/queries/courseQueries";

const { Option } = Select;

const AddCourse = ({
  visible,
  onClose,
  assignedCourseRefetch,
  assignedCourseStatsRefetch,
}) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [subjects, setSubjects] = useState([]);

  const { data: masterData, isLoading: masterDataLoading } = useQuery({
    queryFn: fetchAllMasterDataApi,
    keepPreviousData: true,
  });

  const getSubjectBySelectedDepartment = async (departmentId) => {
    try {
      const subjects = await fetchSubjectsApi({ departmentId });
      setSubjects([...subjects?.data]);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(addCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      level: "Begineer",
      languageId: "",
      categoryId: "",
      subjectId: "",
      departmentId: "",
      startDate: null,
      endDate: null,
      price: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const addedCourse = await addCourseApi(data);
      setSuccess(`${addedCourse?.data?.title} has been added successfully`);
      toast.success(`${addedCourse?.data?.title} has been added successfully`);
      reset();
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1000);
      // refetch course and course stats data
      assignedCourseRefetch();
      assignedCourseStatsRefetch();
    } catch (error) {
      setError("Failed to add course. Please try again.");
      toast.error(error?.response?.data?.message || error?.message);
    }
  };

  if (masterDataLoading) {
    return <AntdSpinner />;
  }

  return (
    <Modal title="Add Course" open={visible} onCancel={onClose} footer={null}>
      {error && (
        <Alert message={error} type="error" showIcon className="my-2" />
      )}
      {success && (
        <Alert message={success} type="success" showIcon className="my-2" />
      )}
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Thumbnail"
          validateStatus={errors.thumbnail ? "error" : ""}
          help={errors.thumbnail?.message}
          required
        >
          <Controller
            name="thumbnail"
            control={control}
            render={({ field }) => (
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => field.onChange(e.target.files[0])}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Title"
          validateStatus={errors.title ? "error" : ""}
          help={errors.title?.message}
          required
        >
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter course title" />
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
          label="Level"
          validateStatus={errors.level ? "error" : ""}
          help={errors.level?.message}
          required
        >
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select course level">
                <Option value="Begineer">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Language"
          validateStatus={errors.languageId ? "error" : ""}
          help={errors.languageId?.message}
          required
        >
          <Controller
            name="languageId"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select language">
                {masterData &&
                  masterData?.data?.languages &&
                  masterData?.data?.languages?.map((language, index) => (
                    <Option key={index} value={language?.id}>
                      {language?.name}
                    </Option>
                  ))}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Category"
          validateStatus={errors.categoryId ? "error" : ""}
          help={errors.categoryId?.message}
          required
        >
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select Category">
                {masterData &&
                  masterData?.data?.categories &&
                  masterData?.data?.categories?.map((category, index) => (
                    <Option key={index} value={category?.id}>
                      {category?.name}
                    </Option>
                  ))}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Department"
          validateStatus={errors.departmentId ? "error" : ""}
          help={errors.departmentId?.message}
          required
        >
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select Department"
                onChange={async (departmentId) => {
                  field.onChange(departmentId);
                  await getSubjectBySelectedDepartment(departmentId);
                }}
              >
                {masterData &&
                  masterData?.data?.departments &&
                  masterData?.data?.departments?.map((department, index) => (
                    <Option key={index} value={department?.id}>
                      {department?.name}
                    </Option>
                  ))}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Subject"
          validateStatus={errors.subjectId ? "error" : ""}
          help={errors.subjectId?.message}
          required
        >
          <Controller
            name="subjectId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select Subject"
                onChange={(subjectId) => {
                  field.onChange(subjectId);
                }}
              >
                {subjects &&
                  subjects?.[0] &&
                  subjects?.map((subject, index) => (
                    <Option key={index} value={subject?.id}>
                      {subject?.name}
                    </Option>
                  ))}
              </Select>
            )}
            disabled={!subjects?.[0]}
          />
        </Form.Item>

        <Form.Item
          label="Start Date"
          validateStatus={errors.startDate ? "error" : ""}
          help={errors.startDate?.message}
        >
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                format="YYYY-MM-DD"
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
          label="End Date"
          validateStatus={errors.endDate ? "error" : ""}
          help={errors.endDate?.message}
        >
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date ? date.toDate() : null)}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Price"
          validateStatus={errors.price ? "error" : ""}
          help={errors.price?.message}
        >
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                placeholder="Enter course price"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
              />
            )}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {isSubmitting ? "Adding..." : "Add Course"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCourse;
