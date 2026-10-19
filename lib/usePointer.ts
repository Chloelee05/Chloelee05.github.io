"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

type P = { x: number; y: number };
const shared: P = { x: 0, y: 0 };
let bound = false;

/** One shared window listener for every 3D accent. Values are -1..1. */
export function usePointer(): MutableRefObject<P> {
  const ref = useRef<P>(shared);
  useEffect(() => {
    if (bound) return;
    bound = true;
    window.addEventListener(
      "pointermove",
      (e) => {
        shared.x = (e.clientX / window.innerWidth) * 2 - 1;
        shared.y = (e.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true },
    );
  }, []);
  return ref;
}
