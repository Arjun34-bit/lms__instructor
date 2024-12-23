import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true); // To handle the async loading state
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null); // Store the user ID

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      validateToken(token);
    } else {
      setLoading(false); // If no token, stop loading and set invalid state
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.valid && data.user.role === "instructor") {
        setIsValid(true);
        setUserId(data.user.id); // Store the user ID
      } else {
        setError("Invalid credentials or insufficient permissions.");
        localStorage.removeItem("token"); // Remove invalid token
        setIsValid(false);
      }
    } catch (error) {
      console.error("Error validating token:", error);
      setError("An error occurred during authentication.");
      setIsValid(false);
      localStorage.removeItem("token"); // Remove token in case of error
    }
    setLoading(false); // Set loading to false after API response
  };

  // If loading is true, show a loading spinner or similar
  if (loading) {
    return <div>Loading...</div>;
  }

  // If the token is not valid or the role is not "instructor", redirect to login page
  if (!isValid) {
    return <Navigate to="/login" state={{ error: error }} replace />;
  }

  // If token is valid and user is instructor, render the protected route
  return React.cloneElement(children, { userId }); // Pass userId as a prop to the child component
};

export default ProtectedRoute;
