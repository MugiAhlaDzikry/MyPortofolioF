import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  MapPin, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles 
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollReveal from '../components/Animations/ScrollReveal';
import { supabase } from '../lib/supabaseClient';
import { getLenis } from '../hooks/useLenis';
import styles from './Gallery.module.css';

gsap.registerPlugin(ScrollTrigger);

// 8 Curated default activities matching "The Balanced" layout (4 cols x 2 rows)
export const DEFAULT_ACTIVITIES = [
  // Column 1 - Top: Landscape (10x12")
  {
    id: 1,
    title: 'National Tech Hackathon Championship',
    category: 'Hackathon',
    format: 'landscape',
    date: 'Oktober 2024',
    location: 'Jakarta Convention Center',
    description: 'Kompetisi pengembangan solusi teknologi tingkat nasional selama 48 jam nonstop bersama tim pengembang, membangun sistem otomasi cerdas berbasis AI.',
    image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    sort_order: 1
  },
  // Column 1 - Bottom: Portrait (12x16")
  {
    id: 2,
    title: 'Google Developer Showcase & Keynote',
    category: 'Conference',
    format: 'portrait',
    date: 'Agustus 2024',
    location: 'Main Tech Auditorium',
    description: 'Mempresentasikan implementasi arsitektur modern web dan performa aplikasi frontend di hadapan 250+ developer muda dan mahasiswa teknologi.',
    image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    sort_order: 2
  },
  // Column 2 - Top: Portrait (12x16")
  {
    id: 3,
    title: 'International Open Source Summit',
    category: 'Conference',
    format: 'portrait',
    date: 'Juli 2024',
    location: 'Bali Convention Centre',
    description: 'Menghadiri konferensi teknologi internasional, berkolaborasi dengan komunitas kontributor open-source global untuk ekosistem cloud masa depan.',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    sort_order: 3
  },
  // Column 2 - Bottom: Landscape (10x12")
  {
    id: 4,
    title: 'Frontend Engineering & UI/UX Sprint',
    category: 'Workshop',
    format: 'landscape',
    date: 'Mei 2024',
    location: 'Creative Tech Hub',
    description: 'Memandu sesi workshop intensif pembuatan prototipe interaktif dan implementasi micro-interactions frontend berstandar industri modern.',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    sort_order: 4
  },
  // Column 3 - Top: Landscape (10x12")
  {
    id: 5,
    title: 'Campus IT Project Expo & Demo Day',
    category: 'Exhibition',
    format: 'landscape',
    date: 'Maret 2024',
    location: 'Innovation Hall',
    description: 'Mendemonstrasikan platform perangkat lunak inovatif kepada panel juri profesional, dosen penguji, serta mitra industri teknologi terkemuka.',
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    sort_order: 5
  },
  // Column 3 - Bottom: Portrait (12x16")
  {
    id: 6,
    title: 'Best Innovation Award Ceremony',
    category: 'Award',
    format: 'portrait',
    date: 'November 2023',
    location: 'Grand Ballroom Hotel Horison',
    description: 'Momen penganugerahan piala dan penghargaan bergengsi atas keberhasilan meraih Juara Pertama dalam kompetisi inovasi digital skala nasional.',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    sort_order: 6
  },
  // Column 4 - Top: Portrait (12x16")
  {
    id: 7,
    title: 'Tech Leaders Camp & Strategy Retreat',
    category: 'Leadership',
    format: 'portrait',
    date: 'September 2023',
    location: 'Training Center Resort',
    description: 'Pelatihan kepemimpinan tingkat lanjut untuk merumuskan visi strategis, manajemen tim pengembang, dan roadmap kegiatan tahunan organisasi mahasiswa.',
    image_url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
    sort_order: 7
  },
  // Column 4 - Bottom: Landscape (10x12")
  {
    id: 8,
    title: 'Developer Community Meetup & Sharing',
    category: 'Meetup',
    format: 'landscape',
    date: 'Juni 2023',
    location: 'Coworking Space Bandung',
    description: 'Sesi diskusi hangat dan transfer wawasan antar pengembang seputar tren web modern, tools produktivitas, serta kultur rekayasa perangkat lunak.',
    image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    sort_order: 8
  }
];

export default function Gallery() {
  const [items, setItems] = useState(DEFAULT_ACTIVITIES);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const wallRef = useRef(null);

  // Fetch activities from Supabase or localStorage fallback
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          setItems(data);
          return;
        }
      } catch (err) {
        console.warn('Supabase gallery fetch error, using local fallback:', err);
      }

      // Local storage fallback if edited in admin
      const localData = localStorage.getItem('portfolio_gallery');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
            return;
          }
        } catch {
          // ignore parsing error
        }
      }

      // Default curated items
      setItems(DEFAULT_ACTIVITIES);
    };

    fetchActivities();

    // Subscribe to realtime supabase changes if available
    try {
      const subscription = supabase
        .channel('gallery_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
          fetchActivities();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } catch {
      // ignore
    }
  }, []);

  // Manage body scroll and Lenis when Lightbox is open
  useEffect(() => {
    if (selectedIdx !== null) {
      document.body.style.overflow = 'hidden';
      getLenis()?.stop();

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSelectedIdx(null);
        } else if (e.key === 'ArrowRight') {
          setSelectedIdx((prev) => (prev + 1) % items.length);
        } else if (e.key === 'ArrowLeft') {
          setSelectedIdx((prev) => (prev - 1 + items.length) % items.length);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        getLenis()?.start();
      };
    } else {
      document.body.style.overflow = '';
      getLenis()?.start();
    }
  }, [selectedIdx, items.length]);

  // Smooth Staggered Scroll Entrance using GSAP
  useEffect(() => {
    if (!wallRef.current) return;

    const ctx = gsap.context(() => {
      const columns = wallRef.current.children;
      gsap.fromTo(
        columns,
        {
          opacity: 0,
          y: 40,
          scale: 0.96
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: wallRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, wallRef);

    return () => ctx.revert();
  }, [items]);

  // Distribute items into 4 columns for "The Balanced" grid
  // Col 1: items[0] (Landscape), items[1] (Portrait)
  // Col 2: items[2] (Portrait),  items[3] (Landscape)
  // Col 3: items[4] (Landscape), items[5] (Portrait)
  // Col 4: items[6] (Portrait),  items[7] (Landscape)
  const columns = [
    [items[0] || DEFAULT_ACTIVITIES[0], items[1] || DEFAULT_ACTIVITIES[1]],
    [items[2] || DEFAULT_ACTIVITIES[2], items[3] || DEFAULT_ACTIVITIES[3]],
    [items[4] || DEFAULT_ACTIVITIES[4], items[5] || DEFAULT_ACTIVITIES[5]],
    [items[6] || DEFAULT_ACTIVITIES[6], items[7] || DEFAULT_ACTIVITIES[7]],
  ];

  const activeItem = selectedIdx !== null ? items[selectedIdx] : null;

  return (
    <section className={`section ${styles.gallerySection}`} id="gallery">
      {/* Subtle Ambient Glow */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className="container">
        {/* Header */}
        <div className={styles.sectionHeader}>
          <ScrollReveal>
            <div className="section-label">EXHIBITION</div>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h2 className={styles.heading}>
              Major Activities & Highlights
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className={styles.subtext}>
              Dokumentasi visual momen dan kegiatan besar yang menandai jejak langkah saya di dunia teknologi, kepemimpinan, dan komunitas.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className={styles.layoutBadgeRow}>
              <span className={styles.layoutBadge}>
                <span className={styles.layoutDot} />
                THE BALANCED • 4-12×16″ &amp; 4-10×12″
              </span>
            </div>
          </ScrollReveal>
        </div>

        {/* "The Balanced" 4-Column Wall */}
        <div className={styles.galleryWall} ref={wallRef}>
          {columns.map((col, colIdx) => (
            <div key={colIdx} className={styles.galleryCol}>
              {col.map((item, rowIdx) => {
                // Global index across 8 items
                const globalIdx = colIdx * 2 + rowIdx;
                const isPortrait = (colIdx % 2 === 0 && rowIdx === 1) || (colIdx % 2 === 1 && rowIdx === 0);
                const formatClass = isPortrait ? styles.formatPortrait : styles.formatLandscape;
                const formatLabel = isPortrait ? '12×16″' : '10×12″';

                return (
                  <div
                    key={item.id || globalIdx}
                    className={`${styles.frameItem} ${formatClass}`}
                    onClick={() => setSelectedIdx(globalIdx)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View photo: ${item.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedIdx(globalIdx);
                      }
                    }}
                  >
                    {/* Expand hint button */}
                    <div className={styles.expandHint} aria-hidden="true">
                      <Maximize2 size={16} />
                    </div>

                    {/* Mat Board / Passe-Partout */}
                    <div className={styles.matBoard}>
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className={styles.photoImage}
                        loading="lazy"
                      />
                      {/* Glass sheen effect on hover */}
                      <div className={styles.glassSheen} aria-hidden="true" />
                      {/* Dark gradient overlay */}
                      <div className={styles.photoOverlay} aria-hidden="true" />

                      {/* Content overlay */}
                      <div className={styles.cardContent}>
                        <div className={styles.badgeRow}>
                          <span className={styles.categoryPill}>
                            <Sparkles size={11} />
                            {item.category || 'Activity'}
                          </span>
                          <span className={styles.formatTag}>{formatLabel}</span>
                        </div>

                        <h3 className={styles.cardTitle}>{item.title}</h3>

                        <div className={styles.cardMeta}>
                          {item.date && (
                            <span className={styles.cardMetaItem}>
                              <Calendar size={12} />
                              {item.date}
                            </span>
                          )}
                          {item.location && (
                            <span className={styles.cardMetaItem}>
                              <MapPin size={12} />
                              {item.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Interactive Lightbox */}
      {selectedIdx !== null && activeItem && (
        <div
          className={styles.lightboxOverlay}
          data-lenis-prevent
          onClick={() => setSelectedIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
        >
          <div
            className={styles.lightboxCard}
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className={styles.closeModalBtn}
              onClick={() => setSelectedIdx(null)}
              aria-label="Close Lightbox"
            >
              <X size={20} />
            </button>

            {/* Left Column: Image */}
            <div className={styles.lightboxImageCol}>
              <img
                src={activeItem.image_url}
                alt={activeItem.title}
                className={styles.lightboxImage}
              />
            </div>

            {/* Right Column: Details & Navigation */}
            <div className={styles.lightboxInfoCol}>
              <div>
                <div className={styles.lightboxHeaderRow}>
                  <span className={styles.categoryPill}>
                    <Sparkles size={12} />
                    {activeItem.category || 'Major Event'}
                  </span>
                  <span className={styles.lightboxCounter}>
                    {selectedIdx + 1} / {items.length}
                  </span>
                </div>

                <h3 className={styles.lightboxTitle}>{activeItem.title}</h3>

                <div className={styles.lightboxMetaGrid}>
                  <div className={styles.lightboxMetaItem}>
                    <span className={styles.lightboxMetaLabel}>Waktu</span>
                    <span className={styles.lightboxMetaValue}>
                      <Calendar size={14} />
                      {activeItem.date || '-'}
                    </span>
                  </div>
                  <div className={styles.lightboxMetaItem}>
                    <span className={styles.lightboxMetaLabel}>Lokasi</span>
                    <span className={styles.lightboxMetaValue}>
                      <MapPin size={14} />
                      {activeItem.location || '-'}
                    </span>
                  </div>
                  <div className={styles.lightboxMetaItem}>
                    <span className={styles.lightboxMetaLabel}>Frame Curation</span>
                    <span className={styles.lightboxMetaValue}>
                      {activeItem.format === 'portrait' ? '12×16″ Portrait' : '10×12″ Landscape'}
                    </span>
                  </div>
                </div>

                <p className={styles.lightboxDescription}>
                  {activeItem.description || 'Dokumentasi kegiatan besar dan kontribusi dalam pengembangan teknologi.'}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className={styles.lightboxControls}>
                <div className={styles.navBtnGroup}>
                  <button
                    className={styles.navArrowBtn}
                    onClick={() => setSelectedIdx((prev) => (prev - 1 + items.length) % items.length)}
                    aria-label="Previous Photo"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    className={styles.navArrowBtn}
                    onClick={() => setSelectedIdx((prev) => (prev + 1) % items.length)}
                    aria-label="Next Photo"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <span className={styles.lightboxCounter}>
                  Gunakan tombol panah ← → untuk navigasi
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
