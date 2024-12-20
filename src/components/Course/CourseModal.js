import React from "react";
import './Course.css'
const Modal = ({ course, closeModal }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={closeModal}>
            &times;
          </span>
          <h2>Course Description</h2>
          <p>{course.description}</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;
