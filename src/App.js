import React from "react";
import "./App.css";
import Homepage from "./components/Homepage/Homepage";
import Course from "./components/Course/Course";
import Register from "./components/register/index";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import AddCourseForm from "./components/Course/AddCourseForm";
import Notes from "./components/Notes/Notes";
import UserProfile from "./components/Navbar/profile";
import Login from "./components/login/index";
import LiveClass from "./components/liveclass/index";
import ProtectedRoute from "./components/ProtectedRoute"; // Import the new component
import Reels from "./components/Reels";
import Library from "./components/Library";
import Results from "./components/Results";
import { Toaster } from "react-hot-toast";

const apiUrl = process.env.REACT_APP_API_URL;
console.log("API URL from .env:", apiUrl);
function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Homepage />} />
            <Route path="/user-profile/:userId" element={<UserProfile />} />

            <Route path="/course" element={<Course />} />
            <Route path="/addcourse" element={<AddCourseForm />} />
            <Route path="/library" element={<Library />} />
            <Route path="/results" element={<Results />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/liveclass" element={<LiveClass />} />
            <Route path="/reels" element={<Reels />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
