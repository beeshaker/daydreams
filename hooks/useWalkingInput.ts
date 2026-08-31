"use client";

import { useCallback, useEffect, useRef } from "react";

export type WalkingInput = { x: number; z: number };

const FORWARD_KEYS = new Set(["arrowup", "w"]);
const BACKWARD_KEYS = new Set(["arrowdown", "s"]);
const LEFT_KEYS = new Set(["arrowleft", "a"]);
const RIGHT_KEYS = new Set(["arrowright", "d"]);

/**
 * A 2D move-direction vector (x, z each in [-1, 1], not normalized here —
 * the character controller normalizes) instead of a driving throttle/steer
 * pair. A ref, not state, since the character controller reads it every
 * animation frame.
 */
export function useWalkingInput() {
  const inputRef = useRef<WalkingInput>({ x: 0, z: 0 });
  const keysRef = useRef({ forward: false, backward: false, left: false, right: false });
  const joystickActiveRef = useRef(false);

  useEffect(() => {
    function applyKeyState() {
      if (joystickActiveRef.current) return;
      const keys = keysRef.current;
      inputRef.current = {
        x: (keys.right ? 1 : 0) - (keys.left ? 1 : 0),
        z: (keys.backward ? 1 : 0) - (keys.forward ? 1 : 0),
      };
    }

    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const keys = keysRef.current;
      if (FORWARD_KEYS.has(key)) keys.forward = true;
      else if (BACKWARD_KEYS.has(key)) keys.backward = true;
      else if (LEFT_KEYS.has(key)) keys.left = true;
      else if (RIGHT_KEYS.has(key)) keys.right = true;
      else return;
      event.preventDefault();
      applyKeyState();
    }

    function handleKeyUp(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const keys = keysRef.current;
      if (FORWARD_KEYS.has(key)) keys.forward = false;
      else if (BACKWARD_KEYS.has(key)) keys.backward = false;
      else if (LEFT_KEYS.has(key)) keys.left = false;
      else if (RIGHT_KEYS.has(key)) keys.right = false;
      else return;
      applyKeyState();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  /** Called by the on-screen joystick while active; takes over from keyboard input. */
  const setJoystickVector = useCallback((x: number, z: number) => {
    joystickActiveRef.current = true;
    inputRef.current = { x: Math.max(-1, Math.min(1, x)), z: Math.max(-1, Math.min(1, z)) };
  }, []);

  const releaseJoystick = useCallback(() => {
    joystickActiveRef.current = false;
    inputRef.current = { x: 0, z: 0 };
  }, []);

  return { inputRef, setJoystickVector, releaseJoystick };
}
