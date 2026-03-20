# 🛡️ SecureChat — Abuse Detection Chat Application

> A full-stack real-time chat application with multi-layer AI-powered abuse detection for text, voice, images, and emojis.

**Live Demo:** [securechatwebapp-2huv.vercel.app](https://securechatwebapp-2huv.vercel.app/)  
**Backend API:** [https://securechatwebapp-yv8p.onrender.com](https://securechatwebapp-yv8p.onrender.com)

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Abuse Detection System](#abuse-detection-system)
  - [Text Abuse Detection](#1-text-abuse-detection)
  - [Voice Abuse Detection](#2-voice-abuse-detection)
  - [Image Abuse Detection](#3-image-abuse-detection)
  - [Emoji Abuse Detection](#4-emoji-abuse-detection)
- [Audio & Video Calling](#audio--video-calling)
- [Real-time Features](#real-time-features)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)

---

## 🧰 Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.19.2 | REST API server |
| MongoDB + Mongoose | 8.3.2 | Database |
| Socket.IO | 4.7.5 | Real-time communication |
| JSON Web Token | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password hashing |
| OpenAI SDK | 6.22.0 | AI moderation (optional) |
| dotenv | 16.6.1 | Environment config |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.2.0 | Build tool |
| Tailwind CSS + DaisyUI | 3.4.3 / 4.10.2 | Styling |
| Zustand | 4.5.2 | State management |
| Socket.IO Client | 4.7.5 | Real-time events |
| Axios | 1.6.8 | HTTP requests |
| NSFWJS | 4.2.1 | Image abuse detection (AI) |
| @tensorflow/tfjs | 4.22.0 | NSFWJS runtime |
| @xenova/transformers | 2.17.2 | Text AI model (toxic-bert) |
| React Hook Form | 7.51.3 | Form handling |
| React Router DOM | 6.23.0 | Routing |

### WebRTC (Video/Audio Calls)
| Technology | Purpose |
|-----------|---------|
| Browser WebRTC API | Peer-to-peer video/audio streaming |
| STUN Servers (Google) | NAT traversal for direct connections |
| Socket.IO Signaling | Offer/Answer/ICE candidate exchange |

---

## ✨ Features

- 🔐 JWT-based authentication with secure HTTP-only cookies
- 💬 Real-time text messaging with Socket.IO
- 🛡️ Multi-layer abuse detection (text, voice, image, emoji)
- 🎤 Voice message recording with live speech-to-text
- 🖼️ Image sharing with AI content scanning
- 📹 WebRTC peer-to-peer video calls
- 📞 WebRTC peer-to-peer voice calls
- 😊 Message reactions (emoji)
- ↩️ Reply to messages
- 🗑️ Delete messages (soft delete)
- ✓✓ Read receipts
- ⌨️ Typing indicators
- 🟢 Online/Offline status
- 🔔 Notification sounds

---

## 🛡️ Abuse Detection System

SecureChat uses a **4-layer defense system** to detect and block abusive content across all media types.

---

### 1. Text Abuse Detection

**Where:** Frontend (real-time) + Backend (server-side verification)

#### How it works:

```
User types → Frontend checks instantly → Send button disabled if abuse found
                                       ↓
                              Backend double-checks
                                       ↓
                         OpenAI Moderation API (optional)
```

#### Layer 1 — Static Word List (Frontend, instant)

A comprehensive list of **150+ abuse words** in:
- Hindi (Roman transliteration): `madarchod`, `chutiya`, `bhosdike`, `harami`, etc.
- Hindi (Devanagari script): `पागल`, `बकलोल`, `मादरचोद`, etc.
- English: `fuck`, `shit`, `asshole`, `bastard`, etc.
- Leetspeak variants: `m@darchod`, `ch*tiya`, `f**k`, `$hit`, etc.

**File:** `Frontend/src/utils/abuseDetector.js`

```javascript
// Example: checks normalized text + leetspeak variants
const foundWord = fallbackWords.find(w => {
  const wClean = w.replace(/\s+/g, "");
  return noSpace.includes(wClean) || words.some(tw => tw.includes(wClean));
});
```

#### Layer 2 — Devanagari to Roman Transliteration

Hindi words typed in Devanagari script are automatically converted to Roman for matching:

```javascript
// पागल → pagal, मादरचोद → maadarachod
const devanagariToRoman = (text) => {
  // character-by-character mapping
};
```

**Supports:** Full Devanagari character set including matras, half-consonants, and special characters.

#### Layer 3 — AI Text Classification (Xenova/transformers)

After the static check, a **600ms debounced AI check** runs using `toxic-bert` model in the browser:

```javascript
classifier = await pipeline(
  "text-classification",
  "Xenova/toxic-bert",
  { quantized: true }
);
```

**Detects labels:** `toxic`, `severe_toxic`, `obscene`, `threat`, `insult`, `identity_hate`

**Threshold:** 60% confidence required to block

The model runs **entirely in the browser** — no API call needed, no data sent to any server.

#### Layer 4 — OpenAI Moderation API (Backend, optional)

If `OPENAI_API_KEY` is set in `.env`, every text message is additionally checked via OpenAI's moderation endpoint:

```javascript
// Backend: utils/aiModeration.js
const response = await openai.moderations.create({
  model: "omni-moderation-latest",
  input: text,
});
```

If rate-limited, this check is gracefully skipped.

#### Frontend UX on Abuse Detection:

- Input field turns **red** with red border
- **Send button is disabled** (cursor-not-allowed, opacity 50%)
- **Animated red warning banner** appears with the detected word
- A small **spinning indicator** shows when AI is checking

---

### 2. Voice Abuse Detection

**Where:** Frontend only (browser-based, real-time during recording)

**Technology:** [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — built into Chrome/Edge browsers, no external service.

#### How it works:

```
User clicks mic → MediaRecorder starts (captures audio)
                → SpeechRecognition starts (live transcription)
                       ↓
              Words transcribed in real-time
                       ↓
           checkAbuseAI() called on every result
                       ↓
         Abuse found? → Recording STOPS immediately
                        Audio blob DISCARDED
                        Red banner shown with detected word
                       ↓
         No abuse? → Recording continues
                     User sees live transcript
                     User can preview and send
```

#### Technical Implementation:

Two parallel processes run during recording:

**Process 1 — MediaRecorder (actual audio capture):**
```javascript
const mr = new MediaRecorder(stream);
mr.ondataavailable = (e) => audioChunks.push(e.data);
mr.onstop = () => {
  if (!voiceAbuseDetected) {
    setAudioBlob(new Blob(audioChunks, { type: "audio/webm" }));
  }
  // If abuse detected, blob is discarded
};
mr.start(250); // collect every 250ms
```

**Process 2 — SpeechRecognition (live transcription + abuse check):**
```javascript
recognition.lang = "hi-IN";          // Hindi primary
recognition.continuous = false;       // chunk-based for stability
recognition.interimResults = true;    // partial results for real-time check

recognition.onresult = async (event) => {
  const combined = (finalText + interimText).trim();
  setVoiceTranscript(combined);        // show in UI

  const result = await checkAbuseAI(combined);
  if (result.abuse) {
    stopRecordingDueToAbuse();         // instant stop
  }
};
```

#### Browser Support:
| Browser | Support |
|---------|---------|
| Chrome ✅ | Full — Speech API + abuse detection |
| Edge ✅ | Full |
| Firefox ⚠️ | Audio records but no live transcript |
| Safari ⚠️ | Limited |
| Brave ⚠️ | Shields must be down (Google Speech API blocked by default) |

#### Language Support:
- **Hindi** (Devanagari) — primary
- **English** — auto-detected within `hi-IN` locale
- Both languages work simultaneously in the same recording

#### On Abuse Detected:
- Recording stops **automatically**
- Audio is **permanently discarded** — cannot be recovered or sent
- Large red banner appears showing the exact abusive word detected
- User must click "Dismiss & Try Again" to start a new recording

---

### 3. Image Abuse Detection

**Where:** Frontend only (browser-based, AI model)

**Technology:** [NSFWJS](https://github.com/infinitered/nsfwjs) + TensorFlow.js — runs entirely in the browser.

#### How it works:

```
User selects image → Basic validation (type, size)
                   → Preview shown immediately
                   → "AI Scanning..." overlay appears
                   → NSFWJS model classifies image
                          ↓
                   Returns 5 probability scores:
                   - Neutral
                   - Drawing
                   - Sexy
                   - Hentai
                   - Porn
                          ↓
                   Porn > 50% OR Hentai > 50%
                   OR (Sexy + Hentai + Porn) > 70%?
                          ↓
              YES → Image BLOCKED, red banner shown
              NO  → Image allowed, send button enabled
```

#### Technical Implementation:

```javascript
// Model loads once on component mount (~30MB, cached in browser)
const model = await nsfwjs.load();

// Classify the selected image
const img = new Image();
img.src = URL.createObjectURL(file);
await new Promise(resolve => { img.onload = resolve; });

const predictions = await model.classify(img);
// Example output:
// [
//   { className: "Neutral", probability: 0.92 },
//   { className: "Drawing", probability: 0.04 },
//   { className: "Sexy", probability: 0.02 },
//   { className: "Porn", probability: 0.01 },
//   { className: "Hentai", probability: 0.01 }
// ]

const totalNSFW = porn + hentai + sexy;
if (porn > 0.5 || hentai > 0.5 || totalNSFW > 0.7) {
  // BLOCK
}
```

#### Basic Validations (before AI scan):
- File type must be `image/*`
- File size must be ≤ 5MB

#### During Scan:
- Image preview shows with **yellow border** and opacity
- **Spinning "AI Scanning..." overlay** appears on the image
- Send button shows **yellow loading spinner**
- Send is disabled until scan completes

#### On NSFW Detection:
- Image preview removed
- Red banner: `"🚫 Inappropriate image blocked! (XX% unsafe content)"`
- Send button stays disabled

#### Note on Performance:
- Model is ~30MB and downloads once, then cached by browser
- Scan takes 1-3 seconds depending on device
- Works offline after first load

---

### 4. Emoji Abuse Detection

**Where:** Frontend (typing, real-time) + Backend (server-side)

**Technology:** Unicode string matching — no external library needed.

#### Blocked Emoji List:

| Category | Emojis |
|----------|--------|
| Offensive gesture | 🖕 🖕🏻 🖕🏼 🖕🏽 🖕🏾 🖕🏿 |
| Sexual innuendo | 🍆 🍑 💦 |
| Weapons/Violence | 🔪 🗡️ ⚔️ 🔫 💣 🧨 |
| Aggressive | 🤬 |

#### How it works:
```javascript
// Frontend — checked on every keystroke
const foundEmoji = abuseEmojis.find(e => text.includes(e));

// Backend — checked before saving to database
if (message && containsAbuseEmoji(message)) {
  return res.status(400).json({ error: "🚫 Offensive emojis detected!" });
}
```

#### Emoji Picker:
The in-built emoji picker only shows **safe emojis** — offensive emojis are never available to click.

---

## 📹 Audio & Video Calling

**Technology:** [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) — browser-native, peer-to-peer

**Signaling:** Socket.IO (for exchanging connection metadata)

**ICE Servers:** Google STUN servers for NAT traversal

### Architecture:

```
Caller                    Signaling Server              Receiver
  |                        (Socket.IO)                     |
  |-- callUser (offer) --->|                               |
  |                        |-- incomingCall (offer) ------>|
  |                        |                               |
  |                        |<-- answerCall (answer) --------|
  |<-- callAccepted -------|                               |
  |                        |                               |
  |<====== ICE Candidates exchanged via socket ==========>|
  |                        |                               |
  |<=================== Direct P2P Stream ================>|
```

### How a Call Works:

**Step 1 — Initiator clicks call button:**
```javascript
const stream = await navigator.mediaDevices.getUserMedia({ 
  video: true,  // for video call
  audio: true 
});
const pc = new RTCPeerConnection(ICE_SERVERS);
stream.getTracks().forEach(track => pc.addTrack(track, stream));
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
socket.emit("callUser", { to: receiverId, signal: offer, callType: "video" });
```

**Step 2 — Receiver gets incoming call notification:**
- Ringtone plays (Web Audio API)
- Incoming call UI appears with Answer/Decline buttons
- Animated ping rings shown

**Step 3 — Receiver answers:**
```javascript
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
const pc = new RTCPeerConnection(ICE_SERVERS);
await pc.setRemoteDescription(incomingCall.signal);
const answer = await pc.createAnswer();
await pc.setLocalDescription(answer);
socket.emit("answerCall", { to: callerId, signal: answer });
```

**Step 4 — Direct P2P stream established:**
- Video streams via WebRTC directly between browsers
- No video data passes through the server
- ICE candidates exchanged via Socket.IO for connectivity

### ICE/STUN Configuration:
```javascript
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};
```

### Ringtone (Apple FaceTime Style):
Ringtone is generated using the **Web Audio API** — no MP3 file needed:
```javascriptd
// Two-tone ring: 1050Hz + 880Hz simultaneously, repeats every 2 seconds
const playNote = (freq, startTime, duration) => {
  const osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startTime);
  // ... fade in/out for natural sound
};
playNote(1050, now, 0.15);  // High tone
playNote(880,  now, 0.15);  // Low tone
```

### Call Controls:
| Button | Function |
|--------|---------|
| 📞 Answer | Accept incoming call |
| 📵 Decline/End | Reject or end call |
| 🎙️ Mute | Toggle microphone |
| 🎥 Camera Off | Toggle camera (video only) |

### Call UI:
- **Video call:** Large remote video + small local video (Picture-in-Picture)
- **Voice call:** Avatar with animated ping rings + call duration timer
- Both show caller name and status (Calling... / Connected)

---

## ⚡ Real-time Features

**Technology:** Socket.IO (WebSocket with HTTP fallback)

| Feature | Socket Event | Direction |
|---------|-------------|-----------|
| New message | `newMessage` | Server → Receiver |
| Typing indicator | `typing` / `stopTyping` | Client → Server → Receiver |
| Read receipts | `markRead` / `messagesRead` | Client → Server → Sender |
| Online status | `getOnlineUsers` | Server → All clients |
| Message reactions | `messageReaction` | Server → Both users |
| Message deleted | `messageDeleted` | Server → Receiver |
| Video/Voice call | `callUser`, `answerCall`, etc. | Client → Server → Target |

---

## 📁 Project Structure

```
securechatwebapp/
├── Backend/
│   ├── SocketIO/
│   │   └── server.js          # Socket.IO setup + WebRTC signaling
│   ├── controller/
│   │   ├── message.controller.js  # Send, get, react, delete, check-abuse
│   │   └── user.controller.js     # Signup, login, logout, all users
│   ├── jwt/
│   │   └── generateToken.js   # JWT creation + cookie setting
│   ├── middleware/
│   │   └── secureRoute.js     # JWT auth middleware
│   ├── models/
│   │   ├── conversation.model.js
│   │   ├── message.model.js   # text/voice/image types, reactions, readBy
│   │   └── user.model.js
│   ├── routes/
│   │   ├── message.route.js
│   │   └── user.route.js
│   ├── utils/
│   │   ├── aiModeration.js    # OpenAI moderation API
│   │   └── simpleFilter.js    # Word list + emoji abuse filter
│   └── index.js               # Express app entry point
│
└── Frontend/
    └── src/
        ├── components/
        │   ├── Login.jsx
        │   └── Signup.jsx
        ├── context/
        │   ├── AuthProvider.jsx
        │   ├── SocketContext.jsx
        │   ├── useGetAllUsers.jsx
        │   ├── useGetMessage.js
        │   ├── useGetSocketMessage.js
        │   └── useSendMessage.js
        ├── home/
        │   ├── Leftpart/         # Sidebar: contacts, search, logout
        │   └── Rightpart/
        │       ├── Chatuser.jsx  # Chat header + call buttons
        │       ├── Message.jsx   # Single message bubble
        │       ├── Messages.jsx  # Message list + typing indicator
        │       ├── Right.jsx     # Right panel layout
        │       ├── Typesend.jsx  # Input: text/voice/image + abuse detection
        │       └── VideoCall.jsx # WebRTC video/voice call UI
        ├── utils/
        │   ├── abuseDetector.js  # AI + static abuse detection
        │   └── axiosInstance.js  # Axios with base URL + credentials
        └── zustand/
            └── useConversation.js
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

```bash
cd Backend
npm install
```

Create `Backend/.env`:
```env
PORT=4002
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
JWT_TOKEN=your_random_secret_key_here
OPENAI_API_KEY=sk-proj-...    # Optional — AI moderation
```

Start backend:
```bash
npm run dev
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3001`, proxies `/api` to `http://localhost:4002`.

---

## 🔑 Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 4002) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_TOKEN` | Yes | Secret key for JWT signing |
| `OPENAI_API_KEY` | No | OpenAI API key for AI moderation |

### Frontend
No `.env` needed — production URL is hardcoded in `axiosInstance.js` and `SocketContext.jsx`.

---

## 🌐 Deployment

### Backend — Render.com

1. Connect GitHub repo to Render
2. Set **Root Directory:** `Backend`
3. Set **Build Command:** `npm install`
4. Set **Start Command:** `node index.js`
5. Add environment variables in Render dashboard
6. Deploy — URL: `https://securechatwebapp-yv8p.onrender.com`

### Frontend — Vercel

1. Connect GitHub repo to Vercel
2. Set **Root Directory:** `Frontend`
3. Set **Build Command:** `npm run build`
4. Set **Output Directory:** `dist`
5. Deploy — URL: `https://securechatwebapp.vercel.app`

---

## 📡 API Endpoints

### Auth Routes (`/api/user`)

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/signup` | No | Create new account |
| POST | `/login` | No | Login, returns JWT cookie |
| POST | `/logout` | No | Clear JWT cookie |
| GET | `/allusers` | Yes | Get all users except self |

### Message Routes (`/api/message`)

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/send/:userId` | Yes | Send message (text/voice/image) |
| GET | `/get/:userId` | Yes | Get conversation messages |
| POST | `/react/:messageId` | Yes | Add/toggle emoji reaction |
| DELETE | `/delete/:messageId` | Yes | Soft delete own message |
| POST | `/check-abuse` | Yes | Check text for abuse |

---

## 🔐 Security Features

- **JWT** stored in `httpOnly` cookie — not accessible via JavaScript (XSS protection)
- `secure: true` — HTTPS only cookie
- `sameSite: "none"` — required for cross-origin (Vercel ↔ Render)
- **Password hashing** with bcryptjs (salt rounds: 10)
- **CORS** restricted to known origins only
- Abuse checks on both **frontend AND backend** — frontend can be bypassed, backend is the final gate
- Soft delete — deleted messages marked, not removed from DB

---

## 👨‍💻 Author

Built with ❤️ using MERN Stack + WebRTC + AI
