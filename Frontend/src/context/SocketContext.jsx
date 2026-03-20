// // // import { createContext, useContext, useEffect, useState } from "react";
// // // import { useAuth } from "./AuthProvider";

// // // const socketContext = createContext();

// // // export const useSocketContext = () => useContext(socketContext);

// // // export const SocketProvider = ({ children }) => {
// // //   const [socket, setSocket] = useState(null);

// // //   useEffect(() => {
// // //     if (!authUser) return;

// // //     const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
// // //       query: { userId: authUser._id },

// // //     setSocket(newSocket);

// // //     newSocket.on("getOnlineUsers", (users) => {
// // //       setOnlineUsers(users);

// // //     return () => newSocket.close();
// // //   }, [authUser]);

// // //   return (
// // //     <socketContext.Provider value={{ socket, onlineUsers }}>

// // import { createContext, useContext, useEffect, useState } from "react";
// // import { useAuth } from "./AuthProvider";

// // const socketContext = createContext();

// // export const useSocketContext = () => useContext(socketContext);

// // export const SocketProvider = ({ children }) => {
// //   const [socket, setSocket] = useState(null);

// //   useEffect(() => {
// //     if (!authUser) return;

// //     // authUser._id ya authUser.user._id dono handle karo
// //     const userId = authUser._id || authUser.user?._id;

// //     const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
// //       query: { userId },

// //     setSocket(newSocket);

// //     newSocket.on("getOnlineUsers", (users) => {
// //       setOnlineUsers(users);

// //     return () => newSocket.close();
// //   }, [authUser]);

// //   return (
// //     <socketContext.Provider value={{ socket, onlineUsers }}>

// import { createContext, useContext, useEffect, useRef, useState } from "react";
// import { useAuth } from "./AuthProvider";

// const socketContext = createContext();

// export const useSocketContext = () => useContext(socketContext);

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);

//   const userId = authUser?._id || authUser?.user?._id;

//   useEffect(() => {
//     if (!userId) return;

//     const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
//       query: { userId },

//     socketRef.current = newSocket;
//     setSocket(newSocket);

//     newSocket.on("getOnlineUsers", (users) => {
//       // Apne aap ko online list se hata do

//     return () => {
//       newSocket.disconnect();

//   return (
//     <socketContext.Provider value={{ socket, onlineUsers }}>

import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socketContext = createContext();

export const useSocketContext = () => useContext(socketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  // localStorage se directly userId lo — most reliable
  const getMyUserId = () => {
    try {
      const stored = localStorage.getItem("ChatApp");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?._id || parsed?.user?._id || null;
    } catch { return null; }
  };

  const userId = getMyUserId();

  useEffect(() => {
    if (!userId) return;
    if (socketRef.current?.connected) return;

    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      query: { userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      // Apna userId online list se hata do
      const myId = getMyUserId();
      setOnlineUsers(users.filter(id => id !== myId));
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  return (
    <socketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </socketContext.Provider>
  );
};