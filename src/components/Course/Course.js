import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import "./Course.css";
import Modal from "./CourseModal";
import { Link } from "react-router-dom";

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/courses");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

 

  const handleRemoveCourse = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/courses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setCourses(courses.filter((course) => course.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleViewDescription = (id) => {
    const course = courses.find((course) => course.id === id);
    setSelectedCourse(course);
    setModalOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
      <div>
        <input
          type="text"
          value={newCourseName}
          onChange={(e) => setNewCourseName(e.target.value)}
          placeholder="Course Name"
        />
        <input
          type="text"
          value={newCourseDescription}
          onChange={(e) => setNewCourseDescription(e.target.value)}
          placeholder="Course Description"
        />
        {/* <button onClick={handleAddCourse}>Add Course</button> */}
      </div>
    </>
  );
};

export default Course;
