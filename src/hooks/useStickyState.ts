import { useState, useEffect } from "react";

export function useStickyState<T>(key: string, defaultVal: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [val, setVal] = useState<T>(() => {
    try {
      const stickyVal = window.localStorage.getItem(key);
      return stickyVal !== null ? (JSON.parse(stickyVal) as T) : defaultVal;
    } catch {
      return defaultVal;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(val));
  }, [key, val]);

  return [val, setVal];
}

