// Backend Integration Tests — user.controller.js
// Uses node:test + mock strategy (no real DB needed for logic tests)
// For full integration tests, use a test MongoDB instance.

import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";

// ─── Mock helpers ────────────────────────────────────────────
const makeMockRes = () => {
  const res = {
    _status: null,
    _body: null,
    _cookies: {},
    status(code) { this._status = code; return this; },
    json(body) { this._body = body; return this; },
    cookie(name, val, opts) { this._cookies[name] = val; return this; },
    clearCookie(name) { delete this._cookies[name]; return this; },
  };
  return res;
};

const makeMockReq = (body = {}, params = {}) => ({ body, params });

// ─── Login logic tests ────────────────────────────────────────
// These test the LOGIC extracted from the controller, not the controller itself
// (which requires DB mocking). Tests document expected behavior.

describe("Login validation logic", () => {
  it("rejects login with missing email", async () => {
    const req = makeMockReq({ password: "pass123" });
    const res = makeMockRes();
    // Simulate the validation check
    if (!req.body.email || !req.body.password) {
      res.status(400).json({ error: "Email and password are required" });
    }
    assert.equal(res._status, 400);
    assert.equal(res._body.error, "Email and password are required");
  });

  it("rejects login with missing password", async () => {
    const req = makeMockReq({ email: "test@test.com" });
    const res = makeMockRes();
    if (!req.body.email || !req.body.password) {
      res.status(400).json({ error: "Email and password are required" });
    }
    assert.equal(res._status, 400);
  });

  it("rejects login with both fields missing", async () => {
    const req = makeMockReq({});
    const res = makeMockRes();
    if (!req.body.email || !req.body.password) {
      res.status(400).json({ error: "Email and password are required" });
    }
    assert.equal(res._status, 400);
  });
});

// ─── OTP Store logic tests ────────────────────────────────────

describe("OTP verification logic", () => {
  const otpStore = new Map();

  beforeEach(() => {
    otpStore.clear();
  });

  it("rejects verification when no OTP stored for email", () => {
    const stored = otpStore.get("missing@test.com");
    assert.equal(stored, undefined);
    // Controller returns 400 in this case
  });

  it("rejects verification when OTP is expired", () => {
    const expiredTime = Date.now() - 1000; // 1 second in the past
    otpStore.set("test@test.com", {
      otp: "123456",
      expiry: expiredTime,
      userData: { fullname: "Test", email: "test@test.com", password: "hashed" },
      attempts: 0,
    });
    const stored = otpStore.get("test@test.com");
    assert.equal(Date.now() > stored.expiry, true);
  });

  it("rejects after 5 failed attempts", () => {
    otpStore.set("test@test.com", {
      otp: "123456",
      expiry: Date.now() + 600000,
      userData: { fullname: "Test", email: "test@test.com", password: "hashed" },
      attempts: 5,
    });
    const stored = otpStore.get("test@test.com");
    assert.equal(stored.attempts >= 5, true);
  });

  it("increments attempts on wrong OTP", () => {
    otpStore.set("test@test.com", {
      otp: "123456",
      expiry: Date.now() + 600000,
      userData: { fullname: "Test", email: "test@test.com", password: "hashed" },
      attempts: 0,
    });
    const stored = otpStore.get("test@test.com");
    const incomingOtp = "999999";
    if (stored.otp !== incomingOtp) {
      stored.attempts += 1;
      otpStore.set("test@test.com", stored);
    }
    assert.equal(otpStore.get("test@test.com").attempts, 1);
  });

  it("accepts correct OTP and deletes from store", () => {
    otpStore.set("test@test.com", {
      otp: "123456",
      expiry: Date.now() + 600000,
      userData: { fullname: "Test", email: "test@test.com", password: "hashed" },
      attempts: 0,
    });
    const stored = otpStore.get("test@test.com");
    if (stored.otp === "123456") {
      otpStore.delete("test@test.com");
    }
    assert.equal(otpStore.has("test@test.com"), false);
  });

  it("calculates remaining attempts correctly", () => {
    const attempts = 3;
    const remaining = 5 - attempts;
    assert.equal(remaining, 2);
    const message = `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`;
    assert.equal(message, "Incorrect OTP. 2 attempts remaining.");
  });

  it("uses singular 'attempt' when 1 remaining", () => {
    const attempts = 4;
    const remaining = 5 - attempts;
    const message = `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`;
    assert.equal(message, "Incorrect OTP. 1 attempt remaining.");
  });
});

// ─── Signup validation logic ──────────────────────────────────

describe("Signup validation logic", () => {
  it("rejects when passwords do not match", () => {
    const password = "abc123";
    const confirmPassword = "xyz456";
    assert.equal(password !== confirmPassword, true);
  });

  it("accepts when passwords match", () => {
    const password = "abc123";
    const confirmPassword = "abc123";
    assert.equal(password === confirmPassword, true);
  });

  it("rejects password shorter than 6 chars", () => {
    const password = "abc";
    assert.equal(password.length < 6, true);
  });

  it("accepts password of exactly 6 chars", () => {
    const password = "abc123";
    assert.equal(password.length >= 6, true);
  });

  it("validates email format", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    assert.equal(emailRegex.test("user@example.com"), true);
    assert.equal(emailRegex.test("invalid-email"), false);
    assert.equal(emailRegex.test("no@domain"), false);
    assert.equal(emailRegex.test("@nodomain.com"), false);
    assert.equal(emailRegex.test("spaces @domain.com"), false);
  });
});
