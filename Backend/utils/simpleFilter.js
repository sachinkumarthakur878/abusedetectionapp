// ============================================================
// ABUSE FILTER - Text, Emoji & Media
// ============================================================

export const abuseWords = [
  "bsdk","bhosdike","bhosadi-ke","b*h*sdike","b*sdk","bhos@dike","bh0sdike","bhosd1ke",
  "madarchod","m@darchod","m*darchod","mad*rchod","mc","m.c.","m*c","m@c",
  "chutiya","ch*tiya","chut!ya","c#utiya","chutiy@","chutiyaa","chut1ya","c****ya",
  "gandu","g@ndu","g*ndu","ganduu","gaand","g@and","g*and","ga@nd",
  "harami","h@rami","har@mi","h*r*mi","kamina","k@mina","kam!na","k*m*na",
  "saala","s@ala","sa@la","s*ala","kutte","kutt3","k*tte","kut@te",
  "ullu","ull@u","u*llu","ulllu","nalayak","nal@y@k","n*l*y*k","nal@yak",
  "bewakoof","bew@koof","b*w*koof","bewak0of","pagal","p@g@l","p*gal","pag@l",
  "idiot","!diot","id!ot","1diot","stupid","stu*id","stup!d","stup1d",
  "moron","m0ron","m*ron","mor@n","loser","l0ser","l*s*r","lo@ser",
  "jerk","j*rk","jer@k","j3rk","trash","tr@sh","t*r*sh","tra$h",
  "scumbag","sc*m*ag","scumb@g","scum8ag","bastard","b@stard","b*st*rd","bast@rd",
  "bloody","bl**dy","bl0ody","blo@dy","shit","sh*t","$hit","sh1t",
  "fuck","f*ck","f**k","fu@k","fucker","f*cker","f**ker","fu@cker",
  "asshole","a**hole","assh*le","a$$hole","dumb","d*mb","du@mb","dumb@",
  "retard","r*tard","ret@rd","re7ard","clown","cl@wn","cl*wn","cl0wn",
  "useless","use*ess","us3less","us@less","fool","f**l","fo0l","fo@l",
  "pig","p!g","p*g","pi9","dog","d0g","d*g","do9","snake","sn@ke","sn*ke","sna9e",
  "liar","l!ar","l*ar","li@r","fraud","fr@ud","fr*ud","fra9d",
  "fake","f@ke","f*ke","fa9e","dirty","d!rty","d*rty","dir7y",
  "psycho","ps*cho","psy@cho","psy9ho","lunatic","lun@tic","lun*tic","luna7ic",
  "garbage","g@rbage","garb*ge","garba9e","filth","f!lth","f*lth","fil7h",
  "noob","n00b","n*ob","no@b","crybaby","cryb@by","cryb*by","cryba9y",
  "weirdo","we!rdo","w*irdo","weir9o","dramaqueen","dram@queen","dramaqu*en",
  "randi","r@ndi","rand1","r*ndi","bitch","b1tch","b!tch","b*tch",
  "sala","s@l@","saale","s@@le","haramzada","haramzadi","haramkhor",
  "bakwas","b@kwas","bakwaas","jhatu","jh@tu","lavde","l@vde","lund","l*nd",
  "chod","ch0d","chodu","ch0du","bhadwa","bh@dwa","rakhel","madar","tere","teri"
];

// 🚫 Abuse Emojis (sexual/violent/offensive)
export const abuseEmojis = [
  "🖕","🖕🏻","🖕🏼","🖕🏽","🖕🏾","🖕🏿", // middle finger
  "🍆","🍑","💦","🍌","🥕","👅","🫦", // sexual innuendo
  "💩","🤮","🤢","👹","👺","💀","☠️",  // offensive/aggressive
  "🔪","🗡️","⚔️","🔫","💣","🧨","💥",  // weapons/violence
  "🤬","😡","👊","✊","🖐", // anger/aggression
];

export const containsSimpleAbuse = (text) => {
  if (!text) return false;
  const normalizedText = text.toLowerCase().replace(/\s+/g, "");
  return abuseWords.some(word => normalizedText.includes(word));
};

export const containsAbuseEmoji = (text) => {
  if (!text) return false;
  return abuseEmojis.some(emoji => text.includes(emoji));
};

// Combined check for text
export const isAbuseContent = (text) => {
  return containsSimpleAbuse(text) || containsAbuseEmoji(text);
};
