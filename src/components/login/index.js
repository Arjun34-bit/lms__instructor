import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Checkbox,
  Alert,
  Typography,
  Divider,
} from "antd";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  signInWithGoogle,
  signInWithFacebook,
} from "../../config/firebaseConfig";
import { authLoginApi, googleSigninApi } from "../../api/queries/authQueries";
import {
  setAccessToken,
  setLocalStorageUser,
} from "../../utils/localStorageUtils";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "./schema/loginSchema";
const { Title, Text } = Typography;

const Login = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onLoginSubmit = async (data) => {
    try {
      const loginResponse = await authLoginApi({ ...data });
      if (loginResponse?.data?.access_token && loginResponse?.data?.user) {
        setAccessToken(loginResponse?.data?.access_token);
        setLocalStorageUser(loginResponse?.data?.user);
        setSuccess(`Welcome, ${loginResponse?.data?.user?.name}!`);
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
        error?.message ||
        "Google Sign-In Failed. Try again."
      );
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithGoogle();
      const idToken = await userCredential.getIdToken();
      const loginResponse = await googleSigninApi(idToken);
      if (loginResponse?.data?.access_token && loginResponse?.data?.user) {
        setAccessToken(loginResponse?.data?.access_token);
        setLocalStorageUser(loginResponse?.data?.user);
        setSuccess(`Welcome, ${loginResponse?.data?.user?.name}!`);
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (error) {
      setError(error?.message || "Google Sign-In Failed. Try again.");
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const userCredential = await signInWithFacebook();
      const idToken = await userCredential.getIdToken();
      const loginResponse = await googleSigninApi(idToken);
      if (loginResponse?.data?.access_token && loginResponse?.data?.user) {
        setAccessToken(loginResponse?.data?.access_token);
        setLocalStorageUser(loginResponse?.data?.user);
        setSuccess(`Welcome, ${loginResponse?.data?.user?.name}!`);
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (error) {
      setError(error?.message || "Google Sign-In Failed. Try again.");
    }
  };

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
      <Title level={2}>Instructor Login</Title>
      <Text type="secondary">Sign in to your account</Text>
      {error && (
        <Alert message={error} type="error" showIcon className="my-2" />
      )}
      {success && (
        <Alert message={success} type="success" showIcon className="my-2" />
      )}
      <Form
        layout="vertical"
        style={{ width: "100%" }}
        onFinish={handleSubmit(onLoginSubmit)}
      >
        <Form.Item
          label="Email"
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
          label="Password"
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
        <div>
          <Form.Item>
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <Checkbox {...field} checked={field.value === true}>
                  Remember me
                </Checkbox>
              )}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Link to={"/register"}>Create an account</Link>
            <Link to={"/forgot-password"}>Forgot your password?</Link>
          </div>
        </div>
      </Form>
      <Divider>OR</Divider>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        <Button
          shape="circle"
          icon={<FcGoogle size={20} />}
          onClick={handleGoogleSignIn}
        />
        <Button
          shape="circle"
          icon={<FaFacebook size={20} />}
          onClick={handleFacebookSignIn}
        />

      </div>
      <div style={{ marginTop:"10px"}}>
        <Link to="/login-phone">
          <Button block>Login with Phone Number</Button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
