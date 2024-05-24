import React, { useState } from "react";
import Navbar from "../Navbar/Navbar";
import "./Course.css";
import Modal from "./CourseModal";
import { Link } from "react-router-dom";

const Course = () => {
  const [courses, setCourses] = useState([
    { id: 1, name: "Course 1", description: "Description for Course 1" },
    { id: 2, name: "Course 2", description: "Description for Course 2" },
  ]);

  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddCourse = () => {
    if (newCourseName.trim() !== "") {
      const newCourse = {
        id: courses.length + 1,
        name: newCourseName,
        description: newCourseDescription,
      };
      setCourses([...courses, newCourse]);
      setNewCourseName("");
      setNewCourseDescription("");
    }
  };

  const handleRemoveCourse = (id) => {
    setCourses(courses.filter((course) => course.id !== id));
  };

  const handleViewDescription = (id) => {
    const course = courses.find((course) => course.id === id);
    setSelectedCourse(course);
    setModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="courses-container">
        <h2>Courses</h2>
        <table className="courses-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Course Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td>
                  <button
                    className="view-description-btn"
                    onClick={() => handleViewDescription(course.id)}
                  >
                    View Description
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveCourse(course.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {modalOpen && (
          <Modal
            course={selectedCourse}
            closeModal={() => setModalOpen(false)}
          />
        )}
      </div>
      <Link to="/addcourse">
        <div className="addcourse-btn">
          <box-icon
            name="plus-circle"
            color="white"
            type="solid"
            size="50px"
            animation="tada"
          ></box-icon>
          <br />{" "}
          <div className="add" style={{ marginRight: "15px", color: "white" }}>
            Add Course
          </div>
        </div>
      </Link>
    </>
  );
};

export default Course;
