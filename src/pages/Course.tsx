import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/api/courses');
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await axios.delete(`/api/courses/${id}`);
                setSuccessMessage('Course deleted successfully!');
                fetchCourses();
            } catch (error) {
                console.error('Error deleting course:', error);
            }
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0"><i className="fas fa-book"></i> Courses</h1>
                        </div>
                        <div className="col-sm-6 text-right">
                            <Link to="/courses/create" className="btn btn-primary">
                                <i className="fas fa-plus"></i> Create New Course
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {successMessage && (
                        <div className="alert alert-success">
                            <i className="fas fa-check-circle"></i> {successMessage}
                        </div>
                    )}

                    <div className="card">
                        <div className="card-body p-0">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Level</th>
                                        <th>Type</th>
                                        <th>Price</th>
                                        <th>Created By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map(course => (
                                        <tr key={course._id}>
                                            <td>{course.title}</td>
                                            <td><span className="badge bg-primary">{course.category}</span></td>
                                            <td><span className="badge bg-secondary">{course.level}</span></td>
                                            <td><span className="badge bg-success">{course.type || 'N/A'}</span></td>
                                            <td>${course.price.toFixed(2)}</td>
                                            <td>
                                                {course.instructor && course.instructor.role === 'admin' ? (
                                                    <span className="badge bg-info">Created by Admin</span>
                                                ) : (
                                                    <span className="badge bg-info">Created by {course.instructor?.name || 'Unknown'} (Instructor)</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex">
                                                    <Link to={`/courses/${course._id}`} className="btn btn-sm btn-info mr-1">
                                                        <i className="fas fa-eye"></i> View
                                                    </Link>
                                                    <Link to={`/courses/${course._id}/edit`} className="btn btn-sm btn-warning mr-1">
                                                        <i className="fas fa-edit"></i> Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(course._id)}
                                                        className="btn btn-sm btn-danger"
                                                    >
                                                        <i className="fas fa-trash"></i> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CoursesPage;
