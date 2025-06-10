import React, { useEffect, useState } from "react";
import { Button, Form, Input, Alert, Typography, Select, Modal } from "antd";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema } from "./schema/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { authRegisterApi } from "../../api/queries/authQueries";
import { useQuery } from "@tanstack/react-query";
import { fetchDepartmentsApi } from "../../api/queries/commonQueries";
import AntdSpinner from "../Spinner/Spinner";
import { Divider } from "antd";
import PhoneInput from "react-phone-input-2";

import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase/config";

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [OTPLoading, setOTPLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState(null);

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
      password: "",
      phoneNumber: "",
    },
  });

  const handlePhoneVerification = async (phoneNumber) => {
    try {
      // Validate all required fields
      if (!phoneNumber) {
        setError("Please enter mobile number");
        return;
      }

      setLoading(true);
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );

        await window.recaptchaVerifier.render();
      }

      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;
      const reCAPTCHA = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        reCAPTCHA
      );

      setVerificationId(confirmationResult);
      setShowOtpModal(true);
      setError("");
      setSuccess("OTP sent successfully");
    } catch (error) {
      console.log(error);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleOtpSubmit = async () => {
    try {
      setOTPLoading(true);
      const credential = await verificationId.confirm(otp);
      const idToken = await credential.user.getIdToken();

      setSuccess("Phone Number Verified");
      setIsPhoneVerified(true);
    } catch (error) {
      setSuccess("");
      setError(
        error?.response?.data?.message ||
          "OTP Verification Failed. Please try again."
      );
    } finally {
      setOTPLoading(false);
      setShowOtpModal(false);
    }
  };

  const onRegisterSubmit = async (data) => {
    try {
      if (!isPhoneVerified) {
        setError("Please verify your phone number");
        return;
      }
      setLoading(true);
      data.idToken = await auth.currentUser.getIdToken();
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
      <div id="recaptcha-container" />
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
          label="Phoneno*"
          validateStatus={errors.phoneNumber ? "error" : ""}
          help={errors.phoneNumber?.message}
        >
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => {
              const cleanedValue = field.value?.replace(/^\+/, "");
              return (
                <div style={{ display: "flex", gap: 8 }}>
                  <PhoneInput
                    country={"in"}
                    {...field}
                    onChange={(value) => field.onChange(`+${value}`)}
                    value={cleanedValue}
                    inputStyle={{ width: "100%" }}
                    containerStyle={{ flex: 1 }}
                  />
                  {cleanedValue && cleanedValue.length >= 12 && (
                    <Button
                      type="primary"
                      onClick={() => handlePhoneVerification(field?.value)}
                      loading={loading}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              );
            }}
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
              {isSubmitting ? "Registering..." : "Register with Email"}
            </Button>
          </Form.Item>
          <Divider>OR</Divider>
          <Form.Item>
            <Link to="/phone-register">
              <Button block>Register with Phone Number</Button>
            </Link>
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Link to={"/login"}>Already have an account? Log in</Link>
          </div>
        </div>
      </Form>
      <Modal
        title="Enter OTP"
        open={showOtpModal}
        onOk={handleOtpSubmit}
        onCancel={() => setShowOtpModal(false)}
        confirmLoading={OTPLoading}
        okText="Verify "
      >
        <Input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={{ marginTop: "20px" }}
        />
      </Modal>
      ;
    </div>
  );
};

export default Register;
