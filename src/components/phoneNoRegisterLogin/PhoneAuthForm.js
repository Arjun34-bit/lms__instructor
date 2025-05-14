import React from 'react';
import { Button, Form, Input, Alert, Typography, Modal } from 'antd';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
const { Title, Text } = Typography;

const PhoneAuthForm = ({
    title,
    subtitle,
    onPhoneSubmit,
    onOtpSubmit,
    loading,
    error,
    success,
    showOtpModal,
    otp,
    setOtp,
    phoneNumber,
    setPhoneNumber,
    setShowOtpModal,
    okText = "Submit"
}) => (
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
        <Title level={2}>{title}</Title>
        <Text type="secondary">{subtitle}</Text>

        {error && <Alert message={error} type="error" showIcon style={{ marginTop: 16, width: '100%' }} />}
        {success && <Alert message={success} type="success" showIcon style={{ marginTop: 16, width: '100%' }} />}

        <Form layout="vertical" style={{ width: '100%', marginTop: 24 }}>
            <Form.Item label="Phone Number">
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
                    onClick={onPhoneSubmit}
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
            onOk={onOtpSubmit}
            onCancel={() => setShowOtpModal(false)}
            confirmLoading={loading}
            okText={okText}
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

export default PhoneAuthForm;