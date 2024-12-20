import React, { useState } from 'react';
import axios from 'axios';

const CreateLiveClass = () => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [instructor, setInstructor] = useState('');
  const [error, setError] = useState('');
  const [liveClass, setLiveClass] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        'http://localhost:3001/api/liveclass', // Your backend endpoint
        { title, instructor, startTime, endTime },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } } // Pass the token from localStorage
      );
      setLiveClass(response.data); // Set the created live class
    } catch (error) {
      setError('Failed to create live class');
    }
  };

  return (
    <div>
      <h1>Create Live Class</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Instructor:</label>
          <input 
            type="text" 
            value={instructor} 
            onChange={(e) => setInstructor(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Start Time:</label>
          <input 
            type="datetime-local" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>End Time:</label>
          <input 
            type="datetime-local" 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Create Class</button>
      </form>

      {error && <p>{error}</p>}

      {liveClass && (
        <div>
          <h3>Class Created</h3>
          <p>Class ID: {liveClass.classId}</p>
        </div>
      )}
    </div>
  );
};

export default CreateLiveClass;
