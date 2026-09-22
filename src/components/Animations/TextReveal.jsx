import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TextReveal({ 
  children, 
  type = 'words', // 'words' | 'chars' | 'lines'
  stagger = 0.03, 
  delay = 0, 
  duration = 0.8,
  y = 40,
  className = '',
  tag = 'div',
  triggerStart = 'top 85%',
}) {
  const containerRef = useRef(null);
  const Tag = tag;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const text = el.textContent;
    el.innerHTML = '';

    let elements = [];

    if (type === 'chars') {
      const chars = text.split('');
      chars.forEach((char) => {
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline-block';
        wrapper.style.overflow = 'hidden';
        wrapper.style.verticalAlign = 'top';
        
        const inner = document.createElement('span');
        inner.style.display = 'inline-block';
        inner.textContent = char === ' ' ? '\u00A0' : char;
        
        wrapper.appendChild(inner);
        el.appendChild(wrapper);
        elements.push(inner);
      });
    } else if (type === 'words') {
      const words = text.split(' ');
      words.forEach((word, i) => {
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline-block';
        wrapper.style.overflow = 'hidden';
        wrapper.style.verticalAlign = 'top';
        wrapper.style.marginRight = '0.3em';
        
        const inner = document.createElement('span');
        inner.style.display = 'inline-block';
        inner.textContent = word;
        
        wrapper.appendChild(inner);
        el.appendChild(wrapper);
        elements.push(inner);
      });
    } else {
      // lines - treat children as single line
      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      
      const inner = document.createElement('span');
      inner.style.display = 'inline-block';
      inner.textContent = text;
      
      wrapper.appendChild(inner);
      el.appendChild(wrapper);
      elements.push(inner);
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(elements, 
        { 
          y: y, 
          opacity: 0,
          rotateX: type === 'chars' ? 40 : 0,
        },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: duration,
          stagger: stagger,
          delay: delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: triggerStart,
            toggleActions: 'play none none none',
          },
        }
      );
    });

    return () => ctx.revert();
  }, [children, type, stagger, delay, duration, y, triggerStart]);

  return (
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  );
}
