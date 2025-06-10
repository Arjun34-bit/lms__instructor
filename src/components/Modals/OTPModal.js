const OTPModal = (showOtpModal, handleOtpSubmit, loading, setShowOtpModal) => {
  return (
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
        style={{ marginTop: "20px" }}
      />
    </Modal>
  );
};
