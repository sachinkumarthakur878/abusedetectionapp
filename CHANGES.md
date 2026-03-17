# 🚀 Enhanced Abuse Detection Chat App — Change Log

## ✅ What Was Added / Changed

---

### 🛡️ Backend Changes

#### `Backend/utils/simpleFilter.js`
- **Extended abuse word list** — 80+ Hindi/English abuse words with leetspeak variants
- **NEW: `abuseEmojis` list** — blocks offensive emojis like 🖕🔪🔫💣🍆 etc.
- **NEW: `containsAbuseEmoji(text)`** — checks emoji abuse
- **NEW: `isAbuseContent(text)`** — combined text + emoji abuse check

#### `Backend/models/message.model.js`
- Added `messageType` field: `"text" | "voice" | "image" | "file"`
- Added `mediaUrl` — stores base64 or URL for voice/image
- Added `mediaName` — original file name
- Added `replyTo` — reference to replied message
- Added `reactions` — array of `{ userId, emoji }`
- Added `readBy` — array of user IDs who read the message
- Added `isDeleted` + `deletedAt` for soft delete

#### `Backend/controller/message.controller.js`
- `sendMessage` — now handles text/voice/image, checks emoji abuse, populates `replyTo`
- **NEW: `reactToMessage`** — add/toggle emoji reactions per message
- **NEW: `deleteMessage`** — soft delete (marks as deleted, hides content)
- **NEW: `checkAbuse`** — GET endpoint for real-time frontend text checking
- `getMessage` — now populates `replyTo`, marks messages as read

#### `Backend/routes/message.route.js`
- Added routes: `POST /react/:id`, `DELETE /delete/:id`, `POST /check-abuse`

#### `Backend/SocketIO/server.js`
- **NEW: Typing indicator** — `typing` / `stopTyping` events
- **NEW: Read receipts** — `markRead` / `messagesRead` events
- **NEW: WebRTC signaling** — `callUser`, `answerCall`, `rejectCall`, `endCall`, `iceCandidate`

---

### 🎨 Frontend Changes

#### `src/home/Rightpart/Typesend.jsx` ← MAJOR REWRITE
- **Real-time abuse detection** while typing — input turns red, warning shown
- **Send button disabled** when abuse detected (cursor-not-allowed, opacity-50)
- **Red warning banner** with animated pulse when abuse detected
- **Emoji Picker** — 30+ safe emojis, offensive emojis blocked
- **Voice Message** — record audio, preview, send or cancel
- **Image Attach** — pick image, preview thumbnail, send
- **Reply support** — shows reply preview, passes `replyTo` on send
- **Typing indicator** — emits socket events while user types

#### `src/home/Rightpart/Message.jsx` ← MAJOR REWRITE
- **Reply preview** shown above bubble
- **Voice messages** rendered with `<audio>` player
- **Image messages** rendered as clickable thumbnails
- **Hover actions** — react, reply, delete (own messages only)
- **Emoji reaction picker** — 8 quick reactions on hover
- **Reaction display** — grouped emoji counts below bubble
- **Read receipts** — ✓ sent, ✓✓ read
- **Soft delete display** — shows "🚫 This message was deleted"

#### `src/home/Rightpart/Messages.jsx`
- **Typing indicator** — animated bouncing dots when other user is typing

#### `src/home/Rightpart/Chatuser.jsx`
- **Voice call button** 📞
- **Video call button** 🎥
- Handles incoming call popup

#### `src/home/Rightpart/Right.jsx`
- Wires reply state between Messages ↔ Typesend
- Improved NoChatSelected screen with feature tags

#### `src/home/Rightpart/VideoCall.jsx` ← NEW FILE
- Full WebRTC peer-to-peer video/voice calling
- Local + remote video streams
- Mute / camera toggle
- End call, reject call, answer call
- Call duration timer
- STUN server configuration

#### `src/home/Leftpart/Left.jsx`
- Shows logged-in user avatar + name at top
- Online status indicator

#### `src/home/Leftpart/User.jsx`
- Green dot for online users
- Highlighted selected conversation

#### `src/home/Leftpart/Search.jsx`
- Redesigned search bar with clear button

#### `src/home/Leftpart/Logout.jsx`
- Redesigned logout button

#### `src/context/useSendMessage.js`
- Supports object payload `{ message, messageType, mediaUrl, mediaName, replyTo }`
- Exposes `reactToMessage()` and `deleteMessage()`

#### `src/context/useGetSocketMessage.js`
- Handles: `newMessage`, `userTyping`, `userStoppedTyping`, `messageReaction`, `messageDeleted`

#### `src/context/SocketContext.jsx`
- Cleaned up, supports both localhost:3001 and localhost:5173 origins

#### `src/zustand/useConversation.js`
- Added `typingUsers` state

#### `src/index.css`
- Custom scrollbar, audio player, dark base styles

---

## 🔧 How to Run

```bash
# Backend
cd Backend
npm install
npm run dev   # runs on port 4002

# Frontend
cd Frontend
npm install
npm run dev   # runs on port 5173 (or 3001)
```

Add `.env` in Backend:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key   # optional
PORT=4002
```
