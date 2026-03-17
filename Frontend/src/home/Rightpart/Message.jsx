import React, { useState, useRef } from "react";
import useSendMessage from "../../context/useSendMessage.js";

const REACTION_EMOJIS = ["❤️","😂","👍","👎","😮","😢","🔥","🎉"];

function Message({ message, onReply }) {
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));
  const itsMe = message.senderId === authUser?.user?._id;
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { reactToMessage, deleteMessage } = useSendMessage();

  const chatAlign = itsMe ? "chat-end" : "chat-start";
  const bubbleColor = itsMe
    ? "bg-gradient-to-br from-teal-600 to-teal-700 text-white"
    : "bg-white/10 border border-white/20 text-white";

  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleReact = async (emoji) => {
    await reactToMessage(message._id, emoji);
    setShowReactions(false);
  };

  // Group reactions
  const reactionMap = {};
  (message.reactions || []).forEach(r => {
    reactionMap[r.emoji] = (reactionMap[r.emoji] || 0) + 1;
  });

  return (
    <div className="pb-1 px-2 group relative">
      <div className={`chat ${chatAlign}`}>

        {/* ── Reply-to preview ──────────────────── */}
        {message.replyTo && !message.isDeleted && (
          <div className={`mb-1 ${itsMe ? "ml-auto" : "mr-auto"} max-w-[60%]`}>
            <div className={`px-3 py-1 rounded-lg text-xs border-l-2 border-teal-400 bg-black/40 text-gray-400 truncate`}>
              ↩ {message.replyTo?.messageType === "voice" ? "🎤 Voice" :
                  message.replyTo?.messageType === "image" ? "🖼️ Image" :
                  message.replyTo?.message || "..."}
            </div>
          </div>
        )}

        {/* ── Bubble ──────────────────────────── */}
        <div
          className={`chat-bubble relative max-w-xs lg:max-w-md rounded-2xl px-3 py-2 ${bubbleColor} ${message.isDeleted ? "opacity-50 italic" : ""}`}
          onMouseEnter={() => !message.isDeleted && setShowMenu(true)}
          onMouseLeave={() => { setShowMenu(false); setShowReactions(false); }}
        >
          {/* Content */}
          {message.isDeleted ? (
            <span className="text-sm text-gray-400">🚫 This message was deleted</span>
          ) : message.messageType === "image" && message.mediaUrl ? (
            <img
              src={message.mediaUrl}
              alt="Sent image"
              className="max-w-full rounded-xl max-h-60 object-cover cursor-pointer"
              onClick={() => window.open(message.mediaUrl, "_blank")}
            />
          ) : message.messageType === "voice" && message.mediaUrl ? (
            <div className="flex items-center gap-2 min-w-[160px]">
              <span className="text-xl">🎤</span>
              <audio src={message.mediaUrl} controls className="h-8 flex-1 min-w-0" />
            </div>
          ) : (
            <p className="text-sm break-words">{message.message}</p>
          )}

          {/* Time & read receipt */}
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <span className="text-[10px] text-white/50">{formattedTime}</span>
            {itsMe && (
              <span className="text-[10px]">
                {(message.readBy?.length > 1) ? "✓✓" : "✓"}
              </span>
            )}
          </div>

          {/* Hover actions */}
          {showMenu && !message.isDeleted && (
            <div className={`absolute ${itsMe ? "right-full mr-1" : "left-full ml-1"} top-0 flex flex-col gap-1 z-10`}>
              <button
                onClick={() => setShowReactions(v => !v)}
                className="bg-gray-800 hover:bg-gray-700 text-white rounded-full w-7 h-7 text-xs flex items-center justify-center shadow"
                title="React"
              >😊</button>
              <button
                onClick={() => onReply && onReply(message)}
                className="bg-gray-800 hover:bg-gray-700 text-white rounded-full w-7 h-7 text-xs flex items-center justify-center shadow"
                title="Reply"
              >↩</button>
              {itsMe && (
                <button
                  onClick={() => deleteMessage(message._id)}
                  className="bg-red-800 hover:bg-red-700 text-white rounded-full w-7 h-7 text-xs flex items-center justify-center shadow"
                  title="Delete"
                >🗑</button>
              )}
            </div>
          )}

          {/* Reaction picker */}
          {showReactions && (
            <div className="absolute bottom-full mb-1 left-0 bg-gray-900 border border-white/20 rounded-2xl px-2 py-1 flex gap-1 z-20 shadow-xl">
              {REACTION_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Reactions display ─────────────────── */}
        {Object.keys(reactionMap).length > 0 && (
          <div className={`flex gap-1 flex-wrap mt-0.5 ${itsMe ? "justify-end" : "justify-start"}`}>
            {Object.entries(reactionMap).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="bg-gray-800 hover:bg-gray-700 rounded-full px-2 py-0.5 text-xs flex items-center gap-0.5 border border-white/10"
              >
                {emoji} <span className="text-white/70">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;
