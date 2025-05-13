import React, { useState } from 'react';
import { Button, Form, Input, Alert, Typography, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { authLoginWithPhoneApi } from '../../api/queries/authQueries';

const { Title, Text } = Typography;

const PhoneLogin = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const handlePhoneVerification = async () => {
    try {
      if (!phoneNumber) {
        setError('Please enter phone number');
        return;
      }

      setLoading(true);
      const reCAPTCHA = new RecaptchaVerifier(auth, 'recaptcha',{

      })
      const formattedPhone = `+91${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        reCAPTCHA   
         );
      
      setVerificationId(confirmationResult);
      setShowOtpModal(true);
      setError('');
      setSuccess('OTP sent successfully');
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const credential = await verificationId.confirm(otp);
      const idToken = await credential.user.getIdToken();
      
      const response = await authLoginWithPhoneApi(idToken);
      if (response?.data) {
        setSuccess('Login successful!');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error) {
      setError(error?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
      setShowOtpModal(false);
    }
  };

  return (
    <div style={{
      width: 400,
      margin: 'auto',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
      <div id="recaptcha-container" />
      
      <Title level={2}>Login with Phone</Title>
      <Text type="secondary">Enter your phone number to continue</Text>

      {error && <Alert message={error} type="error" showIcon style={{ marginTop: 16, width: '100%' }} />}
      {success && <Alert message={success} type="success" showIcon style={{ marginTop: 16, width: '100%' }} />}

      <Form layout="vertical" style={{ width: '100%', marginTop: 24 }}>
        <Form.Item label="Phone Number">
          <Input
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            onClick={handlePhoneVerification}
            loading={loading}
            block
          >
            Send OTP
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="Enter OTP"
        open={showOtpModal}
        onOk={handleLogin}
        onCancel={() => setShowOtpModal(false)}
        confirmLoading={loading}
        okText="Login"
      >
        <Input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={{ marginTop: '20px' }}
        />
      </Modal>
    </div>
  );
};

export default PhoneLogin;