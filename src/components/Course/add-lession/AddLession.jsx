import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Alert,
  Space,
  Switch,
  Divider,
} from "antd";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lessionSchema } from "./schema/lessionSchema";
import toast from "react-hot-toast";
import { addLessionApi } from "../../../api/queries/lessionQueries";
import { addAllLectures, formatDuration } from "../../../utils/helper";

const VideoList = ({ control, lectureIndex }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `lectures.${lectureIndex}.videos`,
  });

  const [previews, setPreviews] = useState({});
  const [orientations, setOrientations] = useState({});
  const [durations, setDurations] = useState(0);

  const handleFileChange = (e, videoIndex, onChange) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviews((prev) => ({ ...prev, [videoIndex]: null }));
      setOrientations((prev) => ({ ...prev, [videoIndex]: null }));
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

      if (orientation === "Portrait") {
        toast.error(
          "Portrait videos are not allowed. Please upload a landscape video."
        );
        setPreviews((prev) => ({ ...prev, [videoIndex]: null }));
        setOrientations((prev) => ({ ...prev, [videoIndex]: null }));
        onChange(null);
      } else {
        setDurations(duration);
        setPreviews((prev) => ({ ...prev, [videoIndex]: previewUrl }));
        setOrientations((prev) => ({ ...prev, [videoIndex]: orientation }));
        onChange(file);
      }
    };
  };

  return (
    <div className="space-y-3">
      {fields.map((item, videoIndex) => (
        <div
          key={item.id}
          className="p-4 rounded-md border bg-blue-300 shadow-sm"
        >
          <Form.Item label="Video Title">
            <Controller
              name={`lectures.${lectureIndex}.videos.${videoIndex}.title`}
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Video Title" />
              )}
            />
          </Form.Item>

          <Form.Item label="Video Description">
            <Controller
              name={`lectures.${lectureIndex}.videos.${videoIndex}.description`}
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={2}
                  placeholder="Video Description"
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Upload Video File">
            <Controller
              name={`lectures.${lectureIndex}.videos.${videoIndex}.file`}
              control={control}
              render={({ field }) => (
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    handleFileChange(e, videoIndex, field.onChange)
                  }
                />
              )}
            />
          </Form.Item>
          {durations ? <p>Duration : {formatDuration(durations)}</p> : ""}

          {previews[videoIndex] && (
            <div className="mt-2">
              <video
                src={previews[videoIndex]}
                width="50%"
                controls
                autoplay
                style={{ borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </div>
          )}

          <Button danger type="link" onClick={() => remove(videoIndex)}>
            Remove Video
          </Button>
        </div>
      ))}

      <Button
        type="dashed"
        onClick={() => append({ title: "", description: "", file: null })}
      >
        + Add Video
      </Button>
    </div>
  );
};

const AddLession = ({ visible, onClose, courseId }) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmittings, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
    setValue,
  } = useForm({
    resolver: zodResolver(lessionSchema),
    defaultValues: {
      lectures: [
        {
          courseId: courseId || "",
          lectureName: "",
          description: "",
          isFreePreview: false,
          videos: [],
        },
      ],
    },
  });

  const {
    fields: lectureFields,
    append: appendLecture,
    remove: removeLecture,
  } = useFieldArray({
    control,
    name: "lectures",
  });

  useEffect(() => {
    if (courseId) {
      reset({
        lectures: [
          {
            courseId: courseId,
            lectureName: "",
            description: "",
            isFreePreview: false,
            videos: [],
          },
        ],
      });
    }
  }, [courseId, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await addAllLectures(data.lectures);

      if (res) {
        toast.success("Lecture(s) submitted successfully!");
        reset();
        setSuccess("Lecture(s) added.");
        setTimeout(() => {
          setSuccess("");
          onClose();
        }, 1000);

        setError("");
      }
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setError("Failed to add lectures. Please try again.");
      toast.error(err?.response?.data?.message || err?.message);
    }
  };

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
        {lectureFields.map((lecture, lectureIndex) => (
          <div
            key={lecture.id}
            className="mb-6 p-4 border bg-blue-300 !bg-blue-300 rounded-md shadow-sm"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-semibold mb-2 text-lg">
                Lecture {lectureIndex + 1}
              </h4>
              <div>
                <Form.Item label="Free Preview">
                  <Controller
                    name={`lectures.${lectureIndex}.isFreePreview`}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={(val) => field.onChange(val)}
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </div>

            <Form.Item
              label="Lecture Name"
              validateStatus={
                errors?.lectures?.[lectureIndex]?.lectureName ? "error" : ""
              }
              help={errors?.lectures?.[lectureIndex]?.lectureName?.message}
            >
              <Controller
                name={`lectures.${lectureIndex}.lectureName`}
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Enter Lecture Name" />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Description"
              validateStatus={
                errors?.lectures?.[lectureIndex]?.description ? "error" : ""
              }
              help={errors?.lectures?.[lectureIndex]?.description?.message}
            >
              <Controller
                name={`lectures.${lectureIndex}.description`}
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

            <Divider orientation="left">Videos</Divider>
            <VideoList control={control} lectureIndex={lectureIndex} />

            {lectureIndex > 0 && (
              <Button
                disabled={isSubmittings}
                danger
                type="link"
                onClick={() => removeLecture(lectureIndex)}
                size="small"
              >
                Remove Lecture
              </Button>
            )}
          </div>
        ))}

        <Space className="mb-4">
          <Button
            type="dashed"
            disabled={isSubmittings}
            onClick={() =>
              appendLecture({
                courseId: courseId || "",
                lectureName: "",
                description: "",
                isFreePreview: false,
                videos: [],
              })
            }
          >
            + Add Lecture
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            disabled={isSubmittings}
          >
            Submit
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};

export default AddLession;
