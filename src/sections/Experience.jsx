import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TextReveal from '../components/Animations/TextReveal';
import ScrollReveal from '../components/Animations/ScrollReveal';
import styles from './Experience.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const timelineRef = useRef(null);
  const lineRef = useRef(null);
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    const fetchExperiences = async () => {
      const { data } = await supabase.from('experience').select('*').order('sort_order', { ascending: true });
      if (data) setExperiences(data);
    };
    fetchExperiences();

    const subscription = supabase
      .channel('experience_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experience' }, () => {
        fetchExperiences();
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Draw the timeline line on scroll
      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: timelineRef.current,
              start: 'top 60%',
              end: 'bottom 80%',
              scrub: 1,
            },
          }
        );
      }

      // Animate timeline nodes
      const nodes = timelineRef.current?.querySelectorAll(`.${styles.timelineNode}`);
      if (nodes) {
        nodes.forEach((node) => {
          gsap.fromTo(node,
            { scale: 0 },
            {
              scale: 1,
              duration: 0.5,
              ease: 'elastic.out(1, 0.5)',
              scrollTrigger: {
                trigger: node,
                start: 'top 75%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }
    }, timelineRef);

    return () => ctx.revert();
  }, [experiences]);

  return (
    <section className={`section ${styles.experience}`} id="experience">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">Experience</div>
        </ScrollReveal>

        <TextReveal type="words" stagger={0.02} className={styles.experienceHeading} tag="h2">
          Journey
        </TextReveal>

        <div ref={timelineRef} className={styles.timeline}>
          {/* Animated vertical line */}
          <div className={styles.timelineLine}>
            <div ref={lineRef} className={styles.timelineLineFill}></div>
          </div>

          {experiences.map((exp, i) => (
            <ScrollReveal
              key={exp.id}
              direction={i % 2 === 0 ? 'left' : 'right'}
              delay={0.1}
              distance={40}
            >
              <div className={`${styles.timelineItem} ${i % 2 === 0 ? styles.left : styles.right}`}>
                <div className={styles.timelineNode}></div>

                <div className={styles.timelineContent}>
                  <span className={styles.period}>{exp.period}</span>
                  <h3 className={styles.role}>{exp.position}</h3>
                  <span className={styles.company}>{exp.company}</span>
                  <p className={styles.description}>{exp.description}</p>
                  <div className={styles.highlights}>
                    {exp.technologies?.map((h) => (
                      <span key={h} className={styles.highlight}>{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
