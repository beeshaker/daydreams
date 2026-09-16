import { describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { createRef } from "react";
import { useFocusTrap } from "./useFocusTrap";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function buildContainer() {
  const container = document.createElement("div");
  container.innerHTML = `
    <button id="first">First</button>
    <button id="middle">Middle</button>
    <button id="last">Last</button>
  `;
  document.body.appendChild(container);
  return container;
}

function press(key: string, options: { shiftKey?: boolean } = {}) {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    shiftKey: options.shiftKey ?? false,
  });
  document.dispatchEvent(event);
  return event;
}

describe("useFocusTrap", () => {
  it("wraps Tab from the last focusable element to the first", () => {
    const container = buildContainer();
    const containerRef = createRef<HTMLElement>();
    containerRef.current = container;
    const onEscape = vi.fn();

    renderHook(() => useFocusTrap({ active: true, containerRef, onEscape }));

    const last = container.querySelector<HTMLElement>("#last")!;
    const first = container.querySelector<HTMLElement>("#first")!;
    last.focus();
    expect(document.activeElement).toBe(last);

    press("Tab");

    expect(document.activeElement).toBe(first);
  });

  it("wraps Shift+Tab from the first focusable element to the last", () => {
    const container = buildContainer();
    const containerRef = createRef<HTMLElement>();
    containerRef.current = container;
    const onEscape = vi.fn();

    renderHook(() => useFocusTrap({ active: true, containerRef, onEscape }));

    const first = container.querySelector<HTMLElement>("#first")!;
    const last = container.querySelector<HTMLElement>("#last")!;
    first.focus();
    expect(document.activeElement).toBe(first);

    press("Tab", { shiftKey: true });

    expect(document.activeElement).toBe(last);
  });

  it("invokes onEscape when Escape is pressed", () => {
    const container = buildContainer();
    const containerRef = createRef<HTMLElement>();
    containerRef.current = container;
    const onEscape = vi.fn();

    renderHook(() => useFocusTrap({ active: true, containerRef, onEscape }));

    press("Escape");

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("restores focus to the previously focused element when it becomes inactive", () => {
    const container = buildContainer();
    const containerRef = createRef<HTMLElement>();
    containerRef.current = container;
    const onEscape = vi.fn();

    const trigger = document.createElement("button");
    trigger.id = "trigger";
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { rerender } = renderHook(
      ({ active }) => useFocusTrap({ active, containerRef, onEscape }),
      { initialProps: { active: true } },
    );

    // Focus should have moved into the container's first focusable element.
    expect(document.activeElement).toBe(container.querySelector("#first"));

    rerender({ active: false });

    expect(document.activeElement).toBe(trigger);
  });
});
