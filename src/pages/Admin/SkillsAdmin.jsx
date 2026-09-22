import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import TechIcon from '../../components/TechIcon';
import styles from '../Admin.module.css';

export default function SkillsAdmin() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', category: 'Frontend' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    setLoading(true);
    const { data } = await supabase.from('skills').select('*').order('created_at', { ascending: true });
    if (data) setSkills(data);
    setLoading(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('skills').insert([formData]);
    if (error) alert(error.message);
    else {
      setFormData({ name: '', category: 'Frontend' });
      fetchSkills();
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this skill?')) {
      await supabase.from('skills').delete().eq('id', id);
      fetchSkills();
    }
  };

  if (loading) return <div className={styles.emptyState}>Loading...</div>;

  // Group skills by category
  const grouped = skills.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Skills</h1>
        <p className={styles.pageSubtitle}>Manage your technical skills and expertise</p>
      </div>

      {/* Add Skill Form */}
      <form onSubmit={handleSubmit} className={styles.addFormInline}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Skill Name</label>
          <input className={styles.formInput} type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. React" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Category</label>
          <select className={styles.formSelect} name="category" value={formData.category} onChange={handleChange}>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Tools">Tools</option>
            <option value="Design">Design</option>
          </select>
        </div>
        <button type="submit" disabled={saving} className={styles.btnPrimary} style={{ flexShrink: 0, height: 'fit-content' }}>
          {saving ? 'Adding...' : '+ Add Skill'}
        </button>
      </form>

      {/* Skills by Category */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} style={{ marginBottom: '1.5rem' }}>
          <p className={styles.formLabel} style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>
            {category} ({items.length})
          </p>
          <div className={styles.skillGrid}>
            {items.map(skill => (
              <div key={skill.id} className={styles.skillItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <TechIcon name={skill.name} size={18} />
                  <div className={styles.skillName}>{skill.name}</div>
                </div>
                <button onClick={() => handleDelete(skill.id)} className={styles.skillDeleteBtn} title="Delete">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {skills.length === 0 && <div className={styles.emptyState}>No skills added yet.</div>}
    </>
  );
}
