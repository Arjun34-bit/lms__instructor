import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { Button, Table, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import Modal from "./CourseModal";

const Course = () => {
  const location = useLocation();
  const alertMessage = location.state?.alert;
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customError, setCustomError] = useState(null); // Custom error for specific messages

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:3001/api/courses/instructor", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 404 && data.message === "No courses found for this instructor") {
          setCustomError(data.message); // Handle specific error
        } else if (response.ok) {
          setCourses(data.courses || []);
        } else {
          throw new Error("Unexpected response from server.");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleViewDescription = (id) => {
    const course = courses.find((course) => course._id === id);
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const handleRemoveCourse = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/courses/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove course. Please try again.");
      }

      setCourses(courses.filter((course) => course._id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className="content-area p-4"
        style={{
          marginLeft: "250px",
          marginTop: "30px",
          flexGrow: 1,
        }}
      >
        <h2 className="mb-4">Courses</h2>
        {alertMessage && <Alert variant="success">{alertMessage}</Alert>}
        {error && <Alert variant="danger" className="text-center">{error}</Alert>}
        {customError && (
          <Alert variant="warning" className="text-center">
            {customError}
          </Alert>
        )}
        <Link to="/addcourse" className="btn btn-primary mb-4">
          Add Course
        </Link>

        {courses.length === 0 && !customError ? (
          <div className="alert alert-warning text-center">No courses available.</div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Course Name</th>
                <th>Thumbnail</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const thumbnailUrl = course.thumbnail
                  ? `${course.thumbnail}`
                  : "https://via.placeholder.com/150";

                return (
                  <tr key={course._id}>
                    <td>{course._id}</td>
                    <td>{course.title}</td>
                    <td>
                      <img src={thumbnailUrl} alt={course.title} width="100" height="100" />
                    </td>
                    <td>
                      <Button
                        variant="info"
                        className="me-2"
                        onClick={() => handleViewDescription(course._id)}
                      >
                        View Description
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleRemoveCourse(course._id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}

        {modalOpen && (
          <Modal
            course={selectedCourse}
            closeModal={() => setModalOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default Course;
