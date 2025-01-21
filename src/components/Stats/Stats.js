import React from "react";
import "./Stats.css";
import { FaEye } from "react-icons/fa";
import { FaThumbsUp } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
const Stats = () => {
  return (
    <div className="stats-container">
     
      <div className="stats-box">
        <div className="stats-details">
          <h2>Total Views</h2>
          <div className="value">100k</div>
        </div>
        <FaEye style={{ marginRight: "13px", color: "white" , fontSize:"42px" }} />
      </div>
      <div className="stats-box">
        <div className="stats-details">
          <h2>Total Likes</h2>
          <div className="value">100k</div>
        </div>
        <FaThumbsUp style={{ marginRight: "13px", color: "white" , fontSize:"42px" }} />
      </div>
      <div className="stats-box">
        <div className="stats-details">
          <h2>Comments</h2>
          <div className="value">100k</div>
        </div>
        <FaMessage style={{ marginTop: "13px", color: "white" , fontSize:"42px" }} />
      </div>
    </div>
  );
};

export default Stats;
