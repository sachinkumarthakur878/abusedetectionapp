import { useState, useEffect } from "react";
import useConversation from "../zustand/useConversation.js";
import axios from "axios";

const getAuthToken = () => {
  try {
    const stored = localStorage.getItem("ChatApp");
    return stored ? JSON.parse(stored)?.token : null;
  } catch { return null; }
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

    // Backend ko base64 mat bhejo — sirf metadata bhejo
    const backendData = { ...data };
    if (backendData.messageType === "image" || backendData.messageType === "voice") {
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

      // Sender ke liye original mediaUrl (base64) use karo
      const displayMsg = { ...res.data, mediaUrl: data.mediaUrl || null };
      setMessage(prev => [...(prev || []), displayMsg]);
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
      setMessage(prev => (prev || []).map(m =>
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