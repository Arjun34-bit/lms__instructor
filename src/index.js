import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClientProvider } from "@tanstack/react-query";
// import { SocketProvider } from "./context/SocketProvider";
import { queryClient } from "./api/client";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <SocketProvider> */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    {/* </SocketProvider> */}
  </React.StrictMode>
);
