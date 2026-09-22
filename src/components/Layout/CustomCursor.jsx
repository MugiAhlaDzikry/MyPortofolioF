import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import styles from './CustomCursor.module.css';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [cursorText, setCursorText] = useState('');

  useEffect(() => {
    // Hide on mobile
    const mediaQuery = window.matchMedia('(min-width: 769px)');
    if (!mediaQuery.matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMouseMove = (e) => {
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });

      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.35,
        ease: 'power2.out',
      });
    };

    const onMouseEnterInteractive = (e) => {
      setIsHovering(true);
      const text = e.target.getAttribute('data-cursor-text') || '';
      setCursorText(text);
    };

    const onMouseLeaveInteractive = () => {
      setIsHovering(false);
      setCursorText('');
    };

    const onMouseLeaveWindow = () => setIsHidden(true);
    const onMouseEnterWindow = () => setIsHidden(false);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeaveWindow);
    document.addEventListener('mouseenter', onMouseEnterWindow);

    // Attach hover listeners to interactive elements
    const interactives = document.querySelectorAll(
      'a, button, input, textarea, [data-cursor-hover], [data-cursor-text]'
    );
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onMouseEnterInteractive);
      el.addEventListener('mouseleave', onMouseLeaveInteractive);
    });

    // Observe DOM for new elements
    const observer = new MutationObserver(() => {
      const newInteractives = document.querySelectorAll(
        'a, button, input, textarea, [data-cursor-hover], [data-cursor-text]'
      );
      newInteractives.forEach((el) => {
        el.removeEventListener('mouseenter', onMouseEnterInteractive);
        el.removeEventListener('mouseleave', onMouseLeaveInteractive);
        el.addEventListener('mouseenter', onMouseEnterInteractive);
        el.addEventListener('mouseleave', onMouseLeaveInteractive);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeaveWindow);
      document.removeEventListener('mouseenter', onMouseEnterWindow);
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onMouseEnterInteractive);
        el.removeEventListener('mouseleave', onMouseLeaveInteractive);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className={`${styles.cursorDot} ${isHovering ? styles.hovering : ''} ${isHidden ? styles.hidden : ''}`}
      />
      <div
        ref={ringRef}
        className={`${styles.cursorRing} ${isHovering ? styles.hovering : ''} ${isHidden ? styles.hidden : ''}`}
      >
        {cursorText && (
          <span className={styles.cursorText}>{cursorText}</span>
        )}
      </div>
    </>
  );
}
