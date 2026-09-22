import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollReveal({
  children,
  direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'scale'
  delay = 0,
  duration = 0.8,
  distance = 60,
  className = '',
  stagger = 0,
  triggerStart = 'top 85%',
  once = true,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger > 0 ? el.children : el;

    const fromVars = { opacity: 0 };
    
    switch (direction) {
      case 'up':
        fromVars.y = distance;
        break;
      case 'down':
        fromVars.y = -distance;
        break;
      case 'left':
        fromVars.x = distance;
        break;
      case 'right':
        fromVars.x = -distance;
        break;
      case 'scale':
        fromVars.scale = 0.85;
        break;
      default:
        fromVars.y = distance;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(targets, fromVars, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration,
        delay,
        stagger: stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: triggerStart,
          toggleActions: once 
            ? 'play none none none'
            : 'play reverse play reverse',
        },
      });
    });

    return () => ctx.revert();
  }, [direction, delay, duration, distance, stagger, triggerStart, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
