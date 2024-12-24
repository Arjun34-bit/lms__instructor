import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";

const CourseForm = ({ userId, onSubmit, errors, success, error }) => {
  // PropTypes validation
  CourseForm.propTypes = {
    userId: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    errors: PropTypes.array,
    success: PropTypes.string,
    error: PropTypes.string,
  };

  // States
  const [formData, setFormData] = useState({
    title: "",
    level: "",
    description: "",
    category_id: "",
    live_days: [],
    live_time: "",
    start_date: "",
    end_date: "",
    department_id: "",
    subject_id: "",
    language: "",
    duration: "",
    is_free: false,
    price: "",
    thumbnail: null,
  });

  const [userDetails, setUserDetails] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState("");

  // Fetch user details, languages, and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [userResponse, languageResponse, categoryResponse] = await Promise.all([
          fetch(`http://localhost:3001/api/auth/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3001/api/languages"),
          fetch("http://localhost:3001/api/category"),
        ]);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserDetails(userData.user);
        } else {
          throw new Error("Failed to fetch user details.");
        }

        const languagesData = await languageResponse.json();
        const categoriesData = await categoryResponse.json();
        setLanguages(languagesData);
        setCategories(categoriesData);
      } catch (err) {
        setErrorState(err.message || "An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Filter subjects based on selected department
  useEffect(() => {
    if (formData.department_id && userDetails?.subjects) {
      setFilteredSubjects(
        userDetails.subjects.filter(
          (subject) => subject.department.id === formData.department_id
        )
      );
    } else {
      setFilteredSubjects([]);
    }
  }, [formData.department_id, userDetails]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "live_days") {
      setFormData((prev) => ({
        ...prev,
        live_days: checked
          ? [...prev.live_days, value]
          : prev.live_days.filter((day) => day !== value),
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        thumbnail: e.target.files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    // Prepare form data to be sent in the request
    const formDataToSend = new FormData();
  
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        formDataToSend.append(key, formData[key]);
      }
    }
  
    formDataToSend.append("userId", userId);
    formDataToSend.append("token", token);
  
    try {
      // Make the POST request to your backend
      const response = await fetch("http://localhost:3001/api/courses/store", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
      });
  
      if (response.ok) {
        const data = await response.json();
        onSubmit(data); // Call the onSubmit callback with the response data
      } else {
        const errorData = await response.json();
        setErrorState(errorData.message || "Failed to create course.");
      }
    } catch (err) {
      setErrorState(err.message || "An error occurred while submitting the form.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (errorState) {
    return <Alert variant="danger">{errorState}</Alert>;
  }

  return (
    <div className="content-wrapper p-4">
      <h1 className="mb-4">Create New Course</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {errors?.length > 0 && (
        <Alert variant="danger">
          <ul>
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="title">
              <Form.Label>Course Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="level">
              <Form.Label>Level</Form.Label>
              <Form.Select
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
              >
                <option value="">Select Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Course Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="category_id">
          <Form.Label>Category</Form.Label>
          {categories.map((category) => (
            <Form.Check
              key={category._id}
              type="radio"
              name="category_id"
              value={category._id}
              label={category.name}
              checked={formData.category_id === category._id}
              onChange={handleChange}
            />
          ))}
        </Form.Group>

        {formData.category_id === "live" && (
          <>
            <Form.Group className="mb-3" controlId="live_days">
              <Form.Label>Live Class Days</Form.Label>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <Form.Check
                  key={day}
                  type="checkbox"
                  name="live_days"
                  value={day.toLowerCase()}
                  label={day}
                  onChange={handleChange}
                />
              ))}
            </Form.Group>

            <Form.Group className="mb-3" controlId="live_time">
              <Form.Label>Live Class Time</Form.Label>
              <Form.Control
                type="text"
                name="live_time"
                value={formData.live_time}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </>
        )}

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="start_date">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="end_date">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="department_id">
              <Form.Label>Department</Form.Label>
              <Form.Control
                as="select"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                {userDetails?.departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="subject_id">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                as="select"
                name="subject_id"
                value={formData.subject_id}
                onChange={handleChange}
              >
                <option value="">Select Subject</option>
                {filteredSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="language">
          <Form.Label>Language</Form.Label>
          <Form.Control
            as="select"
            name="language"
            value={formData.language}
            onChange={handleChange}
          >
            <option value="">Select language</option>
            {languages.map((language) => (
              <option key={language._id} value={language._id}>
                {language.name} ({language.native_name})
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="duration">
          <Form.Label>Duration</Form.Label>
          <Form.Control
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="is_free">
          <Form.Check
            type="checkbox"
            name="is_free"
            label="Is this course free?"
            checked={formData.is_free}
            onChange={handleChange}
          />
        </Form.Group>

        {!formData.is_free && (
          <Form.Group className="mb-3" controlId="price">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required={!formData.is_free}
            />
          </Form.Group>
        )}

        <Form.Group className="mb-3" controlId="thumbnail">
          <Form.Label>Thumbnail</Form.Label>
          <Form.Control type="file" name="thumbnail" onChange={handleChange} />
        </Form.Group>

        <Button type="submit" variant="primary">
          Create Course
        </Button>
      </Form>
    </div>
  );
};

export default CourseForm;
