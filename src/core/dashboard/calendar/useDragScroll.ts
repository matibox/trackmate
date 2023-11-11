import { type MouseEventHandler, useCallback, useRef, useState } from 'react';

export function useDragScroll({ smooth } = { smooth: false }) {
  const scrollElRef = useRef<HTMLElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(e => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollElRef.current?.offsetLeft || 0));
    setScrollLeft(scrollElRef.current?.scrollLeft || 0);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = useCallback(
    e => {
      if (!isDragging || !scrollElRef.current) return;
      scrollElRef.current.style.scrollBehavior = 'auto';
      const x = e.pageX - (scrollElRef.current.offsetLeft || 0);
      const walk = (x - startX) * 0.75;
      scrollElRef.current.scrollLeft = scrollLeft - walk;
      scrollElRef.current.style.scrollBehavior = smooth ? 'smooth' : 'auto';
    },
    [isDragging, startX, scrollLeft, smooth]
  );

  return {
    ref: scrollElRef,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
  };
}
