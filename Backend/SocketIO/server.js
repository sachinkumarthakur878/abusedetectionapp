// // import dotenv from "dotenv";
// // dotenv.config();

// // import { Server } from "socket.io";
// // import http from "http";
// // import express from "express";

// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server, {
// //   cors: {
// //     origin: process.env.FRONTEND_URL,
// //     methods: ["GET", "POST"],
// //     credentials: true,
// //   },
// // });

// // export const getReceiverSocketId = (receiverId) => {
// //   return users[receiverId];
// // };

// // const users = {};

// // io.on("connection", (socket) => {
// //   console.log("✅ User connected:", socket.id);
// //   const userId = socket.handshake.query.userId;

// //   if (userId) {
// //     users[userId] = socket.id;
// //   }

// //   io.emit("getOnlineUsers", Object.keys(users));

// //   // ── Typing Indicator ──────────────────────────────────────
// //   socket.on("typing", ({ receiverId, senderId }) => {
// //     const receiverSocketId = getReceiverSocketId(receiverId);
// //     if (receiverSocketId) {
// //       io.to(receiverSocketId).emit("userTyping", { senderId });
// //     }
// //   });

// //   socket.on("stopTyping", ({ receiverId, senderId }) => {
// //     const receiverSocketId = getReceiverSocketId(receiverId);
// //     if (receiverSocketId) {
// //       io.to(receiverSocketId).emit("userStoppedTyping", { senderId });
// //     }
// //   });

// //   // ── Read Receipts ─────────────────────────────────────────
// //   socket.on("markRead", ({ senderId, receiverId }) => {
// //     const senderSocketId = getReceiverSocketId(senderId);
// //     if (senderSocketId) {
// //       io.to(senderSocketId).emit("messagesRead", { readBy: receiverId });
// //     }
// //   });

// //   // ── WebRTC Video/Voice Call Signaling ─────────────────────
// //   socket.on("callUser", ({ to, signal, from, callType, callerName }) => {
// //     const receiverSocketId = getReceiverSocketId(to);
// //     if (receiverSocketId) {
// //       io.to(receiverSocketId).emit("incomingCall", {
// //         signal,
// //         from,
// //         callType,
// //         callerName
// //       });
// //     }
// //   });

// //   socket.on("answerCall", ({ to, signal }) => {
// //     const callerSocketId = getReceiverSocketId(to);
// //     if (callerSocketId) {
// //       io.to(callerSocketId).emit("callAccepted", signal);
// //     }
// //   });

// //   socket.on("rejectCall", ({ to }) => {
// //     const callerSocketId = getReceiverSocketId(to);
// //     if (callerSocketId) {
// //       io.to(callerSocketId).emit("callRejected");
// //     }
// //   });

// //   socket.on("endCall", ({ to }) => {
// //     const otherSocketId = getReceiverSocketId(to);
// //     if (otherSocketId) {
// //       io.to(otherSocketId).emit("callEnded");
// //     }
// //   });

// //   socket.on("iceCandidate", ({ to, candidate }) => {
// //     const socketId = getReceiverSocketId(to);
// //     if (socketId) {
// //       io.to(socketId).emit("iceCandidate", { candidate });
// //     }
// //   });

// //   // ── Disconnect ────────────────────────────────────────────
// //   socket.on("disconnect", () => {
// //     console.log("❌ User disconnected:", socket.id);
// //     delete users[userId];
// //     io.emit("getOnlineUsers", Object.keys(users));
// //   });
// // });

// // export { app, io, server };

// import dotenv from "dotenv";
// dotenv.config();

// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: function (origin, callback) {
//       callback(null, true);
//     },
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// export const getReceiverSocketId = (receiverId) => {
//   return users[receiverId];
// };

// const users = {};

// io.on("connection", (socket) => {
//   console.log("✅ User connected:", socket.id);
//   const userId = socket.handshake.query.userId;

//   if (userId) {
//     users[userId] = socket.id;
//   }

//   io.emit("getOnlineUsers", Object.keys(users));

//   // ── Typing Indicator ──────────────────────────────────────
//   socket.on("typing", ({ receiverId, senderId }) => {
//     const receiverSocketId = getReceiverSocketId(receiverId);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("userTyping", { senderId });
//     }
//   });

//   socket.on("stopTyping", ({ receiverId, senderId }) => {
//     const receiverSocketId = getReceiverSocketId(receiverId);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("userStoppedTyping", { senderId });
//     }
//   });

//   // ── Read Receipts ─────────────────────────────────────────
//   socket.on("markRead", ({ senderId, receiverId }) => {
//     const senderSocketId = getReceiverSocketId(senderId);
//     if (senderSocketId) {
//       io.to(senderSocketId).emit("messagesRead", { readBy: receiverId });
//     }
//   });

//   // ── WebRTC Video/Voice Call Signaling ─────────────────────
//   socket.on("callUser", ({ to, signal, from, callType, callerName }) => {
//     const receiverSocketId = getReceiverSocketId(to);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("incomingCall", {
//         signal,
//         from,
//         callType,
//         callerName
//       });
//     }
//   });

//   socket.on("answerCall", ({ to, signal }) => {
//     const callerSocketId = getReceiverSocketId(to);
//     if (callerSocketId) {
//       io.to(callerSocketId).emit("callAccepted", signal);
//     }
//   });

//   socket.on("rejectCall", ({ to }) => {
//     const callerSocketId = getReceiverSocketId(to);
//     if (callerSocketId) {
//       io.to(callerSocketId).emit("callRejected");
//     }
//   });

//   socket.on("endCall", ({ to }) => {
//     const otherSocketId = getReceiverSocketId(to);
//     if (otherSocketId) {
//       io.to(otherSocketId).emit("callEnded");
//     }
//   });

//   socket.on("iceCandidate", ({ to, candidate }) => {
//     const socketId = getReceiverSocketId(to);
//     if (socketId) {
//       io.to(socketId).emit("iceCandidate", { candidate });
//     }
//   });

//   // ── Disconnect ────────────────────────────────────────────
//   socket.on("disconnect", () => {
//     console.log("❌ User disconnected:", socket.id);
//     delete users[userId];
//     io.emit("getOnlineUsers", Object.keys(users));
//   });
// });

// export { app, io, server };

import dotenv from "dotenv";
dotenv.config();

import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

const users = {};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId) {
    users[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(users));

  // ── Typing Indicator ──────────────────────────────────────
  socket.on("typing", ({ receiverId, senderId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { senderId });
    }
  });

  socket.on("stopTyping", ({ receiverId, senderId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", { senderId });
    }
  });

  // ── Read Receipts ─────────────────────────────────────────
  socket.on("markRead", ({ senderId, receiverId }) => {
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { readBy: receiverId });
    }
  });

  // ── WebRTC Video/Voice Call Signaling ─────────────────────
  socket.on("callUser", ({ to, signal, from, callType, callerName }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", {
        signal,
        from,
        callType,
        callerName
      });
    }
  });

  socket.on("answerCall", ({ to, signal }) => {
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", signal);
    }
  });

  socket.on("rejectCall", ({ to }) => {
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("callRejected");
    }
  });

  socket.on("endCall", ({ to }) => {
    const otherSocketId = getReceiverSocketId(to);
    if (otherSocketId) {
      io.to(otherSocketId).emit("callEnded");
    }
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    const socketId = getReceiverSocketId(to);
    if (socketId) {
      io.to(socketId).emit("iceCandidate", { candidate });
    }
  });

  // ── Image direct socket transfer ─────────────────────────
  socket.on("sendImageToReceiver", ({ receiverId, mediaUrl, mediaName, senderId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveImage", { mediaUrl, mediaName, senderId });
    }
  });

  // ── Disconnect ────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    delete users[userId];
    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, io, server };