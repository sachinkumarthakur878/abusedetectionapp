// Frontend Unit Tests — useConversation Zustand store
// Framework: Vitest (already configured via vite)
// Run: cd Frontend && npm test (after adding vitest to package.json)

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useConversation from "../zustand/useConversation.js";

describe("useConversation store", () => {
  beforeEach(() => {
    // Reset store before each test
    useConversation.setState({
      selectedConversation: null,
      messages: [],
      typingUsers: [],
    });
  });

  it("initial state has null selectedConversation", () => {
    const { result } = renderHook(() => useConversation());
    expect(result.current.selectedConversation).toBeNull();
  });

  it("initial state has empty messages array", () => {
    const { result } = renderHook(() => useConversation());
    expect(result.current.messages).toEqual([]);
  });

  it("setSelectedConversation updates the conversation", () => {
    const { result } = renderHook(() => useConversation());
    const fakeUser = { _id: "abc123", fullname: "Alice" };
    act(() => {
      result.current.setSelectedConversation(fakeUser);
    });
    expect(result.current.selectedConversation).toEqual(fakeUser);
  });

  it("setMessage with array replaces messages", () => {
    const { result } = renderHook(() => useConversation());
    const msgs = [{ _id: "m1", message: "Hello" }, { _id: "m2", message: "World" }];
    act(() => {
      result.current.setMessage(msgs);
    });
    expect(result.current.messages).toEqual(msgs);
  });

  it("setMessage with updater function appends messages", () => {
    const { result } = renderHook(() => useConversation());
    const existing = [{ _id: "m1", message: "First" }];
    act(() => {
      result.current.setMessage(existing);
    });
    const newMsg = { _id: "m2", message: "Second" };
    act(() => {
      result.current.setMessage((prev) => [...prev, newMsg]);
    });
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].message).toBe("Second");
  });

  it("setTypingUsers with function updater works", () => {
    const { result } = renderHook(() => useConversation());
    act(() => {
      result.current.setTypingUsers((prev) => [...prev, "user1"]);
    });
    expect(result.current.typingUsers).toContain("user1");
  });

  it("setTypingUsers with array replaces typing users", () => {
    const { result } = renderHook(() => useConversation());
    act(() => {
      result.current.setTypingUsers(["user1", "user2"]);
    });
    expect(result.current.typingUsers).toEqual(["user1", "user2"]);
  });
});
