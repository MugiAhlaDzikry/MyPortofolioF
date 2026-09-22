import { useState, useEffect } from 'react';
import { BookOpen, MapPin } from 'lucide-react';
import ScrollReveal from '../components/Animations/ScrollReveal';
import styles from './Education.module.css';
import { supabase } from '../lib/supabaseClient';

export default function Education() {
  const [educationList, setEducationList] = useState([]);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const { data, error } = await supabase
          .from('education')
          .select('*')
          .order('sort_order', { ascending: true });
        
        if (!error && data && data.length > 0) {
          const normalized = data.map(item => ({
            ...item,
            highlights: Array.isArray(item.highlights) 
              ? item.highlights 
              : (typeof item.highlights === 'string' ? item.highlights.split(',').map(s => s.trim()).filter(Boolean) : [])
          }));
          setEducationList(normalized);
        } else {
          setEducationList([]);
        }
      } catch (err) {
        console.warn('Education table fetch:', err);
      }
    };
    fetchEducation();

    const subscription = supabase
      .channel('education_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'education' }, () => {
        fetchEducation();
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  // If no education entries exist in database, gracefully don't render
  if (educationList.length === 0) {
    return null;
  }

  return (
    <section className={`section ${styles.education}`} id="education">
      <div className="container">
        {/* Header */}
        <div className={styles.educationHeader}>
          <ScrollReveal>
            <div className="section-label">Academic Background</div>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h2 className={styles.educationHeading}>
              Education
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className={styles.educationSubtext}>
              Riwayat pendidikan formal dan latar belakang akademik yang membangun fondasi teknis, logika pemecahan masalah, dan keahlian rekayasa perangkat lunak saya.
            </p>
          </ScrollReveal>
        </div>

        {/* Cardless Open Editorial Layout */}
        <div className={styles.educationEntries}>
          {educationList.map((edu, i) => (
            <ScrollReveal key={edu.id || i} delay={i * 0.1}>
              <div className={styles.educationRow}>
                {/* Left Meta Column: Period & Institution */}
                <div className={styles.metaColumn}>
                  <div className={styles.periodRow}>
                    <span className={styles.periodText}>{edu.period}</span>
                  </div>

                  <h4 className={styles.institutionName}>
                    {edu.institution}
                  </h4>

                  {edu.location && (
                    <div className={styles.locationMeta}>
                      <MapPin size={13} />
                      <span>{edu.location}</span>
                    </div>
                  )}
                </div>

                {/* Right Details Column: Degree, Description, Coursework */}
                <div className={styles.detailsColumn}>
                  <div className={styles.degreeHeader}>
                    <h3 className={styles.degreeTitle}>{edu.degree}</h3>
                  </div>

                  {edu.description && (
                    <p className={styles.descriptionText}>
                      {edu.description}
                    </p>
                  )}

                  {edu.highlights && edu.highlights.length > 0 && (
                    <div className={styles.courseworkWrapper}>
                      <span className={styles.courseworkLabel}>
                        <BookOpen size={13} />
                        Key Focus & Coursework:
                      </span>
                      <div className={styles.courseworkTags}>
                        {edu.highlights.map((tag, idx) => (
                          <span key={idx} className={styles.courseworkTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
