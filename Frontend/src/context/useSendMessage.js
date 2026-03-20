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
  const { setMessage, selectedConversation } = useConversation();

  useEffect(() => {
    setError(null);
  }, [selectedConversation?._id]);

  const sendMessages = async (payload) => {
    if (!selectedConversation?._id) return false;

    const data = typeof payload === "string"
      ? { message: payload, messageType: "text" }
      : payload;

    // FIX: Image/voice ka mediaUrl ab backend ko bhi bhejo (DB mein save hoga)
    // Pehle null bhejte the — isliye refresh pe hat jaati thi
    const backendData = { ...data };
    // Voice ke liye ab bhi null (large audio files DB mein nahi)
    if (backendData.messageType === "voice") {
      backendData.mediaUrl = null;
    }
    // Image ab DB mein jayegi — mediaUrl as-is bhejo

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

      // FIX: res.data mein ab actual mediaUrl hoga (DB se) — use karo directly
      // Voice ke liye local base64 use karo (play karne ke liye)
      const displayMsg = {
        ...res.data,
        mediaUrl: data.messageType === "voice" ? (data.mediaUrl || null) : res.data.mediaUrl,
      };
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
          ? { ...m, isDeleted: true, message: "This message was deleted", mediaUrl: null }
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
