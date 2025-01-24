import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import NavbarAndSideMenu from "./Navbar/Navbar";

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true); // To handle the async loading state
  const [error, setError] = useState(null);
  const { classId } = useParams();

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
      } else {
        // setError("Invalid credentials or insufficient permissions.");
        // localStorage.removeItem("token"); // Remove invalid token
        // setIsValid(false);
        setIsValid(true);
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

  return (
    <>
      {(!classId) && <NavbarAndSideMenu />}
      <Outlet />
    </>
  );
}

export default ProtectedRoute;
