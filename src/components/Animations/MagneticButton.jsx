import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import styles from './MagneticButton.module.css';

export default function MagneticButton({ 
  children, 
  className = '', 
  onClick,
  strength = 0.3,
  tag = 'button',
  ...props 
}) {
  const btnRef = useRef(null);
  const textRef = useRef(null);
  const Tag = tag;

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    // Only apply magnetic on desktop
    const mediaQuery = window.matchMedia('(min-width: 769px)');
    if (!mediaQuery.matches) return;

    const handleMouseMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: 'power2.out',
      });

      if (textRef.current) {
        gsap.to(textRef.current, {
          x: x * strength * 0.5,
          y: y * strength * 0.5,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)',
      });

      if (textRef.current) {
        gsap.to(textRef.current, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
        });
      }
    };

    btn.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      btn.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <Tag
      ref={btnRef}
      className={`${styles.magneticBtn} ${className}`}
      onClick={onClick}
      {...props}
    >
      <span ref={textRef} className={styles.magneticBtnText}>
        {children}
      </span>
    </Tag>
  );
}
