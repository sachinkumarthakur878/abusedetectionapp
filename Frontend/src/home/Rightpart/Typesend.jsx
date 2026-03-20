import React, { useState, useRef, useEffect, useCallback } from "react";
import { IoSend } from "react-icons/io5";
import { BsMicFill, BsStopFill, BsImage, BsEmojiSmile, BsX } from "react-icons/bs";
import useSendMessage from "../../context/useSendMessage.js";
import useConversation from "../../zustand/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import { useAuth } from "../../context/AuthProvider.jsx";
import * as nsfwjs from "nsfwjs";
import * as tf from "@tensorflow/tfjs";

const abuseWords = [
  "bsdk","bhosdike","bhosadi","bhosadike","madarchod","madarchodi","mc",
  "chutiya","chutiye","chut","gandu","gaand","harami","kamina","saala",
  "saale","kutte","ullu","nalayak","bewakoof","pagal","idiot","stupid",
  "moron","loser","jerk","trash","scumbag","bastard","shit","fuck",
  "fucker","asshole","retard","useless","fool","liar","fraud","randi",
  "bitch","haramzada","haramzadi","haramkhor","bakwas","jhatu","lavde",
  "lund","chod","chodu","bhadwa","rakhel","kamini","kamine","suar",
  "suwar","gadha","gadhe","kutta","kutti","maderchod","benchod","bc",
  "behenchod","bhenchod","bhosdiwale","chutad","gand","gaandu","hijra",
  "hijar","lawde","laude","lodu","lodhu","maaki","terimaa","teribehen",
  "madar","madarjaat","randibaaz","randwa","chakka","chakke","tatti",
  "tattu","peshaab","peshab","mootna","moot","hagana","haagna","hagna",
  "bakwaas","baklol","bakloal","bklol","ullukapattha","bewakuf",
  "chutmarike","bhosdiwali","gaandmara","lavdya","jhavle","jhavli",
  "jhaat","jhaatu","jhaatke","bhenchodiya",
  "bsdk","bhosdike","bhosadi","bhosadike","bhosdiwale","bhosdiwali",
  "bhosdi","bhosad","bhosd",
 
  // ── MADARCHOD variants ────────────────────────────────────
  "madarchod","madarchodi","maderchod","madarjaat","madar",
  "madarchood","maa da","maada","maadar",
 
  // ── MC / BC short forms ───────────────────────────────────
  "mc","m c","emcee","emsi",
  "bc","b c","bisi","beesi","beecee",
  "benchod","behenchod","bhenchod","bhenchodiya","bhen chod",
 
  // ── CHUTIYA variants ──────────────────────────────────────
  "chutiya","chutiye","chut","chutad","chutmarike",
  "choot","chootiya","chootiyo",
 
  // ── GANDU / GAAND variants ────────────────────────────────
  "gandu","gaandu","gaand","gand","gaandmara",
  "gaand mara","gand mara",
 
  // ── HARAMI / KAMINA variants ──────────────────────────────
  "harami","haramzada","haramzadi","haramkhor",
  "kamina","kamini","kamine",
 
  // ── SAALA / KUTTE variants ────────────────────────────────
  "saala","saale","sala","sale",
  "kutte","kutta","kutti",
 
  // ── FUCK variants — Speech API ine sunta hai ─────────────
  "fuck","fucker","fucking","fucked","fuckoff","fuckup",
  "fak","faak","fakk","faku","fakyu","fakoff",
  "phuck","phak","phuck you","phak you",
  "fck","f ck","fu ck",
  "fuck you","fak you","faku","fukk",
  "fuckyu","fuckyou","fakyou","fak u","fu k",
 
  // ── SHIT variants ─────────────────────────────────────────
  "shit","shitt","shiit","shhit",
  "shite","shithead","bullshit","bull shit",
 
  // ── BASTARD / ASSHOLE variants ────────────────────────────
  "bastard","bastad","bastered",
  "asshole","ass hole","ashole","ahole",
 
  // ── BITCH variants ───────────────────────────────────────
  "bitch","bich","biatch","bytch","bich",
  "randi","randibaaz","randwa","rakhel",
 
  // ── LUND / LAVDE variants ─────────────────────────────────
  "lund","laund","land",
  "lavde","lavdya","lawde","laude","lodu","lodhu",
 
  // ── CHOD / CHODU variants ─────────────────────────────────
  "chod","chodu","chodna","chudna","chud",
  "chod de","chod do",
 
  // ── HIJRA / CHAKKA variants ───────────────────────────────
  "hijra","hijar","chakka","chakke",
 
  // ── SUAR / GADHA variants ─────────────────────────────────
  "suar","suwar","gadha","gadhe",
 
  // ── BAKWAS / BAKLOL variants ──────────────────────────────
  "bakwas","bakwaas","baklol","bakloal","bklol",
  "ullu","ullukapattha","bewakoof","bewakuf",
 
  // ── MAAKI / TERIMAAKI variants ───────────────────────────
  "maaki","terimaa","teribehen","maa ki","teri maa","teri behen",
  "maa ko","maa ke","teri maa ki","teri behen ki",
  "madarjaat",
 
  // ── JHAAT / JHAATU variants ───────────────────────────────
  "jhaat","jhaatu","jhaatke","jhatu",
 
  // ── TATTI / MOOT variants ─────────────────────────────────
  "tatti","tattu","moot","mootna","peshaab","peshab",
  "hagana","haagna","hagna",
 
  // ── JHAVLE / JHAVLI variants ──────────────────────────────
  "jhavle","jhavli",
 
  // ── ENGLISH GENERAL ABUSES ───────────────────────────────
  "idiot","stupid","moron","loser","jerk","trash",
  "scumbag","retard","useless","fool","liar","fraud",
  "dumb","clown","weirdo","psycho","lunatic","garbage",
  "filth","noob","crybaby","dramaqueen","pig","snake",
  "dirty","fake","bloody","dog",
 
  // ── NALAYAK / PAGAL variants ──────────────────────────────
  "nalayak","pagal","paagal","pagla","pagli",
 
  // ── BHADWA variants ───────────────────────────────────────
  "bhadwa","bhadwe","bhadwagiri",
 
  // ── EXTRA HINGLISH jo Speech API produce karta hai ───────
  "saale","haraami","kaminey","kutiya","kutiyan",
  "chikna","chikni","randu","laundi","lauda",
  "bhad mein jao","bhaad mein","nikal yahan se",
  "teri aukaat","teri maa ka","teri behen ka",
  "maa chod","behen chod","maa ki aankh",
  "tere baap","teri maa ko",
];

const abuseEmojis = [
  "🖕","🖕🏻","🖕🏼","🖕🏽","🖕🏾","🖕🏿",
  "🍆","🍑","💦","🔪","🗡️","⚔️","🔫","💣","🧨","🤬"
];

const EMOJI_LIST = [
  "😀","😂","🥰","😍","😎","🤔","😢","😡","👍","👎",
  "❤️","🔥","✨","🎉","🙏","💯","😊","🤩","😴","🤝",
  "👏","💪","🌟","🎊","🥳","😘","💙","💚","💛","🧡"
];

const devanagariMap = {
  // ── Vowels ───────────────────────────────────────────────
  'अ':'a',  'आ':'aa', 'इ':'i',  'ई':'ee',
  'उ':'u',  'ऊ':'oo', 'ए':'e',  'ऐ':'ai',
  'ओ':'o',  'औ':'au', 'अं':'an','अः':'ah',
 
  // ── Consonants ───────────────────────────────────────────
  'क':'k',  'ख':'kh', 'ग':'g',  'घ':'gh', 'ङ':'n',
  'च':'ch', 'छ':'chh','ज':'j',  'झ':'jh', 'ञ':'n',
  'ट':'t',  'ठ':'th', 'ड':'d',  'ढ':'dh', 'ण':'n',
  'त':'t',  'थ':'th', 'द':'d',  'ध':'dh', 'न':'n',
  'प':'p',
 
  // ✅ KEY FIX: फ → f (pehle 'ph' tha, isliye "fuck" match nahi hota tha)
  'फ':'f',
 
  'ब':'b',  'भ':'bh', 'म':'m',
  'य':'y',  'र':'r',  'ल':'l',  'व':'v',
  'श':'sh', 'ष':'sh', 'स':'s',  'ह':'h',
  'ळ':'l',  'क्ष':'ksh','त्र':'tr','ज्ञ':'gn',
 
  // ── Matras (vowel signs) ─────────────────────────────────
  'ा':'a',  'ि':'i',  'ी':'ee', 'ु':'u',
  'ू':'oo', 'े':'e',  'ै':'ai', 'ो':'o',
  'ौ':'au', 'ृ':'ri', 'ॅ':'e',  'ॉ':'o',
 
  // ── Nasalization & special ───────────────────────────────
  'ं':'n',  'ः':'h',  '्':'',   'ँ':'n',  'ऽ':'',
 
  // ── Nuktaa (dotted) consonants ───────────────────────────
  // ✅ फ़ → f (foreign sounds)
  'फ़':'f',
  'ज़':'z',  'क़':'q',  'ख़':'kh', 'ग़':'gh',
  'ड़':'r',  'ढ़':'rh',
 
  // ── Punctuation ──────────────────────────────────────────
  '।':' ',  '॥':' ',
 
  // ── Devanagari digits ────────────────────────────────────
  '०':'0',  '१':'1',  '२':'2',  '३':'3',  '४':'4',
  '५':'5',  '६':'6',  '७':'7',  '८':'8',  '९':'9',
};

const devanagariToRoman = (text) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += devanagariMap[text[i]] || text[i];
  }
  return result;
};

const checkAbuse = (text) => {
  if (!text) return { abuse: false };
  const normalized = text.toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f\s]/g, "")
    .replace(/\s+/g, " ").trim();
  const noSpace = normalized.replace(/\s/g, "");
  const words = normalized.split(" ");
  const romanized = devanagariToRoman(normalized).toLowerCase()
    .replace(/\s+/g, " ").trim();
  const romanNoSpace = romanized.replace(/\s/g, "");
  const romanWords = romanized.split(" ");
  const foundWord = abuseWords.find(w => {
    const wClean = w.replace(/\s+/g, "");
    return (
      noSpace.includes(wClean) ||
      words.some(tw => tw.includes(wClean)) ||
      romanNoSpace.includes(wClean) ||
      romanWords.some(tw => tw.includes(wClean))
    );
  });
  const foundEmoji = abuseEmojis.find(e => text.includes(e));
  if (foundWord || foundEmoji) return { abuse: true, found: foundWord || foundEmoji };
  return { abuse: false };
};

const createSpeechRecognition = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-IN";
  recognition.maxAlternatives = 1;
  return recognition;
};

// ── NSFW Model singleton ──────────────────────────────────────
let nsfwModel = null;
const loadNSFWModel = async () => {
  if (!nsfwModel) {
    nsfwModel = await nsfwjs.load();
  }
  return nsfwModel;
};

function Typesend({ replyMessage, onCancelReply }) {
  const [message, setMessage] = useState("");
  const [isAbuse, setIsAbuse] = useState(false);
  const [abuseWarning, setAbuseWarning] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceAbuse, setVoiceAbuse] = useState(false);
  const [voiceAbuseWord, setVoiceAbuseWord] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [imageScanning, setImageScanning] = useState(false); // ✅ scanning state

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const voiceAbuseRef = useRef(false);
  const isRecordingRef = useRef(false);
  const fullTranscriptRef = useRef("");

  const { loading, error, sendMessages, clearError } = useSendMessage();
  const { selectedConversation } = useConversation();
  const { socket } = useSocketContext();
  const [authUser] = useAuth();

  // ── Preload NSFW model on mount ───────────────────────────
  useEffect(() => {
    loadNSFWModel().catch(() => {});
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSpeechSupported(false);
  }, []);

  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  useEffect(() => {
    setMessage(""); setIsAbuse(false); setAbuseWarning("");
    setAudioBlob(null); setVoiceTranscript(""); setVoiceAbuse(false);
    setVoiceAbuseWord(""); setImageFile(null); setImagePreview(null);
    setImageError(""); setImageScanning(false);
  }, [selectedConversation?._id]);

  const handleTyping = useCallback(() => {
    if (socket && selectedConversation) {
      socket.emit("typing", {
        senderId: authUser?._id || authUser?.user?._id,
        receiverId: selectedConversation._id
      });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", {
          senderId: authUser?._id || authUser?.user?._id,
          receiverId: selectedConversation._id
        });
      }, 1500);
    }
  }, [socket, selectedConversation, authUser]);

  const handleChange = (e) => {
    const val = e.target.value;
    setMessage(val);
    handleTyping();
    const result = checkAbuse(val);
    if (result.abuse) {
      setIsAbuse(true);
      setAbuseWarning(`🚫 Abusive language detected ("${result.found}")! Message blocked.`);
    } else {
      setIsAbuse(false);
      setAbuseWarning("");
    }
  };

  // ── Image select + NSFW AI scan ───────────────────────────
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";

    // Basic checks
    if (!file.type.startsWith("image/")) {
      setImageError("🚫 Sirf image files allowed hain!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("🚫 Image 5MB se badi nahi honi chahiye!");
      return;
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
    setImageError("");
    setImageScanning(true); // scanning shuru

    try {
      const model = await loadNSFWModel();

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = previewUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const predictions = await model.classify(img);

      // Safely validate predictions
      if (!Array.isArray(predictions)) {
        // predictions valid nahi — allow karo
        setImageError("");
        return;
      }

      const porn = predictions.find(p => p.className === "Porn")?.probability || 0;
      const hentai = predictions.find(p => p.className === "Hentai")?.probability || 0;
      const sexy = predictions.find(p => p.className === "Sexy")?.probability || 0;
      const totalNSFW = porn + hentai + sexy;

      if (porn > 0.5 || hentai > 0.5 || totalNSFW > 0.7) {
        setImageError(
          `🚫 Inappropriate image detected! (${Math.round(totalNSFW * 100)}% unsafe)`
        );
        setImageFile(null);
        setImagePreview(null);
      } else {
        setImageError("");
      }
    } catch (err) {
      console.warn("NSFW scan failed:", err);
      // Scan fail — image allow karo
      setImageError("");
    } finally {
      setImageScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAbuse || imageError || imageScanning) return;

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64Image = ev.target.result;
        const success = await sendMessages({
          message: "",
          messageType: "image",
          mediaUrl: base64Image,
          mediaName: imageFile.name,
          replyTo: replyMessage?._id || null
        });
        if (success) {
          // Socket se receiver ko base64 image bhejo
          socket?.emit("sendImageToReceiver", {
            receiverId: selectedConversation?._id,
            mediaUrl: base64Image,
            mediaName: imageFile.name,
            senderId: authUser?._id || authUser?._id || authUser?.user?._id,
          });
          setImageFile(null); setImagePreview(null);
          setImageError(""); onCancelReply?.();
        }
      };
      reader.readAsDataURL(imageFile);
      return;
    }

    if (!message.trim()) return;
    const success = await sendMessages({
      message: message.trim(),
      messageType: "text",
      replyTo: replyMessage?._id || null
    });
    if (success) {
      setMessage(""); setIsAbuse(false); setAbuseWarning(""); onCancelReply?.();
      socket?.emit("stopTyping", {
        senderId: authUser?._id || authUser?.user?._id,
        receiverId: selectedConversation?._id
      });
    }
  };

  const stopRecordingDueToAbuse = useCallback(() => {
    clearInterval(timerRef.current);
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    setIsRecording(false);
  }, []);

  const startRecording = async () => {
    setVoiceTranscript(""); setVoiceAbuse(false); setVoiceAbuseWord("");
    setAudioBlob(null); voiceAbuseRef.current = false;
    audioChunksRef.current = []; fullTranscriptRef.current = "";

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start(250);
    } catch (err) {
      alert("🎤 Microphone permission denied!");
      return;
    }

    if (speechSupported) {
      const recognition = createSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.onresult = (event) => {
          let interimText = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) fullTranscriptRef.current += t + " ";
            else interimText += t;
          }
          const combined = (fullTranscriptRef.current + interimText).trim();
          setVoiceTranscript(combined);
          const result = checkAbuse(combined);
          if (result.abuse) {
            voiceAbuseRef.current = true;
            setVoiceAbuse(true);
            setVoiceAbuseWord(result.found);
            stopRecordingDueToAbuse();
          }
        };
        recognition.onerror = (e) => {
          if (e.error === "no-speech" || e.error === "aborted") return;
          console.warn("Speech recognition error:", e.error);
        };
        recognition.onend = () => {
          if (isRecordingRef.current && !voiceAbuseRef.current) {
            setTimeout(() => {
              if (isRecordingRef.current && !voiceAbuseRef.current) {
                try { recognition.start(); } catch (e) {}
              }
            }, 100);
          }
        };
        setTimeout(() => { try { recognition.start(); } catch (e) {} }, 300);
      }
    }

    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || voiceAbuse) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const success = await sendMessages({
        message: voiceTranscript ? `[Voice] ${voiceTranscript}` : "[Voice message]",
        messageType: "voice",
        mediaUrl: ev.target.result,
        mediaName: `voice_${Date.now()}.webm`,
        replyTo: replyMessage?._id || null
      });
      if (success) {
        setAudioBlob(null); setVoiceTranscript(""); setVoiceAbuse(false);
        setVoiceAbuseWord(""); setRecordingTime(0); onCancelReply?.();
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  const cancelVoice = () => {
    setAudioBlob(null); setVoiceTranscript(""); setVoiceAbuse(false);
    setVoiceAbuseWord(""); setRecordingTime(0);
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="sticky bottom-0 bg-black/90 border-t border-white/20 px-3 py-2">

      {/* Reply Preview */}
      {replyMessage && (
        <div className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-1 mb-2 text-sm border-l-4 border-teal-400">
          <div className="truncate text-gray-300">
            <span className="text-teal-400 font-semibold">↩ Reply: </span>
            {replyMessage.messageType === "voice" ? "🎤 Voice message" :
             replyMessage.messageType === "image" ? "🖼️ Image" :
             replyMessage.message}
          </div>
          <button onClick={onCancelReply} className="text-gray-400 hover:text-white ml-2">
            <BsX size={18} />
          </button>
        </div>
      )}

      {/* Image Preview + Scanning overlay */}
      {imagePreview && !imageError && (
        <div className="relative inline-block mb-2">
          <img src={imagePreview} alt="preview"
            className={`h-20 rounded-lg border ${imageScanning ? "border-yellow-400 opacity-60" : "border-white/30"}`}
          />
          {/* ✅ Scanning overlay */}
          {imageScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
              <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mb-1" />
              <span className="text-yellow-300 text-xs font-medium">Scanning...</span>
            </div>
          )}
          {!imageScanning && (
            <button
              onClick={() => { setImagePreview(null); setImageFile(null); setImageError(""); }}
              className="absolute -top-2 -right-2 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs"
            >✕</button>
          )}
        </div>
      )}

      {/* Image Error Banner */}
      {imageError && (
        <div className="flex items-center justify-between bg-red-900/80 border-2 border-red-500 rounded-xl px-4 py-3 mb-2">
          <div>
            <p className="text-red-300 font-bold text-sm">🚫 Image blocked!</p>
            <p className="text-red-400 text-xs mt-0.5">{imageError}</p>
          </div>
          <button onClick={() => setImageError("")}
            className="text-red-400 hover:text-white ml-3 text-lg leading-none">✕</button>
        </div>
      )}

      {/* Text Abuse Warning */}
      {(abuseWarning || error) && (
        <div className="flex items-center justify-between bg-red-900/70 border border-red-500 rounded-lg px-3 py-2 mb-2">
          <span className="text-red-300 text-sm font-medium">{abuseWarning || error}</span>
          {error && !abuseWarning && (
            <button onClick={clearError} className="text-red-400 hover:text-white ml-2 text-lg leading-none">✕</button>
          )}
        </div>
      )}

      {/* Voice Abuse Banner */}
      {voiceAbuse && (
        <div className="bg-red-900/80 border-2 border-red-500 rounded-xl px-4 py-3 mb-2">
          <p className="text-red-300 font-bold text-sm">🚫 Voice message blocked!</p>
          <p className="text-red-400 text-xs mt-0.5">
            Abusive word detected: <span className="font-mono font-bold">"{voiceAbuseWord}"</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">Recording automatically stopped. Please try again.</p>
          <button onClick={cancelVoice}
            className="mt-2 bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full">
            Dismiss & Try Again
          </button>
        </div>
      )}

      {/* Voice Recording UI */}
      {(isRecording || (audioBlob && !voiceAbuse)) && (
        <div className={`flex flex-col gap-2 rounded-xl px-4 py-3 mb-2 ${
          isRecording ? "bg-gray-800/80 border border-red-500/40" : "bg-gray-800"
        }`}>
          {isRecording ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <span className="text-red-400 text-sm font-mono font-bold">{formatTime(recordingTime)}</span>
                <span className="text-gray-400 text-xs">Recording...</span>
                <button onClick={stopRecording}
                  className="ml-auto bg-red-600 hover:bg-red-700 text-white rounded-full px-3 py-1 text-xs flex items-center gap-1">
                  <BsStopFill /> Stop
                </button>
              </div>
              {speechSupported ? (
                <div className="bg-black/40 rounded-lg px-3 py-2 min-h-[40px]">
                  <p className="text-xs text-gray-500 mb-0.5">Live transcript:</p>
                  <p className={`text-sm ${voiceTranscript ? "text-gray-200" : "text-gray-600 italic"}`}>
                    {voiceTranscript || "Speak now..."}
                  </p>
                  {!voiceTranscript && recordingTime >= 5 && (
                    <p className="text-xs text-yellow-400 mt-1">
                      ⚠️ Transcript nahi aa raha? Chrome use karo ya Brave Shields band karo.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-yellow-500">⚠️ Yeh browser Speech Recognition support nahi karta.</p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm">✅ Voice recorded</span>
                <span className="text-gray-500 text-xs">({formatTime(recordingTime)})</span>
              </div>
              {voiceTranscript && (
                <div className="bg-black/40 rounded-lg px-3 py-1.5">
                  <p className="text-xs text-gray-500 mb-0.5">Transcript:</p>
                  <p className="text-sm text-gray-200">{voiceTranscript}</p>
                </div>
              )}
              <audio src={URL.createObjectURL(audioBlob)} controls className="w-full h-8" />
              <div className="flex gap-2 mt-1">
                <button onClick={sendVoiceMessage} disabled={loading}
                  className="flex-1 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white rounded-xl py-1.5 text-sm flex items-center justify-center gap-2">
                  <IoSend /> Send Voice
                </button>
                <button onClick={cancelVoice}
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl px-4 py-1.5 text-sm">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="bg-gray-900 border border-white/20 rounded-xl p-2 mb-2 grid grid-cols-10 gap-1 max-h-32 overflow-y-auto">
          {EMOJI_LIST.map((emoji) => (
            <button key={emoji} type="button"
              className="text-xl hover:scale-125 transition-transform"
              onClick={() => { setMessage(prev => prev + emoji); inputRef.current?.focus(); }}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Row */}
      {!isRecording && !audioBlob && !voiceAbuse && (
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowEmojiPicker(v => !v)}
              className="text-yellow-400 hover:text-yellow-300 text-xl flex-shrink-0" title="Emoji">
              <BsEmojiSmile />
            </button>

            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="text-blue-400 hover:text-blue-300 text-xl flex-shrink-0" title="Attach Image">
              <BsImage />
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />

            <div className="flex-1">
              <input ref={inputRef} type="text" placeholder="Type a message..."
                value={message} onChange={handleChange}
                className={`w-full rounded-xl px-4 py-2.5 outline-none text-white text-sm transition-all
                  ${isAbuse
                    ? "bg-red-900/40 border-2 border-red-500 placeholder-red-400"
                    : "bg-white/10 border border-white/20 placeholder-gray-400"
                  }`}
              />
            </div>

            {!message.trim() && !imageFile && (
              <button type="button" onClick={startRecording}
                className="text-green-400 hover:text-green-300 text-xl flex-shrink-0" title="Voice message">
                <BsMicFill />
              </button>
            )}

            {(message.trim() || imageFile) && (
              <button type="submit"
                disabled={isAbuse || loading || !!imageError || imageScanning}
                title={
                  imageScanning ? "Image scan ho rahi hai..." :
                  isAbuse ? "Blocked" :
                  imageError ? "Image blocked" : "Send"
                }
                className={`flex-shrink-0 rounded-full w-10 h-10 flex items-center justify-center transition-all
                  ${isAbuse || imageError
                    ? "bg-red-700/50 cursor-not-allowed opacity-50"
                    : imageScanning
                    ? "bg-yellow-600/70 cursor-wait"
                    : loading
                    ? "bg-gray-600 cursor-wait opacity-60"
                    : "bg-teal-500 hover:bg-teal-400 shadow-lg"
                  }`}>
                {imageScanning
                  ? <div className="w-4 h-4 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
                  : loading
                  ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <IoSend className="text-white" />
                }
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default Typesend;