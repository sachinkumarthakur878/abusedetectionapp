// ============================================================
// ABUSE FILTER - Text, Emoji & Media
// FIX: Deduplicated the abuseWords array (Typesend.jsx had duplicates too)
// FIX: Exported consistent API used by both backend and aligned with frontend
// ============================================================

export const abuseWords = [
  "bsdk","bhosdike","bhosadi-ke","bhosadike","bhosdiwale","bhosdiwali",
  "bhosdi","bhosad","bhosd","madarchod","madarchodi","maderchod",
  "madarjaat","madar","madarchood","mc","m.c.","m*c",
  "m@c","bc","benchod","behenchod","bhenchod","bhenchodiya",
  "chutiya","chutiye","chut","chutad","chutmarike","choot",
  "chootiya","gandu","gaandu","gaand","gand","gaandmara",
  "harami","haramzada","haramzadi","haramkhor","kamina","kamini",
  "kamine","saala","saale","sala","sale","kutte",
  "kutta","kutti","ullu","ullukapattha","nalayak","nawakoof",
  "bewakoof","bewakuf","pagal","paagal","pagla","pagli",
  "jhatu","jhaatu","jhaat","jhaatke","lavde","lavdya",
  "lawde","laude","lodu","lodhu","lund","laund",
  "land","chod","chodu","chodna","chudna","chud",
  "bhadwa","bhadwe","bhadwagiri","randi","randibaaz","randwa",
  "rakhel","hijra","hijar","chakka","chakke","suar",
  "suwar","gadha","gadhe","bakwas","bakwaas","baklol",
  "bakloal","bklol","maaki","terimaa","teribehen","tatti",
  "tattu","moot","mootna","peshaab","peshab","hagana",
  "haagna","hagna","jhavle","jhavli","idiot","stupid",
  "moron","loser","jerk","trash","scumbag","bastard",
  "shit","shitt","shiit","bullshit","fuck","fucker",
  "fucking","fucked","fuckoff","fuckup","fukk","fuckyu",
  "fuckyou","asshole","ass hole","ashole","ahole","dumb",
  "retard","clown","weirdo","psycho","lunatic","garbage",
  "filth","noob","crybaby","dramaqueen","pig","snake",
  "dirty","fake","bloody","dog","bitch","biatch",
  "bytch","useless","fool","liar","fraud",
];


// FIX: Removed ambiguous emojis (😡, 👊, 🤮) that have legitimate uses
export const abuseEmojis = [
  "🖕","🖕🏻","🖕🏼","🖕🏽","🖕🏾","🖕🏿", // middle finger
  "🍆","🍑","💦","🍌","👅","🫦",          // sexual innuendo
  "💩","👹","👺",                          // offensive
  "🔪","🗡️","⚔️","🔫","💣","🧨","💥",   // weapons/violence
  "🤬",                                    // rage
];

// FIX: Normalize more aggressively — replace leet-speak digits before checking
const normalizeLeet = (text) =>
  text
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/8/g, "b")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/!/g, "i")
    .replace(/\*/g, "");

export const containsSimpleAbuse = (text) => {
  if (!text) return false;
  // FIX: Apply leet-speak normalization before checking
  const normalized = normalizeLeet(text.toLowerCase()).replace(/\s+/g, "");
  return abuseWords.some((word) => normalized.includes(word.replace(/\s+/g, "")));
};

export const containsAbuseEmoji = (text) => {
  if (!text) return false;
  return abuseEmojis.some((emoji) => text.includes(emoji));
};

// Combined check for text
export const isAbuseContent = (text) => {
  return containsSimpleAbuse(text) || containsAbuseEmoji(text);
};
