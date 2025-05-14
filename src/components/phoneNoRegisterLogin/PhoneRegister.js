import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useQuery } from "@tanstack/react-query";
import { fetchDepartmentsApi } from "../../api/queries/commonQueries";
import { Select, Input, Form, Alert, Button, Typography, Modal } from "antd";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const { Option } = Select;
const { Title, Text } = Typography;

const PhoneRegister = () => {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [name, setName] = useState('');
    const [departmentId, setDepartmentId] = useState(undefined);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationId, setVerificationId] = useState(null);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');

    const { data: departmentsData, isLoading: departmentsDataLoading } = useQuery({
        queryFn: () => fetchDepartmentsApi(),
        keepPreviousData: true,
    });

    const handlePhoneVerification = async () => {
        try {
            // Validate all required fields
            if (!phoneNumber || !name || !departmentId) {
                setError('Please enter all required fields');
                return;
            }
            
            setLoading(true);
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
            }
            
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
            const reCAPTCHA = window.recaptchaVerifier;
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
            console.log(error);
            setError('Failed to send OTP. Please try again.');
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
            setLoading(true);
            const credential = await verificationId.confirm(otp);
            const idToken = await credential.user.getIdToken();
            console.log(idToken);
            
            const response = null
            //  await authRegisterApi({
            //     name,
            //     phoneNumber,
            //     departmentId,
            //     idToken // Make sure to send the idToken to the backend
            // });
            
            if (response?.data) {
                setSuccess('Registration successful!');
                setTimeout(() => navigate('/login-phone'), 1000);
            }
        } catch (error) {
            setError(error?.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
            setShowOtpModal(false);
        }
    };



    return (
        <div style={{ width: 400, margin: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div id="recaptcha-container" />
            <Title level={2}>Register with Phone</Title>
            <Text type="secondary">Enter your details to register</Text>
            
            {error && <Alert message={error} type="error" showIcon style={{ marginTop: 16, width: '100%' }} />}
            {success && <Alert message={success} type="success" showIcon style={{ marginTop: 16, width: '100%' }} />}
            
            <Form layout="vertical" style={{ width: '100%', marginTop: 24 }}>
                <Form.Item label="Name*" required>
                    <Input
                        placeholder="Enter your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </Form.Item>

                <Form.Item label="Department*" required>
                    <Select
                        placeholder="Select department"
                        value={departmentId}
                        onChange={setDepartmentId}
                        loading={departmentsDataLoading}
                        style={{ width: '100%' }}
                        showSearch
                        optionFilterProp="children"
                        defaultValue={undefined}
                        allowClear
                    >
                        <Option value="" disabled>Select department</Option>
                        {departmentsData?.data &&
                            departmentsData?.data?.map((department, index) => (
                                <Option value={department?.id} key={index}>
                                    {department?.name}
                                </Option>
                            ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Phone Number*" required>
                    <PhoneInput
                        country={'in'}
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        inputStyle={{ width: '100%' }}
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
                onOk={handleOtpSubmit}
                onCancel={() => setShowOtpModal(false)}
                confirmLoading={loading}
                okText="Verify & Register"
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

export default PhoneRegister;