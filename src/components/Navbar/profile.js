import React, { useEffect } from "react";
import NavbarAndSideMenu from "./Navbar";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProfileData } from "../../api/queries/usersQuery";
import { getUserId } from "../../utils/localStorageUtils";
import { Spinner } from "react-bootstrap";
import toast from "react-hot-toast";

function UserProfile() {
  const userId = getUserId();
  const {
    data: userProfileData,
    isLoading: userProfileDataLoading,
    error: userProfileDataError,
  } = useQuery({
    queryKey: ["userProfileData", userId],
    queryFn: () => fetchUserProfileData(userId),
    enabled: !!userId,
  });

  

  useEffect(() => {
    if (userProfileDataError) {
      toast.error(userProfileDataError?.message || "Error occured!");
    }
  }, [userProfileDataError, userProfileData]);

  // Check if departments and subjects are arrays, no need to split
  const departments = Array.isArray(userProfileData?.departments)
    ? userProfileData?.departments?.map((dept) => dept?.name)
    : [];
  const subjects = Array.isArray(userProfileData?.subjects)
    ? userProfileData?.subjects?.map((subject) => subject?.name)
    : [];

  // Generate default profile photo URL based on user's name initials
  const generateDefaultProfilePhotoUrl = (name) => {
    const nameParts = name?.trim()?.split(" ");
    const initials = nameParts?.map((part) => part?.charAt(0))?.join(""); // Get first letter of each word
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      initials
    )}&color=7F9CF5&background=EBF4FF`;
  };

  if (userProfileDataLoading) {
    return <Spinner />;
  }

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
          <h2 className="fw-bold text-center text-primary mb-4">
            User Profile
          </h2>
          <div className="row">
            <div className="col-md-4 text-center">
              <img
                src={
                  userProfileData?.profilePicture ||
                  generateDefaultProfilePhotoUrl(userProfileData?.user?.name)
                } // Use default avatar if no profile picture
                alt="Profile"
                className="img-fluid rounded-circle shadow-sm"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            </div>
            <div className="col-md-8">
              <h3 className="text-dark fw-semibold">{userProfileData?.user?.name}</h3>
              <p className="text-muted">{userProfileData?.user?.email}</p>
              <p>
                <strong>Role:</strong> {userProfileData?.user?.role || "N/A"}
              </p>
              <p>
                <strong>Phone Number:</strong>{" "}
                {userProfileData?.user?.phone_number || "N/A"}
              </p>
              <p>
                <strong>Joined On:</strong>{" "}
                {new Date(userProfileData?.user?.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`badge ${
                    userProfileData?.user?.status === "approved"
                      ? "bg-success"
                      : "bg-warning"
                  }`}
                >
                  {userProfileData?.user?.status}
                </span>
              </p>

              {/* Display departments and subjects */}
              {departments?.length > 0 && (
                <div className="mt-3">
                  <strong className="d-block">Departments:</strong>
                  <ul className="list-unstyled">
                    {departments?.map((dept, index) => (
                      <li
                        key={index}
                        className="badge bg-secondary text-white m-1"
                      >
                        {dept}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {subjects?.length > 0 && (
                <div className="mt-3">
                  <strong className="d-block">Subjects:</strong>
                  <ul className="list-unstyled">
                    {subjects?.map((subject, index) => (
                      <li
                        key={index}
                        className="badge bg-primary text-white m-1"
                      >
                        {subject}
                      </li>
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
