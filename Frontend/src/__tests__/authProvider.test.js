// Frontend Unit Tests — AuthProvider & localStorage parsing
// Framework: Vitest

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ─── Replicate the AuthProvider's parsing logic ───────────────
const parseAuthUser = (storedString) => {
  try {
    if (!storedString) return undefined;
    const parsed = JSON.parse(storedString);
    if (parsed?._id) return parsed;
    if (parsed?.user?._id) {
      return {
        _id: parsed.user._id,
        fullname: parsed.user.fullname,
        email: parsed.user.email,
        token: parsed.token,
      };
    }
    return undefined;
  } catch {
    return undefined;
  }
};

// ─── Auth parsing tests ───────────────────────────────────────

describe("AuthProvider localStorage parsing", () => {
  it("returns undefined for null/empty stored value", () => {
    expect(parseAuthUser(null)).toBeUndefined();
    expect(parseAuthUser("")).toBeUndefined();
  });

  it("returns undefined for invalid JSON", () => {
    expect(parseAuthUser("{not valid json")).toBeUndefined();
  });

  it("handles new flat format { _id, fullname, email, token }", () => {
    const userData = { _id: "u1", fullname: "Alice", email: "a@a.com", token: "tok1" };
    const result = parseAuthUser(JSON.stringify(userData));
    expect(result._id).toBe("u1");
    expect(result.fullname).toBe("Alice");
    expect(result.token).toBe("tok1");
  });

  it("handles old nested format { token, user: { _id, fullname, email } }", () => {
    const userData = {
      token: "tok1",
      user: { _id: "u1", fullname: "Alice", email: "a@a.com" },
    };
    const result = parseAuthUser(JSON.stringify(userData));
    expect(result._id).toBe("u1");
    expect(result.fullname).toBe("Alice");
    expect(result.token).toBe("tok1");
  });

  it("returns undefined for object with no _id at any level", () => {
    const noId = { name: "test", token: "tok" };
    const result = parseAuthUser(JSON.stringify(noId));
    expect(result).toBeUndefined();
  });

  it("returns undefined for array stored in localStorage", () => {
    const arr = [1, 2, 3];
    const result = parseAuthUser(JSON.stringify(arr));
    expect(result).toBeUndefined();
  });
});

// ─── Login response normalization (Login.jsx logic) ───────────

describe("Login response → localStorage normalization", () => {
  const normalizeLoginResponse = (response) => ({
    _id: response.user._id,
    fullname: response.user.fullname,
    email: response.user.email,
    token: response.token,
  });

  it("correctly flattens login API response", () => {
    const apiResponse = {
      message: "User logged in successfully",
      token: "jwt-token-here",
      user: { _id: "u123", fullname: "Bob", email: "bob@example.com" },
    };
    const normalized = normalizeLoginResponse(apiResponse);
    expect(normalized._id).toBe("u123");
    expect(normalized.fullname).toBe("Bob");
    expect(normalized.email).toBe("bob@example.com");
    expect(normalized.token).toBe("jwt-token-here");
    expect(normalized.message).toBeUndefined(); // no extra fields
  });
});

// ─── Token extraction helper (useSendMessage.js) ──────────────

describe("getAuthToken helper", () => {
  const getAuthToken = (storedString) => {
    try {
      return storedString ? JSON.parse(storedString)?.token : null;
    } catch {
      return null;
    }
  };

  it("extracts token from valid stored data", () => {
    const stored = JSON.stringify({ _id: "u1", token: "my-token" });
    expect(getAuthToken(stored)).toBe("my-token");
  });

  it("returns null for null/empty input", () => {
    expect(getAuthToken(null)).toBeNull();
    expect(getAuthToken("")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(getAuthToken("{bad json")).toBeNull();
  });

  it("returns null if no token field", () => {
    const stored = JSON.stringify({ _id: "u1", fullname: "Alice" });
    expect(getAuthToken(stored)).toBeNull();
  });
});
