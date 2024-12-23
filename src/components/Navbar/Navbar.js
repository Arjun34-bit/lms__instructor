import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "boxicons";
import { Button } from "react-bootstrap";
import { FaBook, FaUsers, FaFilm, FaChartBar } from "react-icons/fa"; // FontAwesome icons
import TidioChat from './TidioChat';
function NavbarAndSideMenu() {
  const [isValidToken, setIsValidToken] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      validateToken(token);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.valid) {
        setIsValidToken(true);
        setUserData(data.user);
      } else {
        setIsValidToken(false);
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Error validating token:", error);
      setIsValidToken(false);
      localStorage.removeItem("authToken");
    }
  };

  return (
    <div className="d-flex">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top w-100">
        <div className="container-fluid">
          <Link to="/dashboard" className="navbar-brand text-dark">
            Instructor Dashboard
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <box-icon
                  name="bell"
                  type="solid"
                  animation="tada"
                  flip="horizontal"
                  size="30px"
                  className="text-dark"
                ></box-icon>
              </li>

              <li className="nav-item ms-3">
                <Button variant="primary">Live Class</Button>
              </li>
              <li className="nav-item ms-3">
              <TidioChat />
              </li>

              {isValidToken && userData ? (
                <li className="nav-item ms-3">
                  <Button
                    variant="outline-dark"
                    className="d-flex align-items-center"
                    onClick={() => (window.location.href = `/user-profile/${userData.id}`)}
                  >
                    {userData.email}
                    <box-icon
                      name="user-circle"
                      type="solid"
                      size="24px"
                      className="ms-2"
                    ></box-icon>
                  </Button>
                </li>
              ) : (
                <li className="nav-item ms-3">
                  <Button
                    variant="outline-dark"
                    onClick={() => (window.location.href = "/login")}
                  >
                    Login
                  </Button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Side Menu */}
      <div
        className="side-navbar bg-light p-3"
        style={{
          position: "fixed",
          top: "60px", // To prevent overlap with navbar
          left: 0,
          height: "calc(100vh - 60px)", // To fill the remaining height below navbar
          width: "250px",
          zIndex: 1000,
          paddingTop: "0", // Optional, remove any extra top padding
        }}
      >
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="/course" className="nav-link text-dark">
              <FaBook size={20} />
              <span className="ms-2">Courses</span>
            </Link>
          </li>
          <li className="nav-item">
            <span className="nav-link text-dark">
              <FaUsers size={20} />
              <span className="ms-2">Library</span>
            </span>
          </li>
          <li className="nav-item">
            <span className="nav-link text-dark">
              <FaFilm size={20} />
              <span className="ms-2">Reels</span>
            </span>
          </li>
          <li className="nav-item">
            <span className="nav-link text-dark">
              <FaChartBar size={20} />
              <span className="ms-2">Results</span>
            </span>
          </li>
        </ul>
      </div>

      {/* Content Area */}
      
    </div>
  );
}

export default NavbarAndSideMenu;
