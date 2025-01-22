import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const CourseModal = ({ course, closeModal }) => {
  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      aria-labelledby="courseModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="courseModalLabel">
              {course?.title}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={closeModal}
            ></button>
          </div>
          <div className="modal-body">
            <h6>Instructor: {course?.instructor_name}</h6>
            <p><strong>Email:</strong> {course?.instructor_email}</p>
            <p><strong>Category:</strong> {course?.category}</p>
            <p><strong>Level:</strong> {course?.level}</p>
            <p><strong>Duration:</strong> {course?.duration} minutes</p>
            <p><strong>Price:</strong> ${course?.price}</p>
            <p><strong>Status:</strong> {course?.status}</p>
            <p><strong>Description:</strong></p>
            <p>{course?.description}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
