import React, { useState } from "react";
import "./Course.css";
import Navbar from "../Navbar/Navbar";

export default function AddCourseForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: null,
    demoVideo: null,
    author: "",
    rating: 0,
    enrolled: 0,
    language: "",
    price: 0,
    notPrice: 0,
    bestseller: false,
  });

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === "file") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    } else if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("thumbnail", formData.thumbnail);
    data.append("demoVideo", formData.demoVideo);
    data.append("author", formData.author);
    data.append("rating", formData.rating);
    data.append("enrolled", formData.enrolled);
    data.append("language", formData.language);
    data.append("price", formData.price);
    data.append("notPrice", formData.notPrice);
    data.append("bestseller", formData.bestseller);

    try {
      const response = await fetch("YOUR_API_ENDPOINT_HERE", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        // Handle success
        console.log("Course added successfully");
      } else {
        // Handle error
        console.error("Failed to add course");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="form-container">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title of the course</label>
            <input
              required
              name="title"
              id="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="video-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">
              Provide the Description of Course
            </label>
            <textarea
              required
              cols="50"
              rows="10"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="video-input"
            ></textarea>
          </div>

          <div
            className="videos-upload"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <div className="form-group">
              <label htmlFor="thumbnail">Upload Thumbnail</label>
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                accept="image/*"
                onChange={handleChange}
                className="video-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="demoVideo">Upload Demo Video</label>
              <input
                type="file"
                id="demoVideo"
                name="demoVideo"
                accept="video/*"
                onChange={handleChange}
                className="video-input"
              />
            </div>
          </div>

          <div
            className="video-details"
            style={{ display: "flex", flexDirection: "row" }}
          >
            <div className="form-group" style={{ marginRight: "230px" }}>
              <label htmlFor="author">Author</label>
              <input
                required
                name="author"
                id="author"
                type="text"
                value={formData.author}
                onChange={handleChange}
                className="video-input"
                style={{width:"330px"}}
              />
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <input
                required
                name="language"
                id="language"
                type="text"
                value={formData.language}
                onChange={handleChange}
                className="video-input"
                style={{width:"330px"}}
              />
            </div>
          </div>
          <div
            className="video-price"
            style={{ display: "flex", flexDirection: "row" }}
          >
            <div className="form-group" style={{marginRight: "230px"}}>
              <label htmlFor="price">Price</label>
              <input
                required
                name="price"
                id="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="video-input"
                style={{width:"330px"}}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="notPrice">Original Price (if discounted)</label>
              <input
                name="notPrice"
                id="notPrice"
                type="number"
                value={formData.notPrice}
                onChange={handleChange}
                className="video-input"
                style={{width:"330px"}}
              />
            </div>
          </div>
          <button type="submit" className="form-submit-btn">
            Submit
          </button>
        </form>
      </div>
    </>
  );
}
