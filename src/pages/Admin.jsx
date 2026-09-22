import { useState } from 'react';
import CustomCursor from '../components/Layout/CustomCursor';
import HeroAdmin from './Admin/HeroAdmin';
import SkillsAdmin from './Admin/SkillsAdmin';
import ProjectsAdmin from './Admin/ProjectsAdmin';
import ExperienceAdmin from './Admin/ExperienceAdmin';
import AwardsAdmin from './Admin/AwardsAdmin';
import EducationAdmin from './Admin/EducationAdmin';
import styles from './Admin.module.css';

const tabs = [
  { id: 'hero', label: 'Hero Section', icon: '⬡' },
  { id: 'skills', label: 'Skills', icon: '◇' },
  { id: 'projects', label: 'Projects', icon: '▦' },
  { id: 'experience', label: 'Experience', icon: '◈' },
  { id: 'awards', label: 'Awards', icon: '★' },
  { id: 'education', label: 'Education', icon: '🎓' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('hero');

  const renderContent = () => {
    switch (activeTab) {
      case 'hero': return <HeroAdmin />;
      case 'skills': return <SkillsAdmin />;
      case 'projects': return <ProjectsAdmin />;
      case 'experience': return <ExperienceAdmin />;
      case 'awards': return <AwardsAdmin />;
      case 'education': return <EducationAdmin />;
      default: return null;
    }
  };

  return (
    <>
      <CustomCursor />
      <div className={styles.adminLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarBrand}>
            <div className={styles.brandIcon}>PA</div>
            <div>
              <div className={styles.brandText}>Portfolio</div>
              <div className={styles.brandSub}>Admin Panel</div>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <a href="/" className={styles.backLink}>
              ← Back to Portfolio
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {renderContent()}
        </main>
      </div>
    </>
  );
}
