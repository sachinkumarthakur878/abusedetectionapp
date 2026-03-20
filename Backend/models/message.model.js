// import mongoose from "mongoose";

// const reactionSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

// const messageSchema = new mongoose.Schema(
//   {

// const Message = mongoose.model("message", messageSchema);
// export default Message;

import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  emoji: { type: String }
}, { _id: false });

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "",  // ✅ required hata diya — voice/image ke liye empty ho sakta hai
    },
    messageType: {
      type: String,
      enum: ["text", "voice", "image", "file"],
      default: "text"
    },
    mediaUrl: { type: String, default: null },
    mediaName: { type: String, default: null },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
      default: null
    },
    reactions: [reactionSchema],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const Message = mongoose.model("message", messageSchema);
export default Message;