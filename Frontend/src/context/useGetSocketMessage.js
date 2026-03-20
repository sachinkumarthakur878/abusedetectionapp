import { useEffect } from "react";
import { useSocketContext } from "./SocketContext.jsx";
import useConversation from "../zustand/useConversation.js";
import notificationSound from "../assets/notification.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { setMessage, selectedConversation, setTypingUsers } = useConversation();

  useEffect(() => {
    if (!socket) return;

    // New text/voice/image message from backend
    socket.on("newMessage", (newMessage) => {
      new Audio(notificationSound).play().catch(() => {});
      setMessage(prev => [...(prev || []), newMessage]);
    });

    // FIX: receiveImage ab zaroori nahi — image DB mein save hai aur newMessage event se aa rahi hai
    // Lekin backward compatibility ke liye rakho (agar koi purana code ho)
    // socket.on("receiveImage", ...) — REMOVED: causes duplicate images

    socket.on("userTyping", ({ senderId }) => {
      if (selectedConversation?._id === senderId) {
        setTypingUsers(prev => [...new Set([...(prev || []), senderId])]);
      }
    });

    socket.on("userStoppedTyping", ({ senderId }) => {
      setTypingUsers(prev => (prev || []).filter(id => id !== senderId));
    });

    socket.on("messageReaction", ({ messageId, reactions }) => {
      setMessage(prev => (prev || []).map(m =>
        m._id === messageId ? { ...m, reactions } : m
      ));
    });

    socket.on("messageDeleted", ({ messageId }) => {
      setMessage(prev => (prev || []).map(m =>
        m._id === messageId
          ? { ...m, isDeleted: true, message: "This message was deleted", mediaUrl: null }
          : m
      ));
    });

    return () => {
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("messageReaction");
      socket.off("messageDeleted");
    };
  }, [socket, selectedConversation]);
};

export default useGetSocketMessage;
