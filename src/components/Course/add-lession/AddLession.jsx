import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  DatePicker,
  Alert,
  Space,
} from "antd";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllMasterDataApi,
  fetchSubjectsApi,
} from "../../../api/queries/commonQueries";
import AntdSpinner from "../../Spinner/Spinner";
import toast from "react-hot-toast";
import { addCourseApi } from "../../../api/queries/courseQueries";
import { lessionSchema } from "./schema/lessionSchema";

const { Option } = Select;

const AddLession = ({ visible, onClose, selectedCourseId }) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [subjects, setSubjects] = useState([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(lessionSchema),
    lectures: [
      {
        courseId: selectedCourseId || "",
        lectureName: "",
        description: "",
        videos: null,
      },
    ],
  });

  console.log(selectedCourseId);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lectures",
  });

  const handleClose = () => {
    reset({
      lectures: [
        {
          courseId: selectedCourseId || "",
          lectureName: "",
          description: "",
          videos: null,
        },
      ],
    });
    onClose();
  };

  const onSubmit = async (data) => {
    try {
      console.log(data);
    } catch (error) {
      setError("Failed to add course. Please try again.");
      toast.error(error?.response?.data?.message || error?.message);
    }
  };

  //   if (masterDataLoading) {
  //     return <AntdSpinner />;
  //   }

  return (
    <Modal
      title="Add Lectures"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={1000}
    >
      {error && (
        <Alert message={error} type="error" showIcon className="my-2" />
      )}
      {success && (
        <Alert message={success} type="success" showIcon className="my-2" />
      )}

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="mb-6 p-4 border rounded-md bg-gray-50 shadow-sm"
            style={{ padding: 16 }}
          >
            <h4 className="font-semibold mb-2">Lecture {index + 1}</h4>
            <Form.Item
              label="Lecture Name"
              validateStatus={
                errors?.lectures?.[index]?.lectureName ? "error" : ""
              }
              help={errors?.lectures?.[index]?.lectureName?.message}
              required
            >
              <Controller
                name={`lectures.${index}.lectureName`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Lecture Name"
                    size="small"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Description"
              validateStatus={
                errors?.lectures?.[index]?.description ? "error" : ""
              }
              help={errors?.lectures?.[index]?.description?.message}
              required
            >
              <Controller
                name={`lectures.${index}.description`}
                control={control}
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    rows={3}
                    placeholder="Enter Description"
                    style={{ fontSize: 13 }}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Video"
              validateStatus={errors?.lectures?.[index]?.videos ? "error" : ""}
              help={errors?.lectures?.[index]?.videos?.message}
              required
            >
              <Controller
                name={`lectures.${index}.videos`}
                control={control}
                render={({ field }) => (
                  <Input
                    type="file"
                    accept="video/*"
                    size="small"
                    onChange={(e) => field.onChange(e.target.files[0])}
                  />
                )}
              />
            </Form.Item>

            {index > 0 && (
              <Button
                danger
                type="link"
                onClick={() => remove(index)}
                size="small"
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        <Space className="mb-4">
          <Button
            type="dashed"
            onClick={() =>
              append({
                courseId: selectedCourseId || "",
                lectureName: "",
                description: "",
                videos: null,
              })
            }
          >
            + Add Lecture
          </Button>

          <Button type="primary" htmlType="submit" loading={false}>
            Submit All
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};

export default AddLession;
