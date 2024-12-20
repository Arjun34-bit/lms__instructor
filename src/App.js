import React from "react";
import "./App.css";
import Homepage from "./components/Homepage/Homepage";
import Course from "./components/Course/Course";
import { Routes , Route } from "react-router-dom";
import AddCourseForm from "./components/Course/AddCourseForm";
import Notes from "./components/Notes/Notes";

function App() {
  return (
    <>
       <Routes>
        <Route exact path='/' element={<Homepage/>} />
        <Route exact path='/course' element={<Course/>} />
        <Route exact path="/addcourse" element={<AddCourseForm/>} />
        <Route exact path="/notes" element={<Notes/>} />
      </Routes>
    </>
  );
}

export default App;
