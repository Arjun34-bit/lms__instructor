import React from "react";
import "./Navbar.css";
import "boxicons";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div>
      <nav>
        <div className="nav-content">
          <div className="logo">
            <Link to="/">
            <a className="logo-name" href="#">
              Instructor Dashboard
            </a>
            </Link>
          </div>
          <ul className="nav-links">
            <li className="notification-icon" style={{ marginTop: "10px" }}>
              <box-icon
                name="bell"
                type="solid"
                animation="tada"
                flip="horizontal"
                class="bell-icon"
                size="30px"
              ></box-icon>
            </li>
            <li>
              <button className="liveclass-btn">Live Class</button>
            </li>

            <li>
              <button
                class="profile-button"
                onclick="window.location.href='user-profile.html'"
              >
                User profile
                <box-icon
                  name="user-circle"
                  type="solid"
                  style={{ marginLeft: "10px" }}
                ></box-icon>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
