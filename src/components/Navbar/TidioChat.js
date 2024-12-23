import React, { useEffect } from 'react';

const TidioChat = () => {
  useEffect(() => {
    // Check if the script already exists
    if (!document.getElementById('tidio-script')) {
      const script = document.createElement('script');
      script.src = "//code.tidio.co/miwcaiobiur91vrmkre66b6vhwwi5gog.js";
      script.async = true;
      script.id = 'tidio-script'; // Add an ID for the script
      document.body.appendChild(script);

      script.onload = () => {
        console.log("Tidio script loaded successfully.");
      };

      script.onerror = () => {
        console.error("Failed to load the Tidio script.");
      };
    }
  }, []); // Empty dependency array to load the script only once

  return null; // This component does not render anything in the DOM
};

export default TidioChat;
