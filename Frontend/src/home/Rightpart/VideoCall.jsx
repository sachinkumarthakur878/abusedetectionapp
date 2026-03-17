// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useSocketContext } from "../../context/SocketContext.jsx";
// import { useAuth } from "../../context/AuthProvider.jsx";
// import useConversation from "../../zustand/useConversation.js";

// // ─── Simple Peer for WebRTC ──────────────────────────────────
// // We use a manual WebRTC approach with socket signaling

// const ICE_SERVERS = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },
//     { urls: "stun:stun1.l.google.com:19302" }
//   ]
// };

// function VideoCall({ callType = "video", onClose, incomingCall }) {
//   const { socket } = useSocketContext();
//   const [authUser] = useAuth();
//   const { selectedConversation } = useConversation();

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);

//   const [callState, setCallState] = useState(incomingCall ? "incoming" : "calling");
//   const [isMuted, setIsMuted] = useState(false);
//   const [isCamOff, setIsCamOff] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);
//   const timerRef = useRef(null);

//   const receiverId = incomingCall ? incomingCall.from : selectedConversation?._id;

//   // ── Setup local stream ────────────────────────────────────
//   const getLocalStream = useCallback(async () => {
//     try {
//       const constraints = callType === "video"
//         ? { video: true, audio: true }
//         : { audio: true };
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       localStreamRef.current = stream;
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//       }
//       return stream;
//     } catch (err) {
//       console.error("Media error:", err);
//       alert("Could not access camera/microphone.");
//       onClose();
//     }
//   }, [callType]);

//   // ── Create peer connection ────────────────────────────────
//   const createPC = useCallback((stream) => {
//     const pc = new RTCPeerConnection(ICE_SERVERS);
//     pcRef.current = pc;

//     stream.getTracks().forEach(track => pc.addTrack(track, stream));

//     pc.ontrack = (event) => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("iceCandidate", { to: receiverId, candidate: event.candidate });
//       }
//     };

//     return pc;
//   }, [socket, receiverId]);

//   // ── Initiate call ─────────────────────────────────────────
//   const startCall = useCallback(async () => {
//     const stream = await getLocalStream();
//     if (!stream) return;
//     const pc = createPC(stream);

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     socket.emit("callUser", {
//       to: receiverId,
//       signal: offer,
//       from: authUser.user._id,
//       callType,
//       callerName: authUser.user.fullname
//     });

//     setCallState("calling");
//   }, [getLocalStream, createPC, socket, receiverId, authUser, callType]);

//   // ── Answer call ───────────────────────────────────────────
//   const answerCall = useCallback(async () => {
//     const stream = await getLocalStream();
//     if (!stream) return;
//     const pc = createPC(stream);

//     await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);

//     socket.emit("answerCall", { to: incomingCall.from, signal: answer });
//     setCallState("active");

//     timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
//   }, [getLocalStream, createPC, socket, incomingCall]);

//   // ── End call ──────────────────────────────────────────────
//   const endCall = useCallback(() => {
//     socket.emit("endCall", { to: receiverId });
//     cleanup();
//   }, [socket, receiverId]);

//   const cleanup = useCallback(() => {
//     clearInterval(timerRef.current);
//     if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach(t => t.stop());
//     }
//     onClose();
//   }, [onClose]);

//   // ── Socket listeners ──────────────────────────────────────
//   useEffect(() => {
//     if (!socket) return;

//     socket.on("callAccepted", async (signal) => {
//       if (pcRef.current) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
//         setCallState("active");
//         timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
//       }
//     });

//     socket.on("callRejected", () => {
//       alert("Call rejected.");
//       cleanup();
//     });

//     socket.on("callEnded", () => {
//       cleanup();
//     });

//     socket.on("iceCandidate", async ({ candidate }) => {
//       try {
//         if (pcRef.current && candidate) {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (e) {}
//     });

//     return () => {
//       socket.off("callAccepted");
//       socket.off("callRejected");
//       socket.off("callEnded");
//       socket.off("iceCandidate");
//     };
//   }, [socket, cleanup]);

//   // ── Auto-start ────────────────────────────────────────────
//   useEffect(() => {
//     if (!incomingCall) {
//       startCall();
//     }
//     return () => { clearInterval(timerRef.current); };
//   }, []);

//   const toggleMute = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = isMuted; });
//       setIsMuted(!isMuted);
//     }
//   };

//   const toggleCam = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = isCamOff; });
//       setIsCamOff(!isCamOff);
//     }
//   };

//   const formatDuration = (s) =>
//     `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

//   return (
//     <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center">
      
//       {/* ── Videos ─────────────────────────────────── */}
//       {callType === "video" && (
//         <div className="relative w-full max-w-2xl mx-auto mb-4 rounded-2xl overflow-hidden bg-gray-900 aspect-video">
//           {/* Remote */}
//           <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             className="w-full h-full object-cover"
//           />
//           {/* Local (PiP) */}
//           <video
//             ref={localVideoRef}
//             autoPlay
//             playsInline
//             muted
//             className="absolute bottom-3 right-3 w-28 h-20 object-cover rounded-xl border-2 border-teal-400 shadow-lg"
//           />
//           {/* State overlay */}
//           {callState !== "active" && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
//               <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center text-4xl mb-3">
//                 {selectedConversation?.fullname?.[0]?.toUpperCase() || incomingCall?.callerName?.[0] || "?"}
//               </div>
//               <p className="text-white text-xl font-semibold">
//                 {incomingCall?.callerName || selectedConversation?.fullname}
//               </p>
//               <p className="text-gray-400 text-sm mt-1">
//                 {callState === "calling" ? "📞 Calling..." : "📲 Incoming call..."}
//               </p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Voice call display */}
//       {callType === "voice" && (
//         <div className="flex flex-col items-center mb-8">
//           <div className="w-28 h-28 rounded-full bg-teal-600 flex items-center justify-center text-5xl mb-4 shadow-2xl">
//             {selectedConversation?.fullname?.[0]?.toUpperCase() || incomingCall?.callerName?.[0] || "?"}
//           </div>
//           <p className="text-white text-2xl font-semibold">
//             {incomingCall?.callerName || selectedConversation?.fullname}
//           </p>
//           <p className="text-gray-400 mt-2">
//             {callState === "calling" ? "📞 Calling..." :
//              callState === "incoming" ? "📲 Incoming voice call..." :
//              `🎙️ ${formatDuration(callDuration)}`}
//           </p>
//           <audio ref={remoteVideoRef} autoPlay />
//           <audio ref={localVideoRef} muted autoPlay />
//         </div>
//       )}

//       {/* Duration */}
//       {callState === "active" && callType === "video" && (
//         <div className="text-teal-400 font-mono text-lg mb-3">
//           🕐 {formatDuration(callDuration)}
//         </div>
//       )}

//       {/* ── Controls ──────────────────────────────── */}
//       <div className="flex items-center gap-4">
//         {/* Incoming — answer / reject */}
//         {callState === "incoming" && (
//           <>
//             <button
//               onClick={answerCall}
//               className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-2xl shadow-lg transition-all"
//               title="Answer"
//             >📞</button>
//             <button
//               onClick={() => { socket.emit("rejectCall", { to: incomingCall.from }); onClose(); }}
//               className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-2xl shadow-lg transition-all"
//               title="Reject"
//             >📵</button>
//           </>
//         )}

//         {/* Active / calling controls */}
//         {callState !== "incoming" && (
//           <>
//             <button
//               onClick={toggleMute}
//               className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow transition-all
//                 ${isMuted ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
//               title={isMuted ? "Unmute" : "Mute"}
//             >{isMuted ? "🔇" : "🎙️"}</button>

//             {callType === "video" && (
//               <button
//                 onClick={toggleCam}
//                 className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow transition-all
//                   ${isCamOff ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
//                 title={isCamOff ? "Turn on camera" : "Turn off camera"}
//               >{isCamOff ? "📷" : "🎥"}</button>
//             )}

//             <button
//               onClick={endCall}
//               className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-2xl shadow-lg transition-all"
//               title="End call"
//             >📵</button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default VideoCall;



import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSocketContext } from "../../context/SocketContext.jsx";
import { useAuth } from "../../context/AuthProvider.jsx";
import useConversation from "../../zustand/useConversation.js";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

// ── Apple-style ringtone using Web Audio API ─────────────────
const createRingtone = () => {
  let audioCtx = null;
  let isPlaying = false;
  let timeoutId = null;

  const playTone = () => {
    if (!isPlaying) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const playNote = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      // Apple FaceTime style — two tone ring
      playNote(1050, now + 0.0,  0.15);
      playNote(880,  now + 0.0,  0.15);
      playNote(1050, now + 0.2,  0.15);
      playNote(880,  now + 0.2,  0.15);
      playNote(1050, now + 0.4,  0.15);
      playNote(880,  now + 0.4,  0.15);

      // Repeat after 2 seconds
      timeoutId = setTimeout(() => {
        if (isPlaying) playTone();
      }, 2000);
    } catch (e) {
      console.warn("Ringtone error:", e);
    }
  };

  return {
    start: () => {
      isPlaying = true;
      playTone();
    },
    stop: () => {
      isPlaying = false;
      clearTimeout(timeoutId);
      try { audioCtx?.close(); } catch (e) {}
    }
  };
};

function VideoCall({ callType = "video", onClose, incomingCall }) {
  const { socket } = useSocketContext();
  const [authUser] = useAuth();
  const { selectedConversation } = useConversation();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const ringtoneRef = useRef(null);

  const [callState, setCallState] = useState(incomingCall ? "incoming" : "calling");
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);

  const receiverId = incomingCall ? incomingCall.from : selectedConversation?._id;

  // ── Start / Stop ringtone ─────────────────────────────────
  useEffect(() => {
    ringtoneRef.current = createRingtone();

    // Ringtone sirf calling aur incoming state mein baje
    if (callState === "calling" || callState === "incoming") {
      ringtoneRef.current.start();
    }

    return () => {
      ringtoneRef.current?.stop();
    };
  }, []);

  // Ringtone band karo jab call active ho
  useEffect(() => {
    if (callState === "active") {
      ringtoneRef.current?.stop();
    }
  }, [callState]);

  // ── Local stream ──────────────────────────────────────────
  const getLocalStream = useCallback(async () => {
    try {
      const constraints = callType === "video"
        ? { video: true, audio: true }
        : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Media error:", err);
      alert("Could not access camera/microphone.");
      onClose();
    }
  }, [callType]);

  // ── Peer connection ───────────────────────────────────────
  const createPC = useCallback((stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", { to: receiverId, candidate: event.candidate });
      }
    };

    return pc;
  }, [socket, receiverId]);

  // ── Start call ────────────────────────────────────────────
  const startCall = useCallback(async () => {
    const stream = await getLocalStream();
    if (!stream) return;
    const pc = createPC(stream);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("callUser", {
      to: receiverId,
      signal: offer,
      from: authUser.user._id,
      callType,
      callerName: authUser.user.fullname
    });
    setCallState("calling");
  }, [getLocalStream, createPC, socket, receiverId, authUser, callType]);

  // ── Answer call ───────────────────────────────────────────
  const answerCall = useCallback(async () => {
    ringtoneRef.current?.stop();
    const stream = await getLocalStream();
    if (!stream) return;
    const pc = createPC(stream);
    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answerCall", { to: incomingCall.from, signal: answer });
    setCallState("active");
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
  }, [getLocalStream, createPC, socket, incomingCall]);

  // ── End call ──────────────────────────────────────────────
  const endCall = useCallback(() => {
    ringtoneRef.current?.stop();
    socket.emit("endCall", { to: receiverId });
    cleanup();
  }, [socket, receiverId]);

  const cleanup = useCallback(() => {
    ringtoneRef.current?.stop();
    clearInterval(timerRef.current);
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    onClose();
  }, [onClose]);

  // ── Socket listeners ──────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on("callAccepted", async (signal) => {
      ringtoneRef.current?.stop();
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        setCallState("active");
        timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
      }
    });

    socket.on("callRejected", () => {
      ringtoneRef.current?.stop();
      alert("Call rejected.");
      cleanup();
    });

    socket.on("callEnded", () => {
      ringtoneRef.current?.stop();
      cleanup();
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      try {
        if (pcRef.current && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {}
    });

    return () => {
      socket.off("callAccepted");
      socket.off("callRejected");
      socket.off("callEnded");
      socket.off("iceCandidate");
    };
  }, [socket, cleanup]);

  useEffect(() => {
    if (!incomingCall) {
      startCall();
    }
    return () => { clearInterval(timerRef.current); };
  }, []);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = isMuted; });
      setIsMuted(!isMuted);
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = isCamOff; });
      setIsCamOff(!isCamOff);
    }
  };

  const rejectCall = () => {
    ringtoneRef.current?.stop();
    socket.emit("rejectCall", { to: incomingCall.from });
    onClose();
  };

  const formatDuration = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center">

      {/* ── Video streams ─────────────────────────── */}
      {callType === "video" && (
        <div className="relative w-full max-w-2xl mx-auto mb-4 rounded-2xl overflow-hidden bg-gray-900 aspect-video">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <video
            ref={localVideoRef} autoPlay playsInline muted
            className="absolute bottom-3 right-3 w-28 h-20 object-cover rounded-xl border-2 border-teal-400 shadow-lg"
          />
          {callState !== "active" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center text-4xl mb-3">
                {selectedConversation?.fullname?.[0]?.toUpperCase() || incomingCall?.callerName?.[0] || "?"}
              </div>
              <p className="text-white text-xl font-semibold">
                {incomingCall?.callerName || selectedConversation?.fullname}
              </p>
              <p className="text-gray-400 text-sm mt-1 animate-pulse">
                {callState === "calling" ? "📞 Calling..." : "📲 Incoming call..."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Voice call UI ─────────────────────────── */}
      {callType === "voice" && (
        <div className="flex flex-col items-center mb-8">
          {/* Animated ring effect */}
          {(callState === "calling" || callState === "incoming") && (
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping scale-150" />
              <div className="absolute inset-0 rounded-full bg-teal-500/10 animate-ping scale-125" style={{ animationDelay: "0.3s" }} />
              <div className="w-28 h-28 rounded-full bg-teal-600 flex items-center justify-center text-5xl shadow-2xl relative z-10">
                {selectedConversation?.fullname?.[0]?.toUpperCase() || incomingCall?.callerName?.[0] || "?"}
              </div>
            </div>
          )}
          {callState === "active" && (
            <div className="w-28 h-28 rounded-full bg-teal-600 flex items-center justify-center text-5xl shadow-2xl mb-6">
              {selectedConversation?.fullname?.[0]?.toUpperCase() || incomingCall?.callerName?.[0] || "?"}
            </div>
          )}
          <p className="text-white text-2xl font-semibold">
            {incomingCall?.callerName || selectedConversation?.fullname}
          </p>
          <p className="text-gray-400 mt-2">
            {callState === "calling" ? "📞 Calling..." :
             callState === "incoming" ? "📲 Incoming voice call..." :
             `🎙️ ${formatDuration(callDuration)}`}
          </p>
          <audio ref={remoteVideoRef} autoPlay />
          <audio ref={localVideoRef} muted autoPlay />
        </div>
      )}

      {/* Duration */}
      {callState === "active" && callType === "video" && (
        <div className="text-teal-400 font-mono text-lg mb-3">
          🕐 {formatDuration(callDuration)}
        </div>
      )}

      {/* ── Call Controls ─────────────────────────── */}
      <div className="flex items-center gap-4">

        {/* Incoming — Answer / Reject */}
        {callState === "incoming" && (
          <>
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={answerCall}
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-2xl shadow-lg transition-all animate-bounce"
                title="Answer"
              >📞</button>
              <span className="text-xs text-gray-400">Answer</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={rejectCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-2xl shadow-lg transition-all"
                title="Reject"
              >📵</button>
              <span className="text-xs text-gray-400">Decline</span>
            </div>
          </>
        )}

        {/* Active / Calling controls */}
        {callState !== "incoming" && (
          <>
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow transition-all
                  ${isMuted ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
                title={isMuted ? "Unmute" : "Mute"}
              >{isMuted ? "🔇" : "🎙️"}</button>
              <span className="text-xs text-gray-400">{isMuted ? "Unmute" : "Mute"}</span>
            </div>

            {callType === "video" && (
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={toggleCam}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow transition-all
                    ${isCamOff ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
                  title={isCamOff ? "Camera on" : "Camera off"}
                >{isCamOff ? "📷" : "🎥"}</button>
                <span className="text-xs text-gray-400">{isCamOff ? "Cam On" : "Cam Off"}</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-2xl shadow-lg transition-all"
                title="End call"
              >📵</button>
              <span className="text-xs text-gray-400">End</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VideoCall;