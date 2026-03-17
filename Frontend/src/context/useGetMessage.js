// import React, { useEffect, useState } from "react";
// import useConversation from "../zustand/useConversation.js";
// import axios from "axios";
// const useGetMessage = () => {
//   const [loading, setLoading] = useState(false);
//   const { messages, setMessage, selectedConversation } = useConversation();

//   useEffect(() => {
//     const getMessages = async () => {
//       setLoading(true);
//       if (selectedConversation && selectedConversation._id) {
//         try {
//           const res = await axios.get(
//             `${import.meta.env.VITE_BACKEND_URL}/api/message/get/${selectedConversation._id}`
//           );
//           setMessage(res.data);
//           setLoading(false);
//         } catch (error) {
//           console.log("Error in getting messages", error);
//           setLoading(false);
//         }
//       }
//     };
//     getMessages();
//   }, [selectedConversation, setMessage]);
//   return { loading, messages };
// };

// export default useGetMessage;


import React, { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation.js";
import axios from "axios";

const useGetMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedConversation } = useConversation();

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      if (selectedConversation && selectedConversation._id) {
        try {
          const stored = localStorage.getItem("ChatApp");
          const token = stored ? JSON.parse(stored)?.token : null;

          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/message/get/${selectedConversation._id}`,
            {
              withCredentials: true,
              headers: { ...(token && { Authorization: `Bearer ${token}` }) },
            }
          );
          setMessage(res.data);
          setLoading(false);
        } catch (error) {
          console.log("Error in getting messages", error);
          setLoading(false);
        }
      }
    };
    getMessages();
  }, [selectedConversation, setMessage]);

  return { loading, messages };
};

export default useGetMessage;