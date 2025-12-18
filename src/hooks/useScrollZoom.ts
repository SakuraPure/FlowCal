import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";

export const useScrollZoom = (
  containerRef?: React.RefObject<HTMLDivElement | null>
) => {
  const { viewMode, setViewMode } = useStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) return;

      // Threshold for triggering a switch
      const threshold = 30;

      if (Math.abs(e.deltaY) > threshold) {
        let shouldSwitch = false;

        // If a containerRef is provided, check scroll boundaries
        if (containerRef && containerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } =
            containerRef.current;
          // Relaxed thresholds to account for sub-pixel rendering or bounce effects
          const isAtTop = scrollTop <= 2;
          const isAtBottom =
            Math.abs(scrollHeight - clientHeight - scrollTop) <= 2;

          // Scroll Up (Zoom Out) - Only if at top
          if (e.deltaY < 0 && isAtTop) {
            shouldSwitch = true;
          }
          // Scroll Down (Zoom In) - Only if at bottom
          else if (e.deltaY > 0 && isAtBottom) {
            shouldSwitch = true;
          }
        } else {
          // No container (e.g., Month View), always switch
          shouldSwitch = true;
        }

        if (shouldSwitch) {
          // Check if a transition is actually possible before locking
          let nextView: typeof viewMode | null = null;

          if (e.deltaY > 0) {
            // Zoom In
            if (viewMode === "month") nextView = "week";
            else if (viewMode === "week") nextView = "day";
          } else {
            // Zoom Out
            if (viewMode === "day") nextView = "week";
            else if (viewMode === "week") nextView = "month";
          }

          if (nextView) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsTransitioning(true);
            setViewMode(nextView);

            timeoutRef.current = setTimeout(() => {
              setIsTransitioning(false);
            }, 500);
          }
        }
      }
    };

    const target = containerRef?.current || window;

    // We need to cast target to EventTarget because Window and HTMLElement have slightly different signatures
    // but addEventListener is common.
    target.addEventListener("wheel", handleWheel as EventListener);

    return () => {
      target.removeEventListener("wheel", handleWheel as EventListener);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [viewMode, isTransitioning, setViewMode, containerRef]);

  return { isTransitioning };
};
