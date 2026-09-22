import { useState, useEffect } from 'react';
import ScrollReveal from '../components/Animations/ScrollReveal';
import TechIcon, { getTechInfo } from '../components/TechIcon';
import styles from './Skills.module.css';
import { supabase } from '../lib/supabaseClient';

const categoryIcons = {
  Frontend: '◇',
  Backend: '⬡',
  Tools: '⌬',
  Design: '◈',
};

export default function Skills() {
  const [skillCategories, setSkillCategories] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      const { data } = await supabase.from('skills').select('*').order('created_at', { ascending: true });
      if (data) {
        // Group by category
        const grouped = data.reduce((acc, skill) => {
          if (!acc[skill.category]) {
            acc[skill.category] = {
              title: skill.category,
              icon: categoryIcons[skill.category] || '◈',
              skills: []
            };
          }
          acc[skill.category].skills.push(skill.name);
          return acc;
        }, {});
        setSkillCategories(Object.values(grouped));
      }
    };
    fetchSkills();

    const subscription = supabase
      .channel('skills_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, () => {
        fetchSkills();
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  return (
    <section className={`section ${styles.skills}`} id="skills">
      <div className="container">
        {/* Header */}
        <div className={styles.skillsHeader}>
          <ScrollReveal>
            <div className="section-label">Skills & Expertise</div>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h2 className={styles.skillsHeading}>
              Technologies
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className={styles.skillsSubtext}>
              Berikut adalah teknologi dan tools yang saya kuasai dan gunakan secara aktif dalam setiap proyek pengembangan.
            </p>
          </ScrollReveal>
        </div>

        {/* Skill Categories Grid */}
        <div 
          className={styles.skillGrid}
          style={{ '--category-count': skillCategories.length }}
        >
          {skillCategories.map((category, i) => (
            <ScrollReveal key={category.title} delay={i * 0.1}>
              <div 
                className={styles.skillCard}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  // 3D Tilt calculation
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
                  const rotateY = ((x - centerX) / centerX) * 10;

                  e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                  e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                  e.currentTarget.style.setProperty('--rotate-x', `${rotateX}deg`);
                  e.currentTarget.style.setProperty('--rotate-y', `${rotateY}deg`);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.setProperty('--rotate-x', `0deg`);
                  e.currentTarget.style.setProperty('--rotate-y', `0deg`);
                }}
              >
                {/* Glass shimmer overlay */}
                <div className={styles.cardShimmer}></div>
                <div className={styles.cardGlow}></div>
                {/* Cursor spotlight — follows mouse, visible on hover */}
                <div className={styles.cardSpotlight}></div>

                <div className={styles.skillCardHeader}>
                  <div className={styles.categoryTitleWrap}>
                    <span className={styles.skillCardIcon}>{category.icon}</span>
                    <h3 className={styles.skillCardTitle}>{category.title}</h3>
                  </div>
                  <span className={styles.skillCountBadge}>
                    {category.skills.length} {category.skills.length > 1 ? 'items' : 'item'}
                  </span>
                </div>

                <div className={styles.skillTags}>
                  {category.skills.map((skill) => {
                    const { color } = getTechInfo(skill);
                    return (
                      <div 
                        key={skill} 
                        className={styles.skillTag}
                        style={{ '--brand-color': color }}
                      >
                        <span className={styles.tagIconWrapper}>
                          <TechIcon name={skill} size={17} />
                        </span>
                        <span className={styles.tagName}>{skill}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
