import React from "react";
import Navbar from "../Navbar/Navbar";
import SideMenu from "../SideNavbar/SideNavbar";
import Stats from "../Stats/Stats";


function Homepage() {
  return (
    <>
      <Navbar />
      <SideMenu/>
      <Stats/>
    </>
  );
}

export default Homepage;