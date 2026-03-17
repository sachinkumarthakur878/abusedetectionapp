import React from "react";
import useConversation from "../../zustand/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";

function User({ user }) {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isSelected = selectedConversation?._id === user._id;
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(user._id);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-b border-white/5
        ${isSelected ? "bg-teal-700/40 border-l-4 border-l-teal-400" : "hover:bg-white/10"}`}
      onClick={() => setSelectedConversation(user)}
    >
      <div className={`avatar ${isOnline ? "online" : ""} flex-shrink-0`}>
        <div className="w-11 rounded-full ring ring-teal-400/30 ring-offset-base-100 ring-offset-1">
          <img src="/user.jpg" alt={user.fullname} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="font-semibold text-white text-sm truncate">{user.fullname}</h1>
        <span className={`text-xs truncate ${isOnline ? "text-green-400" : "text-gray-500"}`}>
          {isOnline ? "Online" : user.email}
        </span>
      </div>
      {isOnline && (
        <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
      )}
    </div>
  );
}

export default User;
