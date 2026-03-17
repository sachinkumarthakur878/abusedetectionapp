import React, { useState } from "react";
import useConversation from "../../zustand/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import { CiMenuFries } from "react-icons/ci";
import VideoCall from "./VideoCall.jsx";
import { useAuth } from "../../context/AuthProvider.jsx";

function Chatuser() {
  const { selectedConversation } = useConversation();
  const { onlineUsers, socket } = useSocketContext();
  const [authUser] = useAuth();
  const isOnline = onlineUsers.includes(selectedConversation?._id);

  const [activeCall, setActiveCall] = useState(null); // { type: "video"|"voice", incoming?: {} }
  const [incomingCall, setIncomingCall] = useState(null);

  // Listen for incoming calls
  React.useEffect(() => {
    if (!socket) return;
    socket.on("incomingCall", (data) => {
      setIncomingCall(data);
    });
    return () => socket.off("incomingCall");
  }, [socket]);

  const startVideoCall = () => setActiveCall({ type: "video" });
  const startVoiceCall = () => setActiveCall({ type: "voice" });
  const closeCall = () => { setActiveCall(null); setIncomingCall(null); };

  // Auto-show incoming call modal
  React.useEffect(() => {
    if (incomingCall) setActiveCall({ type: incomingCall.callType, incoming: incomingCall });
  }, [incomingCall]);

  return (
    <>
      <div className="relative flex items-center justify-between px-4 h-[64px] bg-black/80 border-b border-white/10">
        {/* Menu button */}
        <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden">
          <CiMenuFries className="text-white text-xl" />
        </label>

        {/* User info */}
        <div className="flex items-center gap-3 flex-1">
          <div className={`avatar ${isOnline ? "online" : "offline"}`}>
            <div className="w-10 rounded-full ring ring-teal-400 ring-offset-base-100 ring-offset-1">
              <img src="/user.jpg" alt="user" />
            </div>
          </div>
          <div>
            <h1 className="text-white font-semibold text-base leading-tight">
              {selectedConversation?.fullname}
            </h1>
            <span className={`text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`}>
              {isOnline ? "🟢 Online" : "⚫ Offline"}
            </span>
          </div>
        </div>

        {/* Call buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={startVoiceCall}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-teal-600 flex items-center justify-center text-white transition-all"
            title="Voice Call"
          >📞</button>
          <button
            onClick={startVideoCall}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-teal-600 flex items-center justify-center text-white transition-all"
            title="Video Call"
          >🎥</button>
        </div>
      </div>

      {/* ── Call Modal ─────────────────────────────── */}
      {activeCall && (
        <VideoCall
          callType={activeCall.type}
          onClose={closeCall}
          incomingCall={activeCall.incoming || null}
        />
      )}
    </>
  );
}

export default Chatuser;
