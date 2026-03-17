import React, { useEffect, useState } from "react";
import Chatuser from "./Chatuser";
import Messages from "./Messages";
import Typesend from "./Typesend";
import useConversation from "../../zustand/useConversation.js";
import { useAuth } from "../../context/AuthProvider.jsx";
import { CiMenuFries } from "react-icons/ci";

function Right() {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const [replyMessage, setReplyMessage] = useState(null);

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  const handleReply = (message) => setReplyMessage(message);
  const handleCancelReply = () => setReplyMessage(null);

  return (
    <div className="w-full flex flex-col h-screen bg-black/80 text-teal-400">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <div className="flex flex-col h-full">
          {/* Header */}
          <Chatuser />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <Messages onReply={handleReply} />
          </div>

          {/* Input */}
          <Typesend replyMessage={replyMessage} onCancelReply={handleCancelReply} />
        </div>
      )}
    </div>
  );
}

export default Right;

const NoChatSelected = () => {
  const [authUser] = useAuth();
  return (
    <div className="relative h-screen flex flex-col">
      <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden absolute left-5 top-3 z-10">
        <CiMenuFries className="text-white text-xl" />
      </label>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center px-6">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome, <span className="text-teal-400">{authUser?.user?.fullname}</span>!
          </h1>
          <p className="text-gray-400 text-sm">
            Select a contact to start chatting securely.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-gray-500">
            <span className="bg-white/10 rounded-full px-3 py-1">🛡️ Abuse Detection</span>
            <span className="bg-white/10 rounded-full px-3 py-1">🎤 Voice Messages</span>
            <span className="bg-white/10 rounded-full px-3 py-1">📹 Video Calls</span>
            <span className="bg-white/10 rounded-full px-3 py-1">😊 Reactions</span>
            <span className="bg-white/10 rounded-full px-3 py-1">↩ Replies</span>
            <span className="bg-white/10 rounded-full px-3 py-1">🖼️ Images</span>
          </div>
        </div>
      </div>
    </div>
  );
};
