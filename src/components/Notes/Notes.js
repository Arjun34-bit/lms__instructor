import React from "react";
import './Notes.css'
import Navbar from "../Navbar/Navbar";

export default function Notes() {
  return (
    <>
    <Navbar />
    <div className="notes-container">
      <div className="notes-card">
        <div className="notes-content">
          <p className="notes-heading">Card</p>
          <p className="notes-para">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Modi
            laboriosam at voluptas minus culpa deserunt delectus sapiente
            inventore pariatur.
          </p>
          <box-icon name="download"></box-icon>
        </div>
      </div>
      </div>
    </>
  );
}
