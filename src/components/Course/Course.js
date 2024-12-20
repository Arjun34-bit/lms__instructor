import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Modal from "./CourseModal";
import { Button, Table, Spinner, Alert } from "react-bootstrap"; // Importing Bootstrap components
import { FaBook, FaUsers, FaFilm, FaChartBar } from "react-icons/fa"; // FontAwesome icons
import { Link } from "react-router-dom"; // For the links in the side menu

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token
        const userId = decodedToken.id; // Get the userId from the token payload
        console.log("Decoded User ID from Token:", userId); // Debug: log userId from the token

        const response = await fetch("http://localhost:3001/api/courses", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses. Please try again.");
        }

        const data = await response.json();
        console.log("Fetched Data:", data); // Debug: log the fetched data

        // Access the "courses" array from the response
        const coursesData = data.courses;

        if (!Array.isArray(coursesData)) {
          throw new Error("Invalid data format received from the server.");
        }

        // Filter courses that belong to the authenticated user based on the userId
        const userCourses = coursesData.filter((course) => course.instructor_id._id === userId);
        console.log("Filtered User Courses:", userCourses); // Debug: log filtered user courses

        setCourses(userCourses);
      } catch (error) {
        console.error("Error fetching courses:", error); // Debug: log error
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

  if (error) {
    return (
      <div className="alert-container">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </div>
    );
  }

  return (
  <>
        <Navbar />
          <div
        className="content-area p-4"
        style={{
          marginLeft: "250px", // Offset for the side navbar
          marginTop: "30px",  // To offset the navbar
          flexGrow: 1,        // Ensure content fills remaining space
        }}
      > 
        <h2 className="mb-4">Courses</h2>
        <Link to="/addcourse" className="btn btn-primary mb-4">Add Course</Link>

        {courses.length === 0 ? (
          <div className="alert alert-warning text-center">No courses found.</div>
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
                  : "https://via.placeholder.com/150"; // Fallback in case there's no thumbnail

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
