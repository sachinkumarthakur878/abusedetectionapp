import { create } from "zustand";

const useConversation = create((set, get) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
  messages: [],
  // Functional update support karo — array ya function dono accept karo
  setMessage: (messagesOrUpdater) => {
    if (typeof messagesOrUpdater === "function") {
      set({ messages: messagesOrUpdater(get().messages) });
    } else {
      set({ messages: messagesOrUpdater });
    }
  },
  typingUsers: [],
  setTypingUsers: (typingUsersOrUpdater) => {
    if (typeof typingUsersOrUpdater === "function") {
      set({ typingUsers: typingUsersOrUpdater(get().typingUsers) });
    } else {
      set({ typingUsers: typingUsersOrUpdater });
    }
  },
}));

export default useConversation;