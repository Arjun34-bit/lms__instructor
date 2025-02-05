import { Image, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const PageNotFound = () => {
  const navigate = useNavigate();

  // Navigate back to the home page
  const handleGoHome = () => {
    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <Image
          src="/images/404.png"
          alt="Page Not Found"
          preview={false}
          style={styles.image}
        />
        <Title level={2} style={styles.title}>
          Oops! Page Not Found
        </Title>
        <Text style={styles.message}>
          We couldn't find the page you were looking for.
        </Text>
        <Button type="primary" style={styles.button} onClick={handleGoHome}>
          Go to Home
        </Button>
      </div>
    </div>
  );
};

// Add styles for better presentation
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5",
    textAlign: "center",
  },
  content: {
    maxWidth: "400px",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  image: {
    width: "100%",
    height: "auto",
    marginBottom: "20px",
  },
  title: {
    fontWeight: "bold",
    marginBottom: "10px",
  },
  message: {
    display: "block",
    marginBottom: "20px",
    fontSize: "16px",
    color: "#888",
  },
  button: {
    backgroundColor: "#1890ff",
    color: "#fff",
    borderColor: "#1890ff",
  },
};

export default PageNotFound;
