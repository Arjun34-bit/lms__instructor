import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/index';

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Track authentication status
  const navigate = useNavigate(); // Initialize navigate hook
  const location = useLocation(); // Get the current URL location

  useEffect(() => {
    const token = localStorage.getItem('token');
    // If token exists and user is on sign-in page, redirect to home/dashboard
    if (token && location.pathname === '/auth/signin') {
      navigate('/'); // Redirect to home or dashboard if already authenticated
      return;
    }

    // If no token and user is not on sign-in page, redirect to sign-in page
    if (!token && location.pathname !== '/auth/signin') {
      navigate('/auth/signin');
    } else {
      setIsAuthenticated(true); // User is authenticated, allow access to layout
    }
  }, [navigate, location]);

  // If we haven't checked authentication status, return a loading state
  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Optionally replace this with a loader component
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      {/* Page Wrapper Start */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* Content Area */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          {/* Main Content */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children} {/* This is where the protected route components will render */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
