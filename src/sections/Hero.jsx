import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, User } from 'lucide-react';
import MagneticButton from '../components/Animations/MagneticButton';
import styles from './Hero.module.css';
import { supabase } from '../lib/supabaseClient';

/* Inline SVG icons */
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const VerifiedIcon = () => (
  <svg viewBox="0 0 22 22" width="22" height="22" fill="none">
    <path d="M20.396 11c.019-.258-.107-.532-.322-.72l-1.742-1.524.244-2.296c.028-.258-.12-.516-.365-.618l-2.1-.874-.874-2.1a.611.611 0 00-.618-.365l-2.296.244L11.299.905c-.188-.215-.462-.341-.72-.322-.258-.019-.532.107-.72.322l-1.524 1.742-2.296-.244a.611.611 0 00-.618.365l-.874 2.1-2.1.874a.611.611 0 00-.365.618l.244 2.296L.905 10.28c-.215.188-.341.462-.322.72-.019.258.107.532.322.72l1.742 1.524-.244 2.296c-.028.258.12.516.365.618l2.1.874.874 2.1c.102.245.36.393.618.365l2.296-.244 1.524 1.742c.188.215.462.341.72.322.258.019.532-.107.72-.322l1.524-1.742 2.296.244a.611.611 0 00.618-.365l.874-2.1 2.1-.874a.611.611 0 00.365-.618l-.244-2.296 1.742-1.524c.215-.188.341-.462.322-.72z" fill="#1D9BF0"/>
    <path d="M9.585 14.929l-3.28-3.28 1.168-1.168 2.112 2.112 5.036-5.036 1.168 1.168-6.204 6.204z" fill="#fff"/>
  </svg>
);

// Helper to determine if a URL points to a video
const isVideoMedia = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) || url.startsWith('data:video/');
};

export default function Hero() {
  const heroRef = useRef(null);
  const avatarRef = useRef(null);
  const nameRef = useRef(null);
  const socialsRef = useRef(null);
  const roleRef = useRef(null);
  const bioRef = useRef(null);
  const ctaRef = useRef(null);

  const [heroData, setHeroData] = useState({
    name: '',
    role_primary: '',
    role_secondary: '',
    description: '',
    github_url: '',
    linkedin_url: '',
    email: '',
    profile_image_url: '',
    profile_secondary_url: ''
  });
  const [loaded, setLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    // Fetch initial data
    const fetchHeroData = async () => {
      try {
        const { data } = await supabase.from('hero').select('*').eq('id', 1).single();
        if (data) setHeroData(data);
      } catch (err) {
        console.warn('Could not fetch hero data:', err);
      } finally {
        setLoaded(true);
      }
    };
    fetchHeroData();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('hero_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'hero' }, (payload) => {
        if (payload.new.id === 1) setHeroData(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });

      // 1. Avatar scales up with subtle blur clearance
      if (avatarRef.current) {
        tl.fromTo(avatarRef.current,
          { scale: 0.85, opacity: 0, filter: 'blur(12px)' },
          { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out' }
        );
      }

      // 2. Name & Verified Badge slides up smoothly
      if (nameRef.current) {
        tl.fromTo(nameRef.current,
          { y: 35, opacity: 0, filter: 'blur(8px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' },
          "-=0.85"
        );
      }

      // 3. Social Icons stagger in with subtle spring
      if (socialsRef.current && socialsRef.current.children.length > 0) {
        tl.fromTo(socialsRef.current.children,
          { y: 15, opacity: 0, scale: 0.75 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.08, ease: 'back.out(1.6)' },
          "-=0.6"
        );
      }

      // 4. Role Title slides in
      if (roleRef.current) {
        tl.fromTo(roleRef.current,
          { y: 30, opacity: 0, filter: 'blur(6px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' },
          "-=0.65"
        );
      }

      // 5. Bio Description fades in
      if (bioRef.current) {
        tl.fromTo(bioRef.current,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
          "-=0.6"
        );
      }

      // 6. Call to Action Button
      if (ctaRef.current) {
        tl.fromTo(ctaRef.current,
          { y: 20, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'power3.out' },
          "-=0.55"
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, [loaded]);

  const scrollToProjects = () => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper to extract initials
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const imageWrapperRef = useRef(null);

  // 3D Parallax Tilt on Mouse Move
  const handleMouseMove = (e) => {
    const card = imageWrapperRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x - centerX) / centerX; // Range: -1 to 1
    const percentY = (y - centerY) / centerY; // Range: -1 to 1

    // 3D Tilt rotations
    const rotateX = -percentY * 15; // Max 15deg
    const rotateY = percentX * 15;

    // Inner media parallax shift
    const parallaxX = percentX * 20; // Max 20px
    const parallaxY = percentY * 20;

    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
    card.style.setProperty('--parallax-x', `${parallaxX}px`);
    card.style.setProperty('--parallax-y', `${parallaxY}px`);
    card.style.setProperty('--spotlight-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--spotlight-y', `${(y / rect.height) * 100}%`);
  };

  const handleMouseLeave = () => {
    const card = imageWrapperRef.current;
    if (!card) return;
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
    card.style.setProperty('--parallax-x', '0px');
    card.style.setProperty('--parallax-y', '0px');
    card.style.setProperty('--spotlight-x', '50%');
    card.style.setProperty('--spotlight-y', '50%');
  };

  // Handle toggle between Layer 1 and Layer 2 on click
  const handleProfileClick = () => {
    if (!heroData.profile_secondary_url) return;
    setIsFlipping(true);
    setTimeout(() => {
      setActiveLayer(prev => (prev === 1 ? 2 : 1));
      setTimeout(() => setIsFlipping(false), 200);
    }, 200);
  };

  // Active media URL based on current layer
  const currentMediaUrl = activeLayer === 2 && heroData.profile_secondary_url 
    ? heroData.profile_secondary_url 
    : heroData.profile_image_url;

  const hasTwoLayers = Boolean(heroData.profile_image_url && heroData.profile_secondary_url);

  return (
    <section ref={heroRef} className={styles.hero} id="hero">
      <div className={`container ${styles.heroInner}`}>

        {/* Row: Photo / Video Placeholder | Name + Socials */}
        <div className={styles.profileRow}>
          <div ref={avatarRef} className={styles.heroImage}>
            <div 
              ref={imageWrapperRef}
              className={`${styles.imageWrapper} ${hasTwoLayers ? styles.clickableWrapper : ''} ${isFlipping ? styles.flipping : ''}`}
              onClick={handleProfileClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              title={hasTwoLayers ? "Click to switch profile layer" : undefined}
            >
              {currentMediaUrl ? (
                isVideoMedia(currentMediaUrl) ? (
                  <video
                    key={currentMediaUrl}
                    src={currentMediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={styles.profileMedia}
                  />
                ) : (
                  <img 
                    key={currentMediaUrl}
                    src={currentMediaUrl} 
                    alt={heroData.name || 'Profile'} 
                    className={styles.profileMedia} 
                  />
                )
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {heroData.name ? (
                    <span className={styles.avatarInitials}>{getInitials(heroData.name)}</span>
                  ) : (
                    <User size={64} className={styles.avatarIcon} />
                  )}
                </div>
              )}

              {/* Specular spotlight overlay */}
              <div className={styles.avatarSpotlight} />
            </div>
          </div>

          <div className={styles.profileInfo}>
            <div ref={nameRef} className={styles.nameRow}>
              <h1 className={styles.name}>{heroData.name || 'Welcome'}</h1>
              {heroData.name && <span className={styles.verified}><VerifiedIcon /></span>}
            </div>

            <div ref={socialsRef} className={styles.socialLinks}>
              {heroData.github_url && heroData.github_url !== '#' && (
                <a href={heroData.github_url} className={styles.socialLink} aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                  <GithubIcon />
                </a>
              )}
              {heroData.linkedin_url && heroData.linkedin_url !== '#' && (
                <a href={heroData.linkedin_url} className={styles.socialLink} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <LinkedInIcon />
                </a>
              )}
              {heroData.email && heroData.email !== '#' && (
                <a href={heroData.email.startsWith('mailto:') ? heroData.email : `mailto:${heroData.email}`} className={styles.socialLink} aria-label="Email">
                  <MailIcon />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Role — full width below the row */}
        {(heroData.role_primary || heroData.role_secondary) && (
          <h2 ref={roleRef} className={styles.role}>
            {heroData.role_primary} {heroData.role_secondary ? `— ` : ''}
            {heroData.role_secondary && <span className={styles.roleSub}>{heroData.role_secondary}</span>}
          </h2>
        )}

        {/* Bio & CTA */}
        <div className={styles.profileBioWrapper}>
          {heroData.description && (
            <p ref={bioRef} className={styles.bio}>
              {heroData.description}
            </p>
          )}

          <div ref={ctaRef} className={styles.cta}>
            <MagneticButton
              className={styles.ctaPrimary}
              onClick={scrollToProjects}
              strength={0.2}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <span>View My Work</span>
              <ArrowRight size={18} />
            </MagneticButton>
          </div>
        </div>

      </div>
    </section>
  );
}
