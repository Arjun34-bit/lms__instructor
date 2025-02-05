import React, { useState } from "react";
import { Button, Form, Input, Alert, Typography, Select } from "antd";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema } from "./schema/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { authRegisterApi } from "../../api/queries/authQueries";
import { useQuery } from "@tanstack/react-query";
import { fetchDepartmentsApi } from "../../api/queries/commonQueries";
import AntdSpinner from "../Spinner/Spinner";

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { data: departmentsData, isLoading: departmentsDataLoading } = useQuery(
    {
      queryFn: () => fetchDepartmentsApi(),
      keepPreviousData: true,
    }
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
  });

  const onRegisterSubmit = async (data) => {
    try {
      const registerResponse = await authRegisterApi(data);
      if (registerResponse?.data) {
        setSuccess(
          registerResponse?.data?.message ||
            `Account created successfully! Please verify your email!`
        );
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  if (departmentsDataLoading) {
    return <AntdSpinner />;
  }

  return (
    <div
      style={{
        width: 600,
        margin: "auto",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Title level={2}>Instructor Register</Title>
      <Text type="secondary">Create an account</Text>
      {error && (
        <Alert message={error} type="error" showIcon className="my-2" />
      )}
      {success && (
        <Alert message={success} type="success" showIcon className="my-2" />
      )}
      <Form
        layout="vertical"
        style={{ width: "100%" }}
        onFinish={handleSubmit(onRegisterSubmit)}
      >
        <Form.Item
          label="Name*"
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter your name" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Email*"
          validateStatus={errors.email ? "error" : ""}
          help={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter your email" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Phone Number*"
          validateStatus={errors.phoneNumber ? "error" : ""}
          help={errors.phoneNumber?.message}
        >
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter your phone number" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Password*"
          validateStatus={errors.password ? "error" : ""}
          help={errors.password?.message}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password {...field} placeholder="Enter your password" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Department"
          validateStatus={errors.department ? "error" : ""}
        >
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select department (optional)">
                {departmentsData?.data &&
                  departmentsData?.data?.map((department, index) => {
                    return (
                      <Option value={department?.id} key={index}>
                        {department?.name}
                      </Option>
                    );
                  })}
              </Select>
            )}
          />
        </Form.Item>
        <div>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Link to={"/login"}>Already have an account? Log in</Link>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default Register;
