import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Button, Dropdown } from "react-bootstrap";
import { FaBook, FaUsers, FaFilm, FaChartBar, FaBell } from "react-icons/fa";
import TidioChat from "./TidioChat";
import { getLocalStorageUser } from "../../utils/localStorageUtils";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";

function NavbarAndSideMenu() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getLocalStorageUser();
    setUserData({ ...user });
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="d-flex">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-primary shadow-sm fixed-top w-100">
        <div className="container-fluid">
          <Link to="/dashboard" className="navbar-brand text-white fw-bold">
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
                <FaBell
                  className="text-white me-3"
                  size={24}
                  title="Notifications"
                />
              </li>

              <li className="nav-item">
                <Link to={"/liveclasses"}>
                  <Button variant="light" className="fw-bold">
                    Live Class
                  </Button>
                </Link>
              </li>
              <li className="nav-item ms-3">{/* <TidioChat /> */}</li>

              {userData ? (
                <li className="nav-item ms-3">
                  <Dropdown>
                    <Dropdown.Toggle variant="light" id="user-dropdown">
                      {userData.email}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() =>
                          (window.location.href = `/user-profile/${userData.id}`)
                        }
                      >
                        Profile
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        onClick={handleLogout}
                        className="text-danger"
                      >
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </li>
              ) : (
                <li className="nav-item ms-3">
                  <Button
                    variant="light"
                    onClick={() => (window.location.href = "/login")}
                    className="fw-bold"
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
        className="side-navbar bg-dark text-white p-3"
        style={{
          position: "fixed",
          top: "55px",
          left: 0,
          height: "100%",
          width: "250px",
          zIndex: 1000,
        }}
      >
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink
              to="/dashboard"
              className="nav-link text-white py-2"
              activeClassName="bg-primary text-white rounded"
            >
              <FaBook size={20} />
              <span className="ms-2">Dashboard</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/course"
              className="nav-link text-white py-2"
              activeClassName="bg-primary text-white rounded"
            >
              <FaBook size={20} />
              <span className="ms-2">Courses</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/library"
              className="nav-link text-white py-2"
              activeClassName="bg-primary text-white rounded"
            >
              <FaUsers size={20} />
              <span className="ms-2">Library</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/reels"
              className="nav-link text-white py-2"
              activeClassName="bg-primary text-white rounded"
            >
              <FaFilm size={20} />
              <span className="ms-2">Reels</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/results"
              className="nav-link text-white py-2"
              activeClassName="bg-primary text-white rounded"
            >
              <FaChartBar size={20} />
              <span className="ms-2">Results</span>
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Content Area */}
      <div
        className="content"
        style={{ marginLeft: "250px", marginTop: "60px", padding: "20px" }}
      >
        {/* Add content here */}
      </div>
      <TidioChat />
    </div>
  );
}

export default NavbarAndSideMenu;
