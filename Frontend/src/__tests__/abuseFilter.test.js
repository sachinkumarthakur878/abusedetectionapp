// Frontend Unit Tests — Typesend.jsx abuse detection (extracted logic)
// Framework: Vitest
// Run: cd Frontend && npm test

import { describe, it, expect } from "vitest";

// ─── Replicate the frontend checkAbuse function ───────────────
const abuseWords = [
  "bsdk","madarchod","mc","bc","benchod","chutiya","gandu","harami","kamina",
  "saala","kutte","ullu","nalayak","bewakoof","pagal","idiot","stupid","moron",
  "loser","jerk","trash","bastard","shit","fuck","fucker","asshole","bitch",
  "randi","lund","chod","tatti","jhatu","lavde",
];

const abuseEmojis = ["🖕","🖕🏻","🖕🏼","🖕🏽","🖕🏾","🖕🏿","🍆","🍑","💦","🔪","🗡️","⚔️","🔫","💣","🧨","🤬"];

const checkAbuse = (text) => {
  if (!text) return { abuse: false };
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
  const noSpace = normalized.replace(/\s/g, "");
  const words = normalized.split(" ");
  const foundWord = abuseWords.find((w) => {
    const wClean = w.replace(/\s+/g, "");
    return noSpace.includes(wClean) || words.some((tw) => tw.includes(wClean));
  });
  const foundEmoji = abuseEmojis.find((e) => text.includes(e));
  if (foundWord || foundEmoji) return { abuse: true, found: foundWord || foundEmoji };
  return { abuse: false };
};

// ─── Tests ────────────────────────────────────────────────────

describe("Frontend checkAbuse function", () => {
  // Happy path
  it("returns no abuse for clean message", () => {
    expect(checkAbuse("Hello, how are you?")).toEqual({ abuse: false });
  });

  it("returns no abuse for empty string", () => {
    expect(checkAbuse("")).toEqual({ abuse: false });
  });

  it("returns no abuse for null", () => {
    expect(checkAbuse(null)).toEqual({ abuse: false });
  });

  it("returns no abuse for undefined", () => {
    expect(checkAbuse(undefined)).toEqual({ abuse: false });
  });

  // Text abuse detection
  it("detects 'idiot' as abuse", () => {
    const result = checkAbuse("You are such an idiot!");
    expect(result.abuse).toBe(true);
    expect(result.found).toBe("idiot");
  });

  it("detects 'fuck' as abuse (case-insensitive)", () => {
    const result = checkAbuse("FUCK this!");
    expect(result.abuse).toBe(true);
  });

  it("detects 'bsdk' (Hindi abuse)", () => {
    const result = checkAbuse("bsdk");
    expect(result.abuse).toBe(true);
  });

  it("detects abuse embedded in a longer sentence", () => {
    const result = checkAbuse("What a stupid idea you have");
    expect(result.abuse).toBe(true);
  });

  // Emoji abuse detection
  it("detects middle finger emoji", () => {
    const result = checkAbuse("Hello 🖕");
    expect(result.abuse).toBe(true);
    expect(result.found).toBe("🖕");
  });

  it("detects gun emoji", () => {
    const result = checkAbuse("watch out 🔫");
    expect(result.abuse).toBe(true);
  });

  it("does not flag safe emojis", () => {
    const result = checkAbuse("Great job 😀 👍 ❤️");
    expect(result.abuse).toBe(false);
  });

  // Edge cases
  it("handles message with only whitespace", () => {
    const result = checkAbuse("   ");
    expect(result.abuse).toBe(false);
  });

  it("handles very long clean message without false positive", () => {
    const longMsg = "This is a completely clean and normal message. ".repeat(100);
    expect(checkAbuse(longMsg).abuse).toBe(false);
  });

  it("handles message with numbers and symbols only", () => {
    expect(checkAbuse("1234567890!@#$%^&*()").abuse).toBe(false);
  });
});

// ─── OTP input handler logic ──────────────────────────────────

describe("OTP input handler logic", () => {
  it("only accepts digits (0-9)", () => {
    const isDigit = (value) => /^\d*$/.test(value);
    expect(isDigit("1")).toBe(true);
    expect(isDigit("9")).toBe(true);
    expect(isDigit("")).toBe(true); // empty allowed (backspace)
    expect(isDigit("a")).toBe(false);
    expect(isDigit("!")).toBe(false);
  });

  it("handles OTP paste: 6 digits extracted correctly", () => {
    const pastedText = "  123456  ";
    const cleaned = pastedText.replace(/\D/g, "").slice(0, 6);
    expect(cleaned).toBe("123456");
    expect(cleaned.length).toBe(6);
  });

  it("handles OTP paste with non-digits stripped", () => {
    const pastedText = "12-34-56";
    const cleaned = pastedText.replace(/\D/g, "").slice(0, 6);
    expect(cleaned).toBe("123456");
  });

  it("OTP paste is capped at 6 characters", () => {
    const pastedText = "1234567890";
    const cleaned = pastedText.replace(/\D/g, "").slice(0, 6);
    expect(cleaned).toBe("123456");
    expect(cleaned.length).toBe(6);
  });

  it("joins 6-digit OTP array into string", () => {
    const otpArray = ["1", "2", "3", "4", "5", "6"];
    const joined = otpArray.join("");
    expect(joined).toBe("123456");
    expect(joined.length).toBe(6);
  });

  it("incomplete OTP join produces short string", () => {
    const otpArray = ["1", "2", "", "", "", ""];
    const joined = otpArray.join("");
    expect(joined.length).toBeLessThan(6);
  });
});

// ─── Time formatting ──────────────────────────────────────────

describe("Time formatting for OTP timer", () => {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  it("formats 600 seconds as 10:00", () => {
    expect(formatTime(600)).toBe("10:00");
  });

  it("formats 0 seconds as 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("formats 59 seconds as 00:59", () => {
    expect(formatTime(59)).toBe("00:59");
  });

  it("formats 61 seconds as 01:01", () => {
    expect(formatTime(61)).toBe("01:01");
  });

  it("formats 125 seconds as 02:05", () => {
    expect(formatTime(125)).toBe("02:05");
  });
});
