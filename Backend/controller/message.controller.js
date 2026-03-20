import { getReceiverSocketId, io } from "../SocketIO/server.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { isAbuseContent, containsAbuseEmoji } from "../utils/simpleFilter.js";
import { checkAbuseWithAI } from "../utils/aiModeration.js";

export const sendMessage = async (req, res) => {
  try {
    const { message, messageType = "text", mediaUrl, mediaName, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (messageType === "text" && (!message || !message.trim())) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    if (messageType === "text") {
      if (isAbuseContent(message)) {
        return res.status(400).json({
          error: "🚫 Abusive language detected! Message blocked.",
          type: "ABUSE_DETECTED"
        });
      }
      const aiResult = await checkAbuseWithAI(message);
      if (aiResult?.flagged) {
        return res.status(400).json({
          error: "🚫 AI detected harmful content! Message blocked.",
          type: "AI_FLAGGED"
        });
      }
    }

    if (message && containsAbuseEmoji(message)) {
      return res.status(400).json({
        error: "🚫 Offensive emojis detected! Message blocked.",
        type: "EMOJI_ABUSE"
      });
    }

    // FIX: Image ka base64 ab DB mein save hoga (5MB limit ke andar)
    // Base64 ~1.37x original size hota hai — 3.5MB file ≈ 4.8MB base64, MongoDB 16MB doc limit safe hai
    let safeMediaUrl = null;
    if (mediaUrl) {
      if (mediaUrl.startsWith("data:image/")) {
        // Size check: base64 string length se approximate bytes
        const approxBytes = (mediaUrl.length * 3) / 4;
        if (approxBytes > 5 * 1024 * 1024) {
          return res.status(400).json({ error: "Image too large. Max 5MB allowed." });
        }
        safeMediaUrl = mediaUrl; // ✅ DB mein save karo
      } else if (mediaUrl !== "image_stored_locally") {
        safeMediaUrl = mediaUrl;
      }
    }

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({ members: [senderId, receiverId] });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message: message || "",
      messageType,
      mediaUrl: safeMediaUrl,
      mediaName: mediaName || null,
      replyTo: replyTo || null,
      reactions: [],
      readBy: [senderId]
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    const populatedMsg = await Message.findById(newMessage._id)
      .populate("replyTo", "message senderId messageType");

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // FIX: Ab socket se image bhejna zaroori nahi — DB se milegi
      // Lekin real-time delivery ke liye socket se bhi bhejo (receiver online ho to turant dikhe)
      io.to(receiverSocketId).emit("newMessage", populatedMsg);
    }

    return res.status(201).json(populatedMsg);

  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: chatUser } = req.params;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, chatUser] },
    }).populate({
      path: "messages",
      populate: { path: "replyTo", select: "message senderId messageType" }
    });

    if (!conversation) return res.status(200).json([]);

    await Message.updateMany(
      {
        _id: { $in: conversation.messages },
        receiverId: senderId,
        readBy: { $ne: senderId }
      },
      { $addToSet: { readBy: senderId } }
    );

    return res.status(200).json(conversation.messages);

  } catch (error) {
    console.log("Error in getMessage:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (containsAbuseEmoji(emoji)) {
      return res.status(400).json({ error: "🚫 Offensive emoji not allowed." });
    }

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const existingIdx = message.reactions.findIndex(
      r => r.userId?.toString() === userId.toString()
    );

    if (existingIdx !== -1) {
      if (message.reactions[existingIdx].emoji === emoji) {
        message.reactions.splice(existingIdx, 1);
      } else {
        message.reactions[existingIdx].emoji = emoji;
      }
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    const senderSocketId = getReceiverSocketId(message.senderId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReaction", { messageId, reactions: message.reactions });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageReaction", { messageId, reactions: message.reactions });
    }

    return res.status(200).json({ reactions: message.reactions });

  } catch (error) {
    console.log("Error in reactToMessage:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.message = "This message was deleted";
    message.mediaUrl = null; // FIX: Delete hone par image bhi hata do
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.log("Error in deleteMessage:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const checkAbuse = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(200).json({ isAbuse: false });
    const simpleCheck = isAbuseContent(text);
    if (simpleCheck) {
      return res.status(200).json({ isAbuse: true, reason: "Abusive language detected" });
    }
    return res.status(200).json({ isAbuse: false });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
