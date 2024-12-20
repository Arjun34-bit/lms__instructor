import React from "react";
import "./App.css";
import Homepage from "./components/Homepage/Homepage";
import Course from "./components/Course/Course";
import { Routes, Route } from "react-router-dom";
import AddCourseForm from "./components/Course/AddCourseForm";
import Notes from "./components/Notes/Notes";
import Navbar from "./components/Navbar/Navbar";
import Login from "./components/login/index";
import CreateLiveClass from "./components/liveclass/CreateLiveClass";
import LiveClass from "./components/liveclass/index";
import ProtectedRoute from "./components/ProtectedRoute"; // Import the new component

function App() {
  return (
    <>
     
      <Routes>
        <Route path="/create-live-class" element={<CreateLiveClass />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course"
          element={
            <ProtectedRoute>
              <Course />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addcourse"
          element={
            <ProtectedRoute>
              <AddCourseForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/liveclass"
          element={
            <ProtectedRoute>
              <LiveClass />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
