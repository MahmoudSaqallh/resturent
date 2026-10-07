"use client";

import { useEffect, useState } from "react";

/**
 * Turns true only after `flag` has stayed true for `delay` ms, and false at
 * once. Keeps fast loads from flashing a skeleton (loaders: 100ms rule).
 */
export function useDelayedFlag(flag: boolean, delay = 120) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!flag) return;
    const timer = setTimeout(() => setShown(true), delay);
    return () => {
      clearTimeout(timer);
      setShown(false);
    };
  }, [flag, delay]);
  return flag && shown;
}
