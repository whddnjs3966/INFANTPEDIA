"use client";

import { useRef, useCallback, useEffect } from "react";

/**
 * Enable click-and-drag horizontal scrolling for any scroll container.
 *
 * Usage:
 *   const { ref, dragProps, suppressClickIfDragging } = useDragScroll();
 *
 *   <div ref={ref} {...dragProps} className="overflow-x-auto ...">
 *     {items.map(item => (
 *       <button onClick={suppressClickIfDragging(() => handleClick(item))}>
 *         ...
 *       </button>
 *     ))}
 *   </div>
 *
 * `suppressClickIfDragging` wraps child click handlers so that a click
 * fired at the end of a drag gesture is ignored. This prevents accidental
 * tab-switches when the user just wanted to scroll.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent<T>) => {
    if (!ref.current) return;
    // Only handle primary button
    if (e.button !== 0) return;
    isDragging.current = true;
    didDrag.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    if (!isDragging.current || !ref.current) return;
    const x = e.pageX - ref.current.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 3) {
      didDrag.current = true;
      e.preventDefault();
    }
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const endDrag = useCallback(() => {
    isDragging.current = false;
    // Reset didDrag on next tick so click handlers can read it first
    setTimeout(() => {
      didDrag.current = false;
    }, 0);
  }, []);

  // Also listen on window for mouseup, in case cursor leaves the element
  useEffect(() => {
    const up = () => {
      if (isDragging.current) endDrag();
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, [endDrag]);

  const suppressClickIfDragging = useCallback(
    <E extends React.SyntheticEvent>(handler: (e: E) => void) =>
      (e: E) => {
        if (didDrag.current) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        handler(e);
      },
    []
  );

  const dragProps = {
    onMouseDown,
    onMouseMove,
    onMouseUp: endDrag,
    onMouseLeave: endDrag,
  };

  return { ref, dragProps, suppressClickIfDragging };
}
