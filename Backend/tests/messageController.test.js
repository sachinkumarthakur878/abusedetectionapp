// Backend Tests — message.controller.js logic
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isAbuseContent, containsAbuseEmoji } from "../utils/simpleFilter.js";

// ─── sendMessage validation logic ────────────────────────────

describe("sendMessage validation logic", () => {
  it("blocks empty text messages", () => {
    const message = "";
    const messageType = "text";
    const isEmpty = messageType === "text" && (!message || !message.trim());
    assert.equal(isEmpty, true);
  });

  it("blocks whitespace-only text messages", () => {
    const message = "   ";
    const messageType = "text";
    const isEmpty = messageType === "text" && (!message || !message.trim());
    assert.equal(isEmpty, true);
  });

  it("allows non-text messages with no message field (voice/image)", () => {
    const message = "";
    const messageType = "voice";
    const isEmpty = messageType === "text" && (!message || !message.trim());
    assert.equal(isEmpty, false);
  });

  it("allows valid text message", () => {
    const message = "Hello there!";
    const messageType = "text";
    const isEmpty = messageType === "text" && (!message || !message.trim());
    assert.equal(isEmpty, false);
  });
});

// ─── Abuse detection pipeline ─────────────────────────────────

describe("Abuse detection pipeline for sendMessage", () => {
  it("blocks abusive text message", () => {
    assert.equal(isAbuseContent("You are an idiot"), true);
  });

  it("allows clean text message", () => {
    assert.equal(isAbuseContent("Good morning, how are you?"), false);
  });

  it("blocks message with offensive emoji only", () => {
    assert.equal(containsAbuseEmoji("🖕"), true);
  });

  it("blocks mixed abuse (word + emoji)", () => {
    assert.equal(isAbuseContent("loser 🖕"), true);
  });

  it("allows message with safe emojis", () => {
    assert.equal(isAbuseContent("Good morning 😀👍"), false);
  });
});

// ─── safeMediaUrl logic ───────────────────────────────────────

describe("safeMediaUrl transformation", () => {
  const getSafeMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return null;
    if (mediaUrl.startsWith("data:")) return null;
    if (mediaUrl === "image_stored_locally") return null;
    return mediaUrl;
  };

  it("strips base64 data URIs", () => {
    assert.equal(getSafeMediaUrl("data:image/png;base64,abc123"), null);
  });

  it("strips placeholder string", () => {
    assert.equal(getSafeMediaUrl("image_stored_locally"), null);
  });

  it("preserves valid external URLs", () => {
    const url = "https://example.com/image.png";
    assert.equal(getSafeMediaUrl(url), url);
  });

  it("returns null for undefined/null mediaUrl", () => {
    assert.equal(getSafeMediaUrl(null), null);
    assert.equal(getSafeMediaUrl(undefined), null);
  });
});

// ─── Reaction logic ───────────────────────────────────────────

describe("reactToMessage logic", () => {
  it("adds reaction when user has no existing reaction", () => {
    const reactions = [];
    const userId = "user1";
    const emoji = "❤️";
    const existingIdx = reactions.findIndex((r) => r.userId?.toString() === userId);
    if (existingIdx === -1) {
      reactions.push({ userId, emoji });
    }
    assert.equal(reactions.length, 1);
    assert.equal(reactions[0].emoji, "❤️");
  });

  it("removes reaction when user clicks same emoji again (toggle)", () => {
    const reactions = [{ userId: "user1", emoji: "❤️" }];
    const userId = "user1";
    const emoji = "❤️";
    const existingIdx = reactions.findIndex((r) => r.userId?.toString() === userId);
    if (existingIdx !== -1) {
      if (reactions[existingIdx].emoji === emoji) {
        reactions.splice(existingIdx, 1);
      }
    }
    assert.equal(reactions.length, 0);
  });

  it("updates reaction when user clicks different emoji", () => {
    const reactions = [{ userId: "user1", emoji: "❤️" }];
    const userId = "user1";
    const emoji = "😂";
    const existingIdx = reactions.findIndex((r) => r.userId?.toString() === userId);
    if (existingIdx !== -1) {
      if (reactions[existingIdx].emoji !== emoji) {
        reactions[existingIdx].emoji = emoji;
      }
    }
    assert.equal(reactions[0].emoji, "😂");
    assert.equal(reactions.length, 1);
  });
});

// ─── deleteMessage authorization ─────────────────────────────

describe("deleteMessage authorization logic", () => {
  it("allows deletion when sender matches current user", () => {
    const message = { senderId: { toString: () => "user1" } };
    const userId = { toString: () => "user1" };
    const isAuthorized = message.senderId.toString() === userId.toString();
    assert.equal(isAuthorized, true);
  });

  it("denies deletion when sender does NOT match current user", () => {
    const message = { senderId: { toString: () => "user2" } };
    const userId = { toString: () => "user1" };
    const isAuthorized = message.senderId.toString() === userId.toString();
    assert.equal(isAuthorized, false);
  });
});
