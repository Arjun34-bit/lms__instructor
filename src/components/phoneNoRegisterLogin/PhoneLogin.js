import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase/config";
// import { authLoginWithPhoneApi } from '../../api/queries/authQueries';
import PhoneAuthForm from "./PhoneAuthForm";

const PhoneLogin = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  const handlePhoneVerification = async () => {
    try {
      if (!phoneNumber) {
        setError("Please enter phone number");
        return;
      }
      setLoading(true);
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
      }
      const reCAPTCHA = window.recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;
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

  const handleLogin = async () => {
    try {
      setLoading(true);
      const credential = await verificationId.confirm(otp);
      const idToken = await credential.user.getIdToken();
      console.log("login", idToken);

      const response = null;
      //   await authLoginWithPhoneApi(idToken);
      if (response?.data) {
        setSuccess("Login successful!");
        setTimeout(() => navigate("/dashboard"), 1000);
      }
    } catch (error) {
      setError(
        error?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
      setShowOtpModal(false);
    }
  };

  return (
    <PhoneAuthForm
      title="Login with Phone"
      subtitle="Enter your phone number to continue"
      onPhoneSubmit={handlePhoneVerification}
      onOtpSubmit={handleLogin}
      loading={loading}
      error={error}
      success={success}
      showOtpModal={showOtpModal}
      otp={otp}
      setOtp={setOtp}
      phoneNumber={phoneNumber}
      setPhoneNumber={setPhoneNumber}
      setShowOtpModal={setShowOtpModal}
      okText="Login"
    />
  );
};

export default PhoneLogin;
