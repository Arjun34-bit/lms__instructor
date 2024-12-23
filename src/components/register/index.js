import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navigate, useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "instructor",
        phone_number: "",
        departments: [],  // Stores selected departments
        subjects: [],     // Stores selected subjects
    });

    const [departments, setDepartments] = useState([]); // Department data from the API
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch departments with their subjects
        const fetchDepartments = async () => {
            try {
                const response = await axios.get("http://localhost:3001/api/departments/all");
                setDepartments(response.data.data); // Update state with departments and their subjects
            } catch (err) {
                setError("Failed to load departments.");
            }
        };

        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleDepartmentChange = (departmentId) => {
        setFormData((prevFormData) => {
            const isSelected = prevFormData.departments.includes(departmentId);
            const updatedDepartments = isSelected
                ? prevFormData.departments.filter((id) => id !== departmentId)
                : [...prevFormData.departments, departmentId];
            return { ...prevFormData, departments: updatedDepartments };
        });
    };
    
    const handleSubjectChange = (subjectId) => {
        setFormData((prevFormData) => {
            const isSelected = prevFormData.subjects.includes(subjectId);
            const updatedSubjects = isSelected
                ? prevFormData.subjects.filter((id) => id !== subjectId)
                : [...prevFormData.subjects, subjectId];
            return { ...prevFormData, subjects: updatedSubjects };
        });
    };
    
      
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
    
        try {
            // Send departments as an array of department IDs
            const departmentsArray = formData.departments.length > 0
                ? formData.departments  // Use the selected department IDs array
                : [];  // Empty array if no departments are selected
    
            // Send subjects as an array of subject IDs
            const subjectsArray = formData.subjects.length > 0
                ? formData.subjects  // Use the selected subject IDs array
                : [];  // Empty array if no subjects are selected
    
            // Ensure you're sending the updated form data
            const updatedFormData = { 
                ...formData, 
                departments: departmentsArray,  // Send departments as an array of IDs
                subjects: subjectsArray          // Send subjects as an array of IDs
            };
    
            const response = await axios.post("http://localhost:3001/api/auth/register", updatedFormData);
    
            if (formData.role === "instructor") {
                setSuccess("We are reviewing your application for instructor approval. You will be informed soon.");
            } else {
                setSuccess(response.data.message || "Registration successful!");
            }
    
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                navigate("/login");  // Redirect to login page
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };
    
    
    
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header text-center bg-primary text-white">
                            <h2>Register</h2>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="fas fa-exclamation-circle"></i> {error}
                                </div>
                            )}
                            {success && (
                                <div className="alert alert-success" role="alert">
                                    <i className="fas fa-check-circle"></i> {success}
                                </div>
                            )}
                            {loading && (
                                <div className="text-center my-3">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                            {!loading && (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">
                                            <i className="fas fa-user"></i> Name:
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            <i className="fas fa-envelope"></i> Email:
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="phone_number" className="form-label">
                                            <i className="fas fa-phone"></i> Phone Number:
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone_number"
                                            name="phone_number"
                                            className="form-control"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">
                                            <i className="fas fa-lock"></i> Password:
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            className="form-control"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
    <label htmlFor="departments" className="form-label">
        <i className="fas fa-building"></i> Departments:
    </label>
    {departments.length > 0 && (
        <div>
            {departments.map((dept) => (
                <div key={dept.id} className="form-check">
                    <input
                        type="checkbox"
                        id={`department-${dept.id}`}
                        className="form-check-input"
                        checked={formData.departments.includes(dept.id)}
                        onChange={() => handleDepartmentChange(dept.id)}
                    />
                    <label htmlFor={`department-${dept.id}`} className="form-check-label">
                        {dept.name}
                    </label>
                </div>
            ))}
        </div>
    )}
</div>

<div className="mb-3">
    <label htmlFor="subjects" className="form-label">
        <i className="fas fa-book"></i> Subjects:
    </label>
    {formData.departments.length > 0 && (
        <div>
            {formData.departments.map((departmentId) => {
                const department = departments.find((dept) => dept.id === departmentId);
                return department?.subjects.map((subject) => (
                    <div key={subject.id} className="form-check">
                        <input
                            type="checkbox"
                            id={`subject-${subject.id}`}  // Use subject.id
                            className="form-check-input"
                            checked={formData.subjects.includes(subject.id)}  // Check for subject.id
                            onChange={() => handleSubjectChange(subject.id)}  // Use subject.id
                        />
                        <label htmlFor={`subject-${subject.id}`} className="form-check-label">
                            {subject.name}
                        </label>
                    </div>
                ));
            })}
        </div>
    )}
</div>

                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-primary">
                                            <i className="fas fa-user-plus"></i> Register
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
