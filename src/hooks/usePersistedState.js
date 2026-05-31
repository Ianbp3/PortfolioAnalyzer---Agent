import { useState, useEffect } from "react";

/**
 * Drop-in replacement for useState that automatically saves the value to
 * localStorage and restores it on reload. The data lives only in the user's
 * own browser. It is never sent to a server.
 *
 * @param {string} key      Unique localStorage key (e.g. "foliosense_positions")
 * @param {*}      initial   Value used the first time, before anything is saved
 * @returns {[value, setValue]} Same signature as useState
 */
export function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initial;
    } catch {
      // Corrupt JSON or private-mode storage blocked: fall back to initial
      return initial;
    }
  });

  useEffect(() => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Storage full or unavailable: ignore, app keeps working in-memory
    }
  }, [key, value]);

  return [value, setValue];
}
