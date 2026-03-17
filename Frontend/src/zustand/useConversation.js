import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
  messages: [],
  setMessage: (messages) => set({ messages }),
  // For typing indicator
  typingUsers: [],
  setTypingUsers: (typingUsers) => set({ typingUsers }),
}));

export default useConversation;
