// // import { useState } from "react";
// // import useConversation from "../zustand/useConversation.js";
// // import axios from "axios";

// // const useSendMessage = () => {
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const { messages, setMessage, selectedConversation } = useConversation();

// //   const sendMessages = async (payload) => {
// //     if (!selectedConversation?._id) return false;

// //     // payload can be a string (text) or object { message, messageType, mediaUrl, mediaName, replyTo }
// //     const data = typeof payload === "string"
// //       ? { message: payload, messageType: "text" }
// //       : payload;

// //     try {
// //       setLoading(true);
// //       setError(null);

// //       const res = await axios.post(
// //         `/api/message/send/${selectedConversation._id}`,
// //         data
// //       );

// //       setMessage([...messages, res.data]);
// //       return true;

// //     } catch (err) {
// //       const errMsg = err.response?.data?.error || "Something went wrong";
// //       setError(errMsg);
// //       return false;
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const reactToMessage = async (messageId, emoji) => {
// //     try {
// //       await axios.post(`/api/message/react/${messageId}`, { emoji });
// //     } catch (err) {
// //       console.error("React error:", err);
// //     }
// //   };

// //   const deleteMessage = async (messageId) => {
// //     try {
// //       await axios.delete(`/api/message/delete/${messageId}`);
// //       setMessage(messages.map(m =>
// //         m._id === messageId ? { ...m, isDeleted: true, message: "This message was deleted" } : m
// //       ));
// //     } catch (err) {
// //       console.error("Delete error:", err);
// //     }
// //   };

// //   return { loading, error, sendMessages, reactToMessage, deleteMessage };
// // };

// // export default useSendMessage;


// // import { useState, useEffect } from "react";
// // import useConversation from "../zustand/useConversation.js";
// // import axios from "axios";

// // const useSendMessage = () => {
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const { messages, setMessage, selectedConversation } = useConversation();

// //   // Conversation badlne par error clear
// //   useEffect(() => {
// //     setError(null);
// //   }, [selectedConversation?._id]);

// //   const sendMessages = async (payload) => {
// //     if (!selectedConversation?._id) return false;

// //     const data = typeof payload === "string"
// //       ? { message: payload, messageType: "text" }
// //       : payload;

// //     try {
// //       setLoading(true);
// //       setError(null);

// //       const res = await axios.post(
// //         `/api/message/send/${selectedConversation._id}`,
// //         data
// //       );

// //       setMessage([...messages, res.data]);
// //       return true;

// //     } catch (err) {
// //       const errMsg = err.response?.data?.error || "Something went wrong";
// //       setError(errMsg);
// //       return false;
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const reactToMessage = async (messageId, emoji) => {
// //     try {
// //       await axios.post(`/api/message/react/${messageId}`, { emoji });
// //     } catch (err) {
// //       console.error("React error:", err);
// //     }
// //   };

// //   const deleteMessage = async (messageId) => {
// //     try {
// //       await axios.delete(`/api/message/delete/${messageId}`);
// //       setMessage(messages.map(m =>
// //         m._id === messageId
// //           ? { ...m, isDeleted: true, message: "This message was deleted" }
// //           : m
// //       ));
// //     } catch (err) {
// //       console.error("Delete error:", err);
// //     }
// //   };

// //   const clearError = () => setError(null);

// //   return { loading, error, sendMessages, reactToMessage, deleteMessage, clearError };
// // };

// // export default useSendMessage;




// import { useState, useEffect } from "react";
// import useConversation from "../zustand/useConversation.js";
// import axios from "axios";

// const useSendMessage = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { messages, setMessage, selectedConversation } = useConversation();

//   useEffect(() => {
//     setError(null);
//   }, [selectedConversation?._id]);

//   const sendMessages = async (payload) => {
//     if (!selectedConversation?._id) return false;

//     const data = typeof payload === "string"
//       ? { message: payload, messageType: "text" }
//       : payload;

//     // ✅ Base64 backend ko mat bhejo — MongoDB 16MB limit
//     const backendData = { ...data };
//     if (backendData.messageType === "voice" || backendData.messageType === "image") {
//       backendData.mediaUrl = null;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/message/send/${selectedConversation._id}`,
//         backendData
//       );

//       // ✅ Frontend display ke liye original base64 wala mediaUrl use karo
//       const displayMsg = {
//         ...res.data,
//         mediaUrl: data.mediaUrl || null
//       };

//       setMessage([...messages, displayMsg]);
//       return true;

//     } catch (err) {
//       const errMsg = err.response?.data?.error || "Something went wrong";
//       setError(errMsg);
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reactToMessage = async (messageId, emoji) => {
//     try {
//       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/message/react/${messageId}`, { emoji });
//     } catch (err) {
//       console.error("React error:", err);
//     }
//   };

//   const deleteMessage = async (messageId) => {
//     try {
//       await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/message/delete/${messageId}`);
//       setMessage(messages.map(m =>
//         m._id === messageId
//           ? { ...m, isDeleted: true, message: "This message was deleted" }
//           : m
//       ));
//     } catch (err) {
//       console.error("Delete error:", err);
//     }
//   };

//   const clearError = () => setError(null);

//   return { loading, error, sendMessages, reactToMessage, deleteMessage, clearError };
// };

// export default useSendMessage;


import { useState, useEffect } from "react";
import useConversation from "../zustand/useConversation.js";
import axios from "axios";

const getAuthToken = () => {
  const stored = localStorage.getItem("ChatApp");
  return stored ? JSON.parse(stored)?.token : null;
};

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { messages, setMessage, selectedConversation } = useConversation();

  useEffect(() => {
    setError(null);
  }, [selectedConversation?._id]);

  const sendMessages = async (payload) => {
    if (!selectedConversation?._id) return false;

    const data = typeof payload === "string"
      ? { message: payload, messageType: "text" }
      : payload;

    const backendData = { ...data };
    if (backendData.messageType === "voice" || backendData.messageType === "image") {
      backendData.mediaUrl = null;
    }

    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/message/send/${selectedConversation._id}`,
        backendData,
        {
          withCredentials: true,
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        }
      );

      const displayMsg = { ...res.data, mediaUrl: data.mediaUrl || null };
      setMessage([...messages, displayMsg]);
      return true;

    } catch (err) {
      const errMsg = err.response?.data?.error || "Something went wrong";
      setError(errMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reactToMessage = async (messageId, emoji) => {
    try {
      const token = getAuthToken();
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/message/react/${messageId}`,
        { emoji },
        { withCredentials: true, headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
      );
    } catch (err) {
      console.error("React error:", err);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const token = getAuthToken();
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/message/delete/${messageId}`,
        { withCredentials: true, headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
      );
      setMessage(messages.map(m =>
        m._id === messageId
          ? { ...m, isDeleted: true, message: "This message was deleted" }
          : m
      ));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const clearError = () => setError(null);

  return { loading, error, sendMessages, reactToMessage, deleteMessage, clearError };
};

export default useSendMessage;