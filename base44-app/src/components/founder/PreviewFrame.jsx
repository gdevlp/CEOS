import React, { useEffect, useRef, useState } from 'react';

const DESIGN_WIDTH = 1280;

/**
 * Renders the storefront at true desktop width and scales it down to fit, so the
 * founder previews the real layout rather than a squashed mobile version.
 */
export default function PreviewFrame({ children, className = 'h-[70vh]' }) {
  const frameRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(0.4);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return undefined;

    const measure = () => {
      setScale(frame.clientWidth / DESIGN_WIDTH);
      setContentHeight(content.offsetHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className={`relative overflow-y-auto bg-background ${className}`}>
      <div
        ref={contentRef}
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: DESIGN_WIDTH, transform: `scale(${scale})` }}
      >
        {children}
      </div>
      <div style={{ height: contentHeight * scale }} />
    </div>
  );
}