import React from "react";
import { Link } from "react-router-dom";
import { FaBook, FaUsers, FaFilm, FaChartBar } from "react-icons/fa"; // FontAwesome icons

function SideMenu() {
  return (
    <div className="side-navbar bg-light p-3" style={{ width: "250px" }}>
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
  );
}

export default SideMenu;
