import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaBook, FaUsers, FaFilm, FaChartBar } from "react-icons/fa";
import NavbarAndSideMenu from "../Navbar/Navbar";

const CourseForm = ({ onSubmit = () => {}, initialData = {} }) => {
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate(); // Move this to the top-level of the component

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    instructor_id: initialData.instructor_id || "",
    category: initialData.category || "live",
    type: initialData.type || "",
    level: initialData.level || "beginner",
    duration: initialData.duration || "",
    price: initialData.price || 0,
    status: initialData.status || "draft",
    thumbnail: initialData.thumbnail || null, // Handle file object
    metadata: {
      rating: initialData.metadata?.rating || 0,
      enrolled: initialData.metadata?.enrolled || 0,
      language: initialData.metadata?.language || "English",
    },
    bestseller: initialData.bestseller || false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parsedToken = JSON.parse(atob(token.split(".")[1]));
        const instructorId = parsedToken.id;
        setFormData((prev) => ({ ...prev, instructor_id: instructorId }));
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name.startsWith("metadata.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [key]: type === "number" ? parseFloat(value) : value,
        },
      }));
    } else if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formPayload = new FormData();
    formPayload.append("instructor_id", formData.instructor_id);

    for (let key in formData) {
      if (key === "metadata") {
        for (let subKey in formData[key]) {
          formPayload.append(`metadata.${subKey}`, formData[key][subKey]);
        }
      } else if (key !== "instructor_id") {
        formPayload.append(key, formData[key]);
      }
    }

    const response = await fetch("http://localhost:3001/api/courses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formPayload,
    });

    const result = await response.json();

    if (response.ok) {
      setAlertMessage("Course created successfully!");
      onSubmit(result);
      navigate("/course", { state: { alert: "Course created successfully!" } });
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="side-navbar bg-light p-3"
        style={{
          position: "fixed",
          top: "200px",
          left: 0,
          height: "calc(100vh - 200px)",
          width: "250px",
          marginTop: "200px",
          marginBottom: "700px",
          zIndex: 1000,
        }}
      >
       <NavbarAndSideMenu />
      </div>

      {/* Content Area */}
      <Container fluid className="p-4" style={{ marginLeft: "250px", paddingTop: "480px" }}>
        <div className="bg-light p-4 rounded shadow-sm">
          <h4 className="mb-4">Create a New Course</h4>
          <Form onSubmit={handleSubmit}>
            {/* Title and Category */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter course title"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Check
                    inline
                    label="Live"
                    type="radio"
                    name="category"
                    value="live"
                    checked={formData.category === "live"}
                    onChange={handleChange}
                  />
                  <Form.Check
                    inline
                    label="Featured"
                    type="radio"
                    name="category"
                    value="featured"
                    checked={formData.category === "featured"}
                    onChange={handleChange}
                  />
                  <Form.Check
                    inline
                    label="Top Courses"
                    type="radio"
                    name="category"
                    value="top"
                    checked={formData.category === "top"}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Description and Type */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter course description"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Level</Form.Label>
                  <Form.Select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Price and Duration */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter course price"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration</Form.Label>
                  <Form.Control
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="Enter course duration (e.g., 10 hours)"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Thumbnail and Status */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Thumbnail Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="thumbnail"
                    onChange={handleChange}
                    accept="image/*"
                  />
                </Form.Group>
              </Col>
              
            </Row>

           

            <Button type="submit" variant="primary" className="mt-3">
              Submit
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default CourseForm;
