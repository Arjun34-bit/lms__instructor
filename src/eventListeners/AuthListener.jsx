import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      navigate("/login", { replace: true });
    };

    window.addEventListener("unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [navigate]);

  return null; // This component does not render anything
};

export default AuthListener;
