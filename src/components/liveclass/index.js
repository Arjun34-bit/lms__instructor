import React, { useState } from 'react';
import axios from 'axios';

const LiveClassManagement = () => {
  const [classData, setClassData] = useState({
    title: '',
    instructor: '',
    startTime: '',
    endTime: '',
  });
  const [joinClassId, setJoinClassId] = useState('');
  const [message, setMessage] = useState('');
  const [classDetails, setClassDetails] = useState(null);

  const handleCreateClassChange = (e) => {
    const { name, value } = e.target;
    setClassData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleJoinClassChange = (e) => {
    setJoinClassId(e.target.value);
  };

  const handleCreateClass = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/live-classes', classData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming the token is stored in localStorage
        },
      });
      setMessage('Live class created successfully!');
      setClassDetails(response.data);
    } catch (error) {
      setMessage('Failed to create live class');
    }
  };

  const handleJoinClass = async () => {
    try {
      const response = await axios.post(`http://localhost:3001/api/live-classes/${joinClassId}/join`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming the token is stored in localStorage
        },
      });
      setMessage('Joined class successfully!');
      setClassDetails(response.data);
    } catch (error) {
      setMessage('Failed to join class');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Live Class Management</h2>

      <div className="card mb-4">
        <div className="card-header">Create a Live Class</div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Class Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              value={classData.title}
              onChange={handleCreateClassChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="instructor" className="form-label">Instructor Name</label>
            <input
              type="text"
              id="instructor"
              name="instructor"
              className="form-control"
              value={classData.instructor}
              onChange={handleCreateClassChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="startTime" className="form-label">Start Time</label>
            <input
              type="datetime-local"
              id="startTime"
              name="startTime"
              className="form-control"
              value={classData.startTime}
              onChange={handleCreateClassChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="endTime" className="form-label">End Time</label>
            <input
              type="datetime-local"
              id="endTime"
              name="endTime"
              className="form-control"
              value={classData.endTime}
              onChange={handleCreateClassChange}
            />
          </div>
          <button className="btn btn-primary" onClick={handleCreateClass}>Create Class</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Join a Live Class</div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="classId" className="form-label">Class ID</label>
            <input
              type="text"
              id="classId"
              className="form-control"
              value={joinClassId}
              onChange={handleJoinClassChange}
            />
          </div>
          <button className="btn btn-success" onClick={handleJoinClass}>Join Class</button>
        </div>
      </div>

      <div className="alert alert-info mt-4" role="alert">
        {message}
      </div>

      {classDetails && (
        <div className="alert alert-success mt-4">
          <h4>Class Details:</h4>
          <p><strong>Title:</strong> {classDetails.title}</p>
          <p><strong>Instructor:</strong> {classDetails.instructor}</p>
          <p><strong>Start Time:</strong> {new Date(classDetails.startTime).toLocaleString()}</p>
          <p><strong>End Time:</strong> {new Date(classDetails.endTime).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default LiveClassManagement;
