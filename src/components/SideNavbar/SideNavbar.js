import React, { useState } from "react";
import "./SideNavbar.css";
import { Link } from "react-router-dom";
function SideMenu() {
  return (
    <div className="side-navbar">
      <div className="sidebar">
        <ul className="nav-list">
          <li>
            <Link to="/course">
              <span className="links_name">Courses</span>
            </Link>
          </li>
          <li>
            <span className="links_name">Library</span>
          </li>
          <li>
            <span className="links_name">Reels</span>
          </li>
          <li>
            <span className="links_name">Results</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SideMenu;
