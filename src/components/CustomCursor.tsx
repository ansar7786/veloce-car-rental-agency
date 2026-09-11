import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoverText, setHoverText] = useState('');

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const onMouseDown = () => setIsDragging(true);
    const onMouseUp = () => setIsDragging(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isCanvas = target.tagName.toLowerCase() === 'canvas';
      const interactive = target.closest('button, a, input, select, [role="button"], .cursor-pointer, canvas');
      
      if (interactive) {
        setIsHovered(true);
        if (isCanvas || target.closest('#hero')) {
          setHoverText('ROTATE');
        } else if (target.closest('#fleet')) {
          setHoverText('VIEW');
        } else {
          setHoverText('');
        }
      } else {
        setIsHovered(false);
        setHoverText('');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999] transition-transform duration-75 ease-out hidden md:block"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 flex items-center justify-center ${
          isDragging
            ? 'w-16 h-16 bg-[#C7FF3D]/25 border-[#C7FF3D] scale-110 shadow-[0_0_25px_rgba(199,255,61,0.4)]'
            : isHovered
            ? 'w-14 h-14 bg-[#C7FF3D]/15 border-[#C7FF3D] scale-105 shadow-[0_0_20px_rgba(199,255,61,0.3)]'
            : 'w-3.5 h-3.5 bg-white/20 border-white/40'
        }`}
      >
        {(isHovered || isDragging) && (
          <span className="font-mono text-[0.55rem] font-bold tracking-widest text-[#C7FF3D]">
            {isDragging ? 'ORBIT' : hoverText}
          </span>
        )}
      </div>
    </div>
  );
};
