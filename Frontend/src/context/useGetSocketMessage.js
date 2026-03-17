import { useEffect } from "react";
import { useSocketContext } from "./SocketContext.jsx";
import useConversation from "../zustand/useConversation.js";
import notificationSound from "../assets/notification.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { messages, setMessage, selectedConversation, setTypingUsers } = useConversation();

  useEffect(() => {
    if (!socket) return;

    // New message
    socket.on("newMessage", (newMessage) => {
      const audio = new Audio(notificationSound);
      audio.play().catch(() => {});
      setMessage([...messages, newMessage]);
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
      setMessage(messages.map(m =>
        m._id === messageId ? { ...m, reactions } : m
      ));
    });

    // Delete
    socket.on("messageDeleted", ({ messageId }) => {
      setMessage(messages.map(m =>
        m._id === messageId ? { ...m, isDeleted: true, message: "This message was deleted" } : m
      ));
    });

    return () => {
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("messageReaction");
      socket.off("messageDeleted");
    };
  }, [socket, messages, selectedConversation]);
};

export default useGetSocketMessage;
