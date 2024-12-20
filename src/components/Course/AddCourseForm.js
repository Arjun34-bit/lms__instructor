import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import Swal from "sweetalert2";  // Import SweetAlert2
import { useNavigate } from "react-router-dom"; 
import Navbar from "../Navbar/Navbar";

const CourseForm = ({ onSubmit, initialData = {} }) => {
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
    thumbnail: initialData.thumbnail || null,
    metadata: {
      rating: initialData.metadata?.rating || 0,
      enrolled: initialData.metadata?.enrolled || 0,
      language: initialData.metadata?.language || "English",
    },
    bestseller: initialData.bestseller || false,
  });

  const history = useNavigate();  // Initialize useNavigate

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
        [name]: files[0],  // Handle the file input
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
  
    try {
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
        // Show SweetAlert and redirect
        Swal.fire({
          icon: 'success',
          title: 'Course created successfully!',
          text: 'Redirecting to the course page...',
          timer: 2000,
          willClose: () => {
            history.push(`/courses/${result.course._id}`);  // Redirect to the created course page
          }
        });
        onSubmit(result);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: result.message,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'An error occurred',
        text: 'Please try again later.',
      });
      console.error("Error submitting form:", err);
    }
  };

  const handleBack = () => {
    history(-1);  // Use navigate(-1) to go back to the previous page
  };

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
        <Container fluid className="p-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="mb-4">Create New Course</h4>
            {/* Back Button */}
            <Button variant="secondary" onClick={handleBack} className="mb-4">
              Back
            </Button>
            <Form onSubmit={handleSubmit}>
              {/* Title and Category */}
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Course Title</Form.Label>
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
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <div>
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
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Description and Type */}
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter course description"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
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
                  <Form.Group className="mt-3">
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
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
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
                  <Form.Group>
                    <Form.Label>Duration</Form.Label>
                    <Form.Control
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g., 10 hours"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Thumbnail */}
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
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

              {/* Bestseller Checkbox */}
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      name="bestseller"
                      label="Mark as Bestseller"
                      checked={formData.bestseller}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button type="submit" variant="primary" className="mt-3">
                Submit Course
              </Button>
            </Form>
          </div>
        </Container>
      </div>
    </>
  );
};

export default CourseForm;
