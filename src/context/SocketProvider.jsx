import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(
    () =>
      io(process.env.REACT_APP_WEBSOCKET_URL || "http://localhost:8287", {
        transports: ["websocket"],
      }),
    []
  );

  return (
    <SocketContext.Provider value={socket}>
      {props?.children}
    </SocketContext.Provider>
  );
};
