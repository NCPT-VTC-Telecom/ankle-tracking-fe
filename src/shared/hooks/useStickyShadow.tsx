import { useRef, useState, useEffect } from 'react';

export const useStickyShadowClass = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollClass, setScrollClass] = useState('');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScrollClass = () => {
      const left = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (left === 0) setScrollClass('scroll-right'); // đầu bảng
      else if (left >= maxScroll) setScrollClass('scroll-left'); // cuối bảng
      else setScrollClass('scroll-left scroll-right'); // giữa bảng
    };

    updateScrollClass();
    container.addEventListener('scroll', updateScrollClass);

    const resizeObserver = new ResizeObserver(updateScrollClass);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateScrollClass);
      resizeObserver.disconnect();
    };
  }, []);

  return { containerRef, scrollClass };
};
