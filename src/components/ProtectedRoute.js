import React, { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import NavbarAndSideMenu from "./Navbar/Navbar";
import { setLocalStorageUser } from "../utils/localStorageUtils";
import { fetchUserProfileData } from "../api/queries/usersQuery";
import AntdSpinner from "./Spinner/Spinner";
import { useQuery } from "@tanstack/react-query";

const ProtectedRoute = ({ children }) => {
  const { classId } = useParams();
  const {
    data: userProfileData,
    isLoading: userProfileDataLoading,
  } = useQuery({
    queryFn: () => fetchUserProfileData(),
    keepPreviousData: true,
  });

  useEffect(() => {
    if(userProfileData) {
      setLocalStorageUser(userProfileData?.data);
    }
  }, [userProfileData]);

  // If loading is true, show a loading spinner or similar
  if (userProfileDataLoading) {
    return <AntdSpinner />;
  }

  return (
    <>
      {(!classId) && <NavbarAndSideMenu />}
      <Outlet />
    </>
  );
}

export default ProtectedRoute;
