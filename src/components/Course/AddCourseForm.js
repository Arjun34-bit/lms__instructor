import React from "react";
import "./Course.css";
import Navbar from "../Navbar/Navbar";

export default function AddCourseForm() {
  return (
    <>
      <Navbar />
      <div class="form-container">
        <form class="form">
          <div class="form-group">
            <label for="email">Title of the course</label>
            <input required="" name="email" id="email" type="text" />
          </div>
          <div class="form-group">
            <label for="textarea">Provide the Description of Course</label>
            <textarea
              required=""
              cols="50"
              rows="10"
              id="textarea"
              name="textarea"
            >
              {" "}
            </textarea>
          </div>
          <div class="form-group">
            <label for="video">Upload Video</label>
            <input type="file" id="video" name="video" accept="video/*" />
          </div>
          <button type="submit" class="form-submit-btn">
            Submit
          </button>
        </form>
      </div>
    </>
  );
}
