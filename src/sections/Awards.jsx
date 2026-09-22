import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ScrollReveal from '../components/Animations/ScrollReveal';
import { getLenis } from '../hooks/useLenis';
import styles from './Awards.module.css';

export default function Awards() {
  const [awards, setAwards] = useState([]);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Manage body scroll and Lenis when lightbox is active
  useEffect(() => {
    if (lightboxImg) {
      document.body.style.overflow = 'hidden';
      getLenis()?.stop();

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setLightboxImg(null);
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
  }, [lightboxImg]);

  useEffect(() => {
    const fetchAwards = async () => {
      const { data } = await supabase.from('awards').select('*').order('sort_order', { ascending: true });
      if (data) setAwards(data);
    };
    fetchAwards();

    const subscription = supabase
      .channel('awards_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'awards' }, () => {
        fetchAwards();
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  return (
    <section className={`section ${styles.awards}`} id="awards">
      <div className="container">
        {/* Header */}
        <div className={styles.awardsHeader}>
          <ScrollReveal>
            <div className="section-label">Recognition</div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.05}>
            <h2 className={styles.awardsHeading}>
              Awards & Certifications
            </h2>
          </ScrollReveal>
          
          <ScrollReveal delay={0.1}>
            <p className={styles.awardsSubtext}>
              Beberapa penghargaan dan sertifikasi bergengsi yang telah saya raih selama perjalanan karir saya di industri teknologi.
            </p>
          </ScrollReveal>
        </div>

        {/* Awards List Layout */}
        <div className={styles.awardsList}>
          {awards.map((award, i) => (
            <ScrollReveal key={award.id} delay={i * 0.1}>
              <div 
                className={styles.awardRow}
                onClick={(e) => {
                  if (award.image_url) {
                    e.stopPropagation();
                    setLightboxImg(award.image_url);
                  }
                }}
              >
                {/* Year Column */}
                <div className={styles.awardYearCol}>
                  <span className={styles.awardYear}>{award.year}</span>
                </div>

                {/* Content Column */}
                <div className={styles.awardContentCol}>
                  <h3 className={styles.awardTitle}>{award.title}</h3>
                  <span className={styles.awardOrganization}>{award.organization}</span>
                  <p className={styles.awardDescription}>{award.description}</p>
                </div>

                {/* Visual / Image Column */}
                {award.image_url && (
                  <div className={styles.awardVisualCol}>
                    <div className={styles.awardThumbnailWrapper}>
                      <img
                        src={award.image_url}
                        alt={`${award.title} certificate`}
                        className={styles.awardThumbnail}
                      />
                      <div className={styles.awardThumbnailOverlay}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                        </svg>
                        <span>View</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className={styles.lightboxOverlay}
          data-lenis-prevent
          onClick={() => setLightboxImg(null)}
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className={styles.lightboxContent}
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <img src={lightboxImg} alt="Certificate" className={styles.lightboxImage} />
            <button
              className={styles.lightboxClose}
              onClick={() => setLightboxImg(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
