import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import useGetMessage from "../../context/useGetMessage.js";
import Loading from "../../components/Loading.jsx";
import useGetSocketMessage from "../../context/useGetSocketMessage.js";
import useConversation from "../../zustand/useConversation.js";

function Messages({ onReply }) {
  const { loading, messages } = useGetMessage();
  const { typingUsers, selectedConversation } = useConversation();
  useGetSocketMessage();

  const lastMsgRef = useRef();
  const isTyping = typingUsers?.includes(selectedConversation?._id);

  useEffect(() => {
    setTimeout(() => {
      if (lastMsgRef.current) {
        lastMsgRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-1 py-2" style={{ minHeight: "calc(95vh - 5vh)" }}>
      {loading ? (
        <Loading />
      ) : (
        <>
          {messages.length > 0 ? (
            messages.map((message) => (
              <div key={message._id} ref={lastMsgRef}>
                <Message message={message} onReply={onReply} />
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-gray-400">👋 Say Hi to start the conversation</p>
            </div>
          )}

          {/* ── Typing Indicator ─────────────────────── */}
          {isTyping && (
            <div className="chat chat-start px-2 py-1">
              <div className="chat-bubble bg-white/10 border border-white/20 px-4 py-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Messages;
