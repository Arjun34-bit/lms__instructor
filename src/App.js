import React from "react";
import Homepage from "./components/Homepage/Homepage";
import Course from "./components/Course/Course";
import Register from "./components/register/index";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Notes from "./components/Notes/Notes";
import UserProfile from "./components/Navbar/profile";
import Login from "./components/login/index";
import ProtectedRoute from "./components/ProtectedRoute"; // Import the new component
import Reels from "./components/Reels";
import Library from "./components/Library";
import Results from "./components/Results";
import { Toaster } from "react-hot-toast";
import LiveClasses from "./components/liveclass/index";
import ClassRoom from "./components/liveclass/ClassRoom";
import AuthListener from "./eventListeners/AuthListener";
import PageNotFound from "./components/PageNotFound";
import "bootstrap/dist/css/bootstrap.min.css";
import PhoneRegister from "./components/phoneNoRegisterLogin/PhoneRegister";
import PhoneLogin from "./components/phoneNoRegisterLogin/PhoneLogin";
// import PhoneLogin from "./components/login/PhoneLogin";

const apiUrl = process.env.REACT_APP_API_URL;
console.log("API URL from .env:", apiUrl);
function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <AuthListener />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/login-phone" element={<PhoneLogin />} />
          <Route path="/phone-register" element={<PhoneRegister />} />


          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Homepage />} />
            <Route path="/user-profile/:userId" element={<UserProfile />} />

            <Route path="/course" element={<Course />} />
            <Route path="/library" element={<Library />} />
            <Route path="/results" element={<Results />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/liveclasses" element={<LiveClasses />} />
            <Route path="/reels" element={<Reels />} />
            <Route path="/liveclasses/:classId" element={<ClassRoom />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
