// import { createContext, useContext, useEffect, useState } from "react";
// import { useAuth } from "./AuthProvider";
// import io from "socket.io-client";

// const socketContext = createContext();

// export const useSocketContext = () => useContext(socketContext);

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [authUser] = useAuth();

//   useEffect(() => {
//     if (!authUser) return;

//     const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
//       query: { userId: authUser._id },
//     });

//     setSocket(newSocket);

//     newSocket.on("getOnlineUsers", (users) => {
//       setOnlineUsers(users);
//     });

//     return () => newSocket.close();
//   }, [authUser]);

//   return (
//     <socketContext.Provider value={{ socket, onlineUsers }}>
//       {children}
//     </socketContext.Provider>
//   );
// };


import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import io from "socket.io-client";

const socketContext = createContext();

export const useSocketContext = () => useContext(socketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [authUser] = useAuth();

  useEffect(() => {
    if (!authUser) return;

    // authUser._id ya authUser.user._id dono handle karo
    const userId = authUser._id || authUser.user?._id;
    if (!userId) return;

    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      query: { userId },
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => newSocket.close();
  }, [authUser]);

  return (
    <socketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </socketContext.Provider>
  );
};
