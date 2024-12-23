import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavbarAndSideMenu from "./Navbar";

function UserProfile() {
  const { userId } = useParams(); // Extract userId from the URL
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Current token:", token); // Log token for debugging

    // Fetch user details based on userId
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/auth/users/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserDetails(data.user); // Access the user data in response
        } else {
          throw new Error("Failed to fetch user details.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return (
      <div>
        <div className="content-area p-4">
          <h3>Loading user details...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="content-area p-4">
          <h3 className="text-danger">Error: {error}</h3>
        </div>
      </div>
    );
  }

  // Check if departments and subjects are arrays, no need to split
  const departments = Array.isArray(userDetails.departments) ? userDetails.departments.map(dept => dept.name) : [];
  const subjects = Array.isArray(userDetails.subjects) ? userDetails.subjects.map(subject => subject.name) : [];

  // Generate default profile photo URL based on user's name initials
  const generateDefaultProfilePhotoUrl = (name) => {
    const nameParts = name.trim().split(" ");
    const initials = nameParts.map(part => part.charAt(0)).join(''); // Get first letter of each word
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&color=7F9CF5&background=EBF4FF`;
  };

  return (
    <div>
      <NavbarAndSideMenu />
      <div
        className="content-area"
        style={{
          marginLeft: "250px", // Matches side menu width
          padding: "30px 20px",
          marginTop: "30px", // To offset the navbar
        }}
      >
        <div className="profile-card bg-white shadow-lg rounded p-4">
          <h2 className="fw-bold text-center text-primary mb-4">User Profile</h2>
          <div className="row">
            <div className="col-md-4 text-center">
              <img
                src={userDetails.profilePicture || generateDefaultProfilePhotoUrl(userDetails.name)} // Use default avatar if no profile picture
                alt="Profile"
                className="img-fluid rounded-circle shadow-sm"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            </div>
            <div className="col-md-8">
              <h3 className="text-dark fw-semibold">{userDetails.name}</h3>
              <p className="text-muted">{userDetails.email}</p>
              <p>
                <strong>Role:</strong> {userDetails.role || "N/A"}
              </p>
              <p>
                <strong>Phone Number:</strong> {userDetails.phone_number || "N/A"}
              </p>
              <p>
                <strong>Joined On:</strong> {new Date(userDetails.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong> <span className={`badge ${userDetails.status === 'approved' ? 'bg-success' : 'bg-warning'}`}>{userDetails.status}</span>
              </p>
              
              {/* Display departments and subjects */}
              {departments.length > 0 && (
                <div className="mt-3">
                  <strong className="d-block">Departments:</strong>
                  <ul className="list-unstyled">
                    {departments.map((dept, index) => (
                      <li key={index} className="badge bg-secondary text-white m-1">{dept}</li>
                    ))}
                  </ul>
                </div>
              )}

              {subjects.length > 0 && (
                <div className="mt-3">
                  <strong className="d-block">Subjects:</strong>
                  <ul className="list-unstyled">
                    {subjects.map((subject, index) => (
                      <li key={index} className="badge bg-primary text-white m-1">{subject}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
