import styles from './Marquee.module.css';

export default function Marquee({
  children,
  speed = 30,
  direction = 'left', // 'left' | 'right'
  pauseOnHover = true,
  className = '',
}) {
  const animationStyle = {
    '--marquee-speed': `${speed}s`,
  };

  return (
    <div 
      className={`${styles.marquee} ${pauseOnHover ? styles.pauseOnHover : ''} ${className}`}
      style={animationStyle}
    >
      <div className={`${styles.track} ${direction === 'right' ? styles.reverse : ''}`}>
        <div className={styles.content}>
          {children}
        </div>
        <div className={styles.content} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
