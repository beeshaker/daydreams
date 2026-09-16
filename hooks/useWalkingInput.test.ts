import { describe, expect, it, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { isTypingTarget, useWalkingInput } from "./useWalkingInput";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("isTypingTarget", () => {
  it("returns true for input, textarea, select, and contenteditable elements", () => {
    expect(isTypingTarget(document.createElement("input"))).toBe(true);
    expect(isTypingTarget(document.createElement("textarea"))).toBe(true);
    expect(isTypingTarget(document.createElement("select"))).toBe(true);

    const editable = document.createElement("div");
    Object.defineProperty(editable, "isContentEditable", { value: true });
    expect(isTypingTarget(editable)).toBe(true);
  });

  it("returns false for non-typing elements and null", () => {
    expect(isTypingTarget(document.createElement("div"))).toBe(false);
    expect(isTypingTarget(document.body)).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});

describe("useWalkingInput", () => {
  it("ignores WASD keydown/keyup dispatched from a text input and does not preventDefault", () => {
    const { result } = renderHook(() => useWalkingInput());

    const input = document.createElement("input");
    document.body.appendChild(input);

    const downEvent = new KeyboardEvent("keydown", { key: "w", bubbles: true, cancelable: true });
    Object.defineProperty(downEvent, "target", { value: input, configurable: true });
    input.dispatchEvent(downEvent);

    expect(result.current.inputRef.current).toEqual({ x: 0, z: 0 });
    expect(downEvent.defaultPrevented).toBe(false);
  });

  it("handles WASD keydown/keyup dispatched from document.body normally", () => {
    const { result } = renderHook(() => useWalkingInput());

    const downEvent = new KeyboardEvent("keydown", { key: "w", bubbles: true, cancelable: true });
    Object.defineProperty(downEvent, "target", { value: document.body, configurable: true });
    document.body.dispatchEvent(downEvent);

    expect(result.current.inputRef.current).toEqual({ x: 0, z: -1 });
    expect(downEvent.defaultPrevented).toBe(true);

    const upEvent = new KeyboardEvent("keyup", { key: "w", bubbles: true, cancelable: true });
    Object.defineProperty(upEvent, "target", { value: document.body, configurable: true });
    document.body.dispatchEvent(upEvent);

    expect(result.current.inputRef.current).toEqual({ x: 0, z: 0 });
  });
});
