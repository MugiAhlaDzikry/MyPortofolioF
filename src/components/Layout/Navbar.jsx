import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sun, Moon, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import MagneticButton from '../Animations/MagneticButton';
import { getLenis } from '../../hooks/useLenis';
import { supabase } from '../../lib/supabaseClient';
import styles from './Navbar.module.css';

gsap.registerPlugin(ScrollTrigger);

// Inline SVG icons for Socials
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

// Clean shortcuts: Skills, Projects, Awards only
const navLinks = [
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Awards', href: '#awards' },
];

export default function Navbar() {
  const navRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isAnimating, setIsAnimating] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    github_url: '',
    linkedin_url: '',
    email: 'mugi7306@gmail.com'
  });

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const { data } = await supabase
          .from('hero')
          .select('github_url, linkedin_url, email')
          .eq('id', 1)
          .single();
        if (data) {
          setSocialLinks({
            github_url: data.github_url || '',
            linkedin_url: data.linkedin_url || '',
            email: data.email ? data.email.replace('mailto:', '') : 'mugi7306@gmail.com'
          });
        }
      } catch (e) {
        console.warn('Could not fetch hero socials for navbar:', e);
      }
    };
    fetchHeroData();
  }, []);

  // Sync ref
  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      getLenis()?.stop();
    } else {
      document.body.style.overflow = '';
      getLenis()?.start();
    }
    return () => {
      document.body.style.overflow = '';
      getLenis()?.start();
    };
  }, [isOpen]);

  useEffect(() => {
    // Theme setup
    const saved = localStorage.getItem('portfolio_theme');
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      applyTheme(initial);
    }

    const ctx = gsap.context(() => {
      // Animate navbar in on load
      gsap.fromTo(navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: 'power3.out' }
      );
    });

    // Show/hide on scroll
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsScrolled(currentScroll > 50);

      // Do not hide navbar while mobile menu is open
      if (isOpenRef.current) return;

      if (currentScroll > lastScroll && currentScroll > 200) {
        navRef.current?.classList.add(styles.hidden);
      } else {
        navRef.current?.classList.remove(styles.hidden);
      }
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      ctx.revert();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const applyTheme = (mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  const toggleTheme = (e) => {
    const next = theme === 'light' ? 'dark' : 'light';
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1200);

    // If View Transition API is supported and user hasn't requested reduced motion
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Find click coordinates or fallback to button center
      const rect = e?.currentTarget?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const y = rect ? rect.top + rect.height / 2 : 50;

      // Calculate maximum distance to cover full viewport
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = document.startViewTransition(() => {
        setTheme(next);
        localStorage.setItem('portfolio_theme', next);
        applyTheme(next);
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ];

        document.documentElement.animate(
          {
            clipPath: clipPath
          },
          {
            duration: 1100,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });
    } else {
      // Fallback for older browsers
      setTheme(next);
      localStorage.setItem('portfolio_theme', next);
      applyTheme(next);
    }
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''} ${isOpen ? styles.menuOpen : ''}`}
        id="main-navbar"
      >
        <div className={styles.navContent}>
          {/* Logo */}
          <a href="#" className={styles.logo} onClick={(e) => {
            e.preventDefault();
            setIsOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}>
            <span className={styles.logoText}>dev</span>
            <span className={styles.logoDot}>.</span>
          </a>

          {/* Right side: Desktop Links & Theme Toggle */}
          <div className={styles.navRightGroup}>
            <div className={styles.navLinks}>
              {navLinks.map((link) => (
                <MagneticButton
                  key={link.href}
                  tag="a"
                  href={link.href}
                  className={styles.navLink}
                  strength={0.2}
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.label}
                </MagneticButton>
              ))}
            </div>

            {/* Desktop Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`${styles.themeToggleBtn} ${styles.desktopToggle} ${isAnimating ? styles.animating : ''}`}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <div className={styles.btnGlow}></div>
              <div className={styles.iconSlot}>
                {theme === 'dark' ? (
                  <Sun size={17} className={styles.sunIcon} />
                ) : (
                  <Moon size={17} className={styles.moonIcon} />
                )}
              </div>
            </button>

            {/* Hamburger for Mobile */}
            <button
              className={`${styles.hamburger} ${isOpen ? styles.active : ''}`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              id="hamburger-btn"
            >
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay — rendered as sibling so it covers 100dvh viewport without GSAP transform bug */}
      <div
        className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Subtle luxury ambient glow */}
        <div className={styles.mobileMenuAmbient}></div>

        <div className={styles.mobileMenuContainer}>
          {/* Top category meta header */}
          <div className={styles.menuMetaHeader}>
            <span className={styles.menuMetaLabel}>NAVIGATION</span>
            <div className={styles.menuStatusPill}>
              <span className={styles.statusDot}></span>
              <span>Available for work</span>
            </div>
          </div>

          {/* Links list */}
          <div className={styles.mobileLinksList}>
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={styles.mobileLinkCard}
                onClick={(e) => handleNavClick(e, link.href)}
                style={{ transitionDelay: isOpen ? `${0.06 * (i + 1)}s` : '0s' }}
              >
                <div className={styles.mobileLinkLeft}>
                  <span className={styles.mobileLinkNum}>0{i + 1}</span>
                  <span className={styles.mobileLinkTitle}>{link.label}</span>
                </div>
                <span className={styles.mobileLinkArrow}>
                  <ArrowRight size={20} />
                </span>
              </a>
            ))}

            {/* Quick Contact Link Card */}
            <a
              href="#contact"
              className={`${styles.mobileLinkCard} ${styles.mobileContactCard}`}
              onClick={(e) => handleNavClick(e, '#contact')}
              style={{ transitionDelay: isOpen ? '0.24s' : '0s' }}
            >
              <div className={styles.mobileLinkLeft}>
                <span className={styles.mobileLinkNum}>04</span>
                <span className={styles.mobileLinkTitle}>Get In Touch</span>
              </div>
              <span className={styles.mobileLinkArrow}>
                <Sparkles size={18} />
              </span>
            </a>
          </div>

          {/* Bottom section: Theme Switcher & Socials */}
          <div
            className={styles.mobileMenuFooter}
            style={{ transitionDelay: isOpen ? '0.3s' : '0s' }}
          >
            {/* Segmented Theme Switcher */}
            <div className={styles.themeSwitchWrapper}>
              <span className={styles.themeSwitchLabel}>Appearance</span>
              <div className={styles.themeSegmentedControl}>
                <button
                  type="button"
                  className={`${styles.themeOptionBtn} ${theme === 'light' ? styles.themeOptionActive : ''}`}
                  onClick={(e) => theme !== 'light' && toggleTheme(e)}
                  aria-label="Light mode"
                >
                  <Sun size={15} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  className={`${styles.themeOptionBtn} ${theme === 'dark' ? styles.themeOptionActive : ''}`}
                  onClick={(e) => theme !== 'dark' && toggleTheme(e)}
                  aria-label="Dark mode"
                >
                  <Moon size={15} />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Social Icons & Email Row */}
            <div className={styles.mobileSocialsRow}>
              <div className={styles.socialIconsGroup}>
                {socialLinks.github_url && (
                  <a
                    href={socialLinks.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIconBtn}
                    aria-label="GitHub"
                  >
                    <GithubIcon />
                  </a>
                )}
                {socialLinks.linkedin_url && (
                  <a
                    href={socialLinks.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIconBtn}
                    aria-label="LinkedIn"
                  >
                    <LinkedInIcon />
                  </a>
                )}
                {socialLinks.email && (
                  <a
                    href={`mailto:${socialLinks.email}`}
                    className={styles.socialIconBtn}
                    aria-label="Email"
                  >
                    <MailIcon />
                  </a>
                )}
              </div>

              {socialLinks.email && (
                <a href={`mailto:${socialLinks.email}`} className={styles.socialEmailText}>
                  {socialLinks.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
