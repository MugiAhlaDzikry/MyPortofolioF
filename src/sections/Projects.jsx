import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, X, ArrowRight, Info } from 'lucide-react';
import ScrollReveal from '../components/Animations/ScrollReveal';
import MagneticButton from '../components/Animations/MagneticButton';
import styles from './Projects.module.css';
import { supabase } from '../lib/supabaseClient';
import { getLenis } from '../hooks/useLenis';

gsap.registerPlugin(ScrollTrigger);

function GithubIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function Projects() {
  const projectsRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [isCycling, setIsCycling] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  const showToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Restore scrolling if component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      getLenis()?.start();
    };
  }, []);

  // Number of projects to show initially
  const visibleProjects = showAll ? projects : projects.slice(0, 4);

  // Open modal
  const openModal = (project) => {
    setSelectedProject(project);
    setActiveImageIndex(0); // Reset gallery index
    setIsPortrait(false); // Reset, will be detected async
    setToastMessage(null);
    document.body.style.overflow = 'hidden';
    getLenis()?.stop();

    // Detect if primary image is portrait
    const primaryUrl = project.image_url;
    if (primaryUrl) {
      const img = new Image();
      img.onload = () => {
        if (img.naturalHeight > img.naturalWidth) {
          setIsPortrait(true);
        }
      };
      img.src = primaryUrl;
    }
  };

  // Close modal
  const closeModal = () => {
    setToastMessage(null);
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, {
        y: 40, opacity: 0, duration: 0.3, ease: 'power2.in',
      });
      gsap.to(overlayRef.current, {
        opacity: 0, duration: 0.3,
        onComplete: () => {
          setSelectedProject(null);
          document.body.style.overflow = '';
          getLenis()?.start();
        },
      });
    } else {
      setSelectedProject(null);
      document.body.style.overflow = '';
      getLenis()?.start();
    }
  };

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('sort_order', { ascending: true });
      if (data) setProjects(data);
    };
    fetchProjects();

    const subscription = supabase
      .channel('projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects(); // Re-fetch all on any change
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  // Animate modal entry
  useEffect(() => {
    if (selectedProject && overlayRef.current && modalRef.current) {
      gsap.fromTo(overlayRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
      gsap.fromTo(modalRef.current,
        { scale: 0.95, y: 50, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', delay: 0.1 }
      );
    }
  }, [selectedProject]);

  return (
    <>
      <section className={`section ${styles.projects}`} id="projects" ref={projectsRef}>
        {/* Floating Glass Particles */}
        <div className={styles.glassParticles}>
          <div className={`${styles.shard} ${styles.shard1}`}></div>
          <div className={`${styles.shard} ${styles.shard2}`}></div>
          <div className={`${styles.shard} ${styles.shard3}`}></div>
          <div className={`${styles.shard} ${styles.shard4}`}></div>
          <div className={`${styles.shard} ${styles.shard5}`}></div>
        </div>

        <div className="container">
          {/* Header */}
          <div className={styles.projectsHeader}>
            <div>
              <ScrollReveal>
                <div className="section-label">Featured Work</div>
              </ScrollReveal>
              <ScrollReveal delay={0.05}>
                <h2 className={styles.projectsHeading}>Projects</h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className={styles.projectsSubtext}>
                  Berikut adalah beberapa proyek pilihan yang telah saya kerjakan, mencakup berbagai bidang dari web hingga mobile.
                </p>
              </ScrollReveal>
            </div>
          </div>

          {/* 2×2 Grid */}
          <div className={styles.projectGrid}>
            {visibleProjects.map((project, i) => (
              <ScrollReveal key={project.id} delay={i * 0.1}>
                <div
                  className={styles.projectCard}
                  onClick={() => openModal(project)}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                  }}
                >
                  {/* Glass shimmer overlay */}
                  <div className={styles.cardShimmer}></div>
                  <div className={styles.cardGlow}></div>
                  {/* Cursor spotlight */}
                  <div className={styles.cardSpotlight}></div>

                  {/* Card Top: Image with bezel */}
                  <div className={styles.cardImageWrapper}>
                    {project.image_url ? (
                      <div className={styles.cardImageContainer}>
                        <div 
                          className={styles.cardImageBackdrop} 
                          style={{ backgroundImage: `url(${project.image_url})` }} 
                        />
                        <img src={project.image_url} alt={project.title} className={styles.cardImage} />
                      </div>
                    ) : (
                      <div className={styles.cardPlaceholder}>
                        <span className={styles.cardNumber}>0{i + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardYear}>{project.year}</span>
                      <span className={styles.cardDot}>·</span>
                      <span className={styles.cardRole}>{project.role}</span>
                    </div>
                    <h3 className={styles.cardTitle}>{project.title}</h3>
                    <p className={styles.cardDescription}>{project.description}</p>
                    <div className={styles.cardFooter}>
                      <div className={styles.cardTech}>
                        {(project.tech_stack || []).slice(0, 3).map((t) => (
                          <span key={t} className={styles.techTag}>{t}</span>
                        ))}
                        {(project.tech_stack || []).length > 3 && (
                          <span className={styles.techTag}>+{(project.tech_stack || []).length - 3}</span>
                        )}
                      </div>
                      <span className={styles.cardArrow}>→</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* View All Button */}
          {projects.length > 4 && !showAll && (
            <ScrollReveal delay={0.3}>
              <div className={styles.viewAllWrapper}>
                <MagneticButton
                  className={styles.viewAllBtn}
                  onClick={() => setShowAll(true)}
                  strength={0.2}
                >
                  <span>View All Projects</span>
                  <ArrowRight size={18} />
                </MagneticButton>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedProject && (
        <div
          ref={overlayRef}
          className={styles.modalOverlay}
          data-lenis-prevent
          onClick={closeModal}
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            ref={modalRef}
            className={styles.modal}
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <button className={styles.modalClose} onClick={closeModal} aria-label="Close">
              <X size={24} />
            </button>

            <div className={`${styles.modalVisual} ${isPortrait ? styles.portraitVisual : ''}`}>
              {(() => {
                const images = [];
                if (selectedProject.image_url) images.push(selectedProject.image_url);
                if (selectedProject.gallery_urls && selectedProject.gallery_urls.length > 0) {
                  images.push(...selectedProject.gallery_urls);
                }

                if (images.length === 0) {
                  return <span className={styles.modalNumber}>0{projects.findIndex(p => p.id === selectedProject.id) + 1}</span>;
                }

                return (
                  <div
                    className={`${styles.galleryStackContainer} ${isGalleryHovered ? styles.galleryHovered : ''} ${isPortrait ? styles.portraitGallery : ''}`}
                    onMouseEnter={() => setIsGalleryHovered(true)}
                    onMouseLeave={() => setIsGalleryHovered(false)}
                    onClick={() => {
                      if (images.length <= 1) return;
                      // Instantly update index and let CSS transitions handle the smooth movement
                      setActiveImageIndex((prev) => (prev + 1) % images.length);
                    }}
                  >
                    {images.map((img, idx) => {
                      let offset = idx - activeImageIndex;
                      if (offset < 0) offset += images.length;

                      // Render all images to allow CSS transitions
                      let layerClass = styles[`galleryLayer${offset}`];
                      if (offset === images.length - 1) {
                        layerClass = styles.galleryLayerLast; // The card that just moved to the back
                      } else if (offset > 2) {
                        layerClass = styles.galleryLayerHidden;
                      }

                      return (
                        <div
                          key={`${img}-${idx}`}
                          className={`${styles.galleryLayer} ${layerClass}`}
                          style={{
                            zIndex: 10 - offset,
                          }}
                        >
                          {/* Blurred ambient backdrop */}
                          <div
                            className={styles.galleryLayerBackdrop}
                            style={{ backgroundImage: `url(${img})` }}
                          />
                          {/* Sharp foreground image */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              borderRadius: '16px',
                              backgroundImage: `url(${img})`,
                              backgroundSize: 'contain',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              zIndex: 1,
                            }}
                          />
                        </div>
                      );
                    })}

                    {images.length > 1 && (
                      <>
                        <div className={styles.galleryCounter}>
                          {activeImageIndex + 1} / {images.length}
                        </div>
                        <div className={styles.galleryHint}>Click to reveal next</div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            <div
              className={`${styles.modalBody} ${isPortrait ? styles.portraitBody : ''}`}
              data-lenis-prevent
            >
              <div className={styles.modalMeta}>
                <span className={styles.modalMetaItem}>{selectedProject.year}</span>
                <span className={styles.modalMetaItem}>{selectedProject.role}</span>
              </div>

              <h2 className={styles.modalTitle}>{selectedProject.title}</h2>
              <p className={styles.modalDescription}>{selectedProject.full_description}</p>

              <div className={styles.modalTechSection}>
                <h4 className={styles.modalSectionLabel}>Tech Stack</h4>
                <div className={styles.modalTech}>
                  {(selectedProject.tech_stack || []).map((t) => (
                    <span key={t} className={styles.modalTechTag}>{t}</span>
                  ))}
                </div>
              </div>

              {(() => {
                const hasLiveDemo = selectedProject.live_url && selectedProject.live_url.trim() !== '' && selectedProject.live_url.trim() !== '#';
                const hasGithubUrl = selectedProject.github_url && selectedProject.github_url.trim() !== '' && selectedProject.github_url.trim() !== '#';

                return (
                  <div className={styles.modalLinks}>
                    {hasLiveDemo ? (
                      <a
                        href={selectedProject.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.modalLinkPrimary}
                      >
                        <ExternalLink size={18} />
                        <span>Live Demo</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => showToast('Live demo belum tersedia untuk proyek ini.')}
                        className={`${styles.modalLinkPrimary} ${styles.modalLinkDisabled}`}
                        title="Live demo belum tersedia"
                      >
                        <ExternalLink size={18} />
                        <span>Live Demo</span>
                      </button>
                    )}

                    {hasGithubUrl ? (
                      <a
                        href={selectedProject.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.modalLinkSecondary}
                      >
                        <GithubIcon size={18} />
                        <span>Source Code</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => showToast('Source code belum tersedia atau bersifat privat untuk proyek ini.')}
                        className={`${styles.modalLinkSecondary} ${styles.modalLinkDisabled}`}
                        title="Source code belum tersedia"
                      >
                        <GithubIcon size={18} />
                        <span>Source Code</span>
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Notification Toast */}
            {toastMessage && (
              <div className={styles.modalToast} role="alert">
                <div className={styles.modalToastIcon}>
                  <Info size={18} />
                </div>
                <span className={styles.modalToastText}>{toastMessage}</span>
                <button
                  type="button"
                  className={styles.modalToastClose}
                  onClick={() => setToastMessage(null)}
                  aria-label="Tutup pemberitahuan"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
