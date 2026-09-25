import { useState, useEffect } from 'react';
import { Maximize2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ScrollReveal from '../components/Animations/ScrollReveal';
import { supabase } from '../lib/supabaseClient';
import { getLenis } from '../hooks/useLenis';
import styles from './Gallery.module.css';

export const DEFAULT_ACTIVITIES = [
  {
    id: 1, format: 'landscape', sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2, format: 'portrait', sort_order: 2,
    image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3, format: 'portrait', sort_order: 3,
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4, format: 'landscape', sort_order: 4,
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5, format: 'landscape', sort_order: 5,
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6, format: 'portrait', sort_order: 6,
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 7, format: 'portrait', sort_order: 7,
    image_url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 8, format: 'landscape', sort_order: 8,
    image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
  }
];

export default function Gallery() {
  const [items, setItems] = useState(DEFAULT_ACTIVITIES);
  const [selectedIdx, setSelectedIdx] = useState(null);

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
      } catch {
        // Supabase not available
      }

      const localData = localStorage.getItem('portfolio_gallery');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
            return;
          }
        } catch {
          // ignore
        }
      }

      setItems(DEFAULT_ACTIVITIES);
    };

    fetchActivities();

    try {
      const subscription = supabase
        .channel('gallery_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
          fetchActivities();
        })
        .subscribe();

      return () => supabase.removeChannel(subscription);
    } catch {
      // ignore
    }
  }, []);

  // Lightbox keyboard & scroll lock
  useEffect(() => {
    if (selectedIdx !== null) {
      document.body.style.overflow = 'hidden';
      getLenis()?.stop();

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedIdx(null);
        else if (e.key === 'ArrowRight') setSelectedIdx((p) => (p + 1) % items.length);
        else if (e.key === 'ArrowLeft') setSelectedIdx((p) => (p - 1 + items.length) % items.length);
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

  // Build 4 columns for "The Balanced" pattern
  const columns = [
    [items[0] || DEFAULT_ACTIVITIES[0], items[1] || DEFAULT_ACTIVITIES[1]],
    [items[2] || DEFAULT_ACTIVITIES[2], items[3] || DEFAULT_ACTIVITIES[3]],
    [items[4] || DEFAULT_ACTIVITIES[4], items[5] || DEFAULT_ACTIVITIES[5]],
    [items[6] || DEFAULT_ACTIVITIES[6], items[7] || DEFAULT_ACTIVITIES[7]],
  ];

  const activeItem = selectedIdx !== null ? items[selectedIdx] : null;

  return (
    <section className={`section ${styles.gallerySection}`} id="gallery">
      <div className="container">
        {/* Header */}
        <div className={styles.sectionHeader}>
          <ScrollReveal>
            <div className="section-label">GALLERY</div>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h2 className={styles.heading}>Activity Highlights</h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className={styles.subtext}>
              Dokumentasi visual momen dan kegiatan besar selama perjalanan saya di dunia teknologi dan komunitas.
            </p>
          </ScrollReveal>
        </div>

        {/* Tight Mosaic Grid */}
        <div className={styles.galleryWall}>
          {columns.map((col, colIdx) => (
            <div key={colIdx} className={styles.galleryCol}>
              {col.map((item, rowIdx) => {
                const globalIdx = colIdx * 2 + rowIdx;
                const isPortrait = (colIdx % 2 === 0 && rowIdx === 1) || (colIdx % 2 === 1 && rowIdx === 0);
                const formatClass = isPortrait ? styles.formatPortrait : styles.formatLandscape;

                // Column-aware cascade delay
                const animDelay = colIdx * 0.1 + rowIdx * 0.15;

                return (
                  <ScrollReveal
                    key={item.id || globalIdx}
                    delay={animDelay}
                    direction="up"
                    distance={50}
                    duration={0.9}
                  >
                    <div
                      className={`${styles.frameItem} ${formatClass}`}
                      onClick={() => setSelectedIdx(globalIdx)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View photo ${globalIdx + 1}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedIdx(globalIdx);
                        }
                      }}
                    >
                      <img
                        src={item.image_url}
                        alt={`Activity photo ${globalIdx + 1}`}
                        className={styles.photoImage}
                        loading="lazy"
                      />
                      <div className={styles.photoOverlay} aria-hidden="true" />
                      <div className={styles.expandHint} aria-hidden="true">
                        <Maximize2 size={18} />
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Minimal Lightbox */}
      {selectedIdx !== null && activeItem && (
        <div
          className={styles.lightboxOverlay}
          data-lenis-prevent
          onClick={() => setSelectedIdx(null)}
          role="dialog"
          aria-modal="true"
        >
          <span className={styles.lightboxCounter}>
            {selectedIdx + 1} / {items.length}
          </span>

          <button
            className={styles.closeModalBtn}
            onClick={() => setSelectedIdx(null)}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <button
            className={`${styles.navArrowBtn} ${styles.navPrev}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIdx((p) => (p - 1 + items.length) % items.length);
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={22} />
          </button>

          <img
            src={activeItem.image_url}
            alt={`Activity photo ${selectedIdx + 1}`}
            className={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className={`${styles.navArrowBtn} ${styles.navNext}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIdx((p) => (p + 1) % items.length);
            }}
            aria-label="Next"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </section>
  );
}
