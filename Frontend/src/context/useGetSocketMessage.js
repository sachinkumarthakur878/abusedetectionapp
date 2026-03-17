import { useEffect } from "react";
import { useSocketContext } from "./SocketContext.jsx";
import useConversation from "../zustand/useConversation.js";
import notificationSound from "../assets/notification.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { setMessage, selectedConversation, setTypingUsers } = useConversation();

  useEffect(() => {
    if (!socket) return;

    // New text/voice message from backend
    socket.on("newMessage", (newMessage) => {
      new Audio(notificationSound).play().catch(() => {});
      // Functional update — stale closure se bachao
      setMessage(prev => [...(prev || []), newMessage]);
    });

    // Image via direct socket (base64)
    socket.on("receiveImage", ({ mediaUrl, mediaName, senderId }) => {
      new Audio(notificationSound).play().catch(() => {});
      const imageMsg = {
        _id: `img_${Date.now()}`,
        senderId,
        messageType: "image",
        mediaUrl,
        mediaName,
        message: "",
        createdAt: new Date().toISOString(),
        reactions: [],
        readBy: [],
      };
      setMessage(prev => [...(prev || []), imageMsg]);
    });

    // Typing indicator
    socket.on("userTyping", ({ senderId }) => {
      if (selectedConversation?._id === senderId) {
        setTypingUsers(prev => [...new Set([...(prev || []), senderId])]);
      }
    });

    socket.on("userStoppedTyping", ({ senderId }) => {
      setTypingUsers(prev => (prev || []).filter(id => id !== senderId));
    });

    // Reactions
    socket.on("messageReaction", ({ messageId, reactions }) => {
      setMessage(prev => (prev || []).map(m =>
        m._id === messageId ? { ...m, reactions } : m
      ));
    });

    // Delete
    socket.on("messageDeleted", ({ messageId }) => {
      setMessage(prev => (prev || []).map(m =>
        m._id === messageId
          ? { ...m, isDeleted: true, message: "This message was deleted" }
          : m
      ));
    });

    return () => {
      socket.off("newMessage");
      socket.off("receiveImage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("messageReaction");
      socket.off("messageDeleted");
    };
  }, [socket, selectedConversation]); // messages dependency hatao — stale closure fix
};

export default useGetSocketMessage;