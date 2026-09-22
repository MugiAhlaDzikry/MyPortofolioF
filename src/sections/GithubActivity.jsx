import { useState, useEffect } from 'react';
import { GitHubCalendar } from 'react-github-calendar';
import { ArrowUpRight, GitBranch, GitCommit, FolderGit2 } from 'lucide-react';
import ScrollReveal from '../components/Animations/ScrollReveal';
import MagneticButton from '../components/Animations/MagneticButton';
import styles from './GithubActivity.module.css';

// GitHub icon SVG
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const customTheme = {
  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
};

export default function GithubActivity() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Detect initial theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme);

    // Observe theme changes on <html>
    const observer = new MutationObserver(() => {
      const updatedTheme = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(updatedTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className={`section ${styles.githubSection}`} id="activity">
      <div className="container">
        {/* Header */}
        <div className={styles.sectionHeader}>
          <ScrollReveal>
            <div className="section-label">ACTIVITY</div>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h2 className={styles.heading}>
              GitHub Contributions
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className={styles.subtext}>
              Aktivitas komit harian dan konsistensi pengembangan kode yang tercatat langsung di repositori publik GitHub saya.
            </p>
          </ScrollReveal>
        </div>

        {/* Main Card */}
        <ScrollReveal delay={0.15}>
          <div className={styles.calendarCard}>
            {/* Card Topbar */}
            <div className={styles.cardHeader}>
              <div className={styles.profileBadge}>
                <div className={styles.githubIconWrap}>
                  <GithubIcon />
                </div>
                <div className={styles.profileMeta}>
                  <div className={styles.profileNameRow}>
                    <span className={styles.profileName}>MugiAhlaDzikry</span>
                    <span className={styles.activeBadge}>
                      <span className={styles.activeDot}></span>
                      Active
                    </span>
                  </div>
                  <span className={styles.profileSubtitle}>github.com/MugiAhlaDzikry</span>
                </div>
              </div>

              <MagneticButton
                tag="a"
                href="https://github.com/MugiAhlaDzikry"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.visitBtn}
                strength={0.2}
              >
                <span>Follow on GitHub</span>
                <ArrowUpRight size={16} />
              </MagneticButton>
            </div>

            {/* Calendar Heatmap Container */}
            <div className={styles.calendarWrapper} data-lenis-prevent>
              <GitHubCalendar
                username="MugiAhlaDzikry"
                colorScheme={theme === 'dark' ? 'dark' : 'light'}
                theme={customTheme}
                blockSize={13}
                blockMargin={4}
                blockRadius={3}
                fontSize={12}
                showWeekdayLabels={['mon', 'wed', 'fri']}
                labels={{
                  totalCount: '{{count}} kontribusi dalam satu tahun terakhir',
                  legend: {
                    less: 'Sedikit',
                    more: 'Banyak'
                  }
                }}
              />
            </div>

            {/* Stat Pills */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statIconWrap}>
                  <GitCommit size={18} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>100+</span>
                  <span className={styles.statLabel}>Total Contributions</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrap}>
                  <FolderGit2 size={18} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>14</span>
                  <span className={styles.statLabel}>Public Repositories</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrap}>
                  <GitBranch size={18} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>Java & JS/TS</span>
                  <span className={styles.statLabel}>Core Stacks</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
