import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from '../Admin.module.css';

export default function ExperienceAdmin() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    company: '', position: '', period: '', description: '', technologies: '', sort_order: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchExperience(); }, []);

  const fetchExperience = async () => {
    setLoading(true);
    const { data } = await supabase.from('experience').select('*').order('sort_order', { ascending: true });
    if (data) setExperiences(data);
    setLoading(false);
  };

  const handleEdit = (exp) => {
    setEditingId(exp.id || 'new');
    setFormData({
      ...exp,
      technologies: exp.technologies ? exp.technologies.join(', ') : ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ company: '', position: '', period: '', description: '', technologies: '', sort_order: 0 });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      company: formData.company, position: formData.position, period: formData.period,
      description: formData.description,
      technologies: formData.technologies.split(',').map(s => s.trim()).filter(Boolean),
      sort_order: parseInt(formData.sort_order) || 0
    };

    if (editingId && editingId !== 'new') {
      await supabase.from('experience').update(payload).eq('id', editingId);
    } else {
      await supabase.from('experience').insert([payload]);
    }
    setSaving(false);
    handleCancel();
    fetchExperience();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this experience?')) {
      await supabase.from('experience').delete().eq('id', id);
      fetchExperience();
    }
  };

  if (loading) return <div className={styles.emptyState}>Loading...</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className={styles.pageTitle}>Experience</h1>
            <p className={styles.pageSubtitle}>Manage your work history and career timeline</p>
          </div>
          {!editingId && (
            <button onClick={() => handleEdit({})} className={styles.btnPrimary}>
              + Add Experience
            </button>
          )}
        </div>
      </div>

      {editingId !== null ? (
        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Company</label>
                <input className={styles.formInput} type="text" name="company" value={formData.company || ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Position</label>
                <input className={styles.formInput} type="text" name="position" value={formData.position || ''} onChange={handleChange} required />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Period</label>
                <input className={styles.formInput} type="text" name="period" value={formData.period || ''} onChange={handleChange} required placeholder="2022 — Present" />
              </div>
              <div className={styles.formGroup} style={{ maxWidth: '100px' }}>
                <label className={styles.formLabel}>Order</label>
                <input className={styles.formInput} type="number" name="sort_order" value={formData.sort_order || 0} onChange={handleChange} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea className={styles.formTextarea} name="description" value={formData.description || ''} onChange={handleChange} required rows={3} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Technologies (comma separated)</label>
              <input className={styles.formInput} type="text" name="technologies" value={formData.technologies || ''} onChange={handleChange} placeholder="React, Node.js, AWS" />
            </div>
            <div className={styles.btnGroup}>
              <button type="submit" disabled={saving} className={styles.btnPrimary}>{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={handleCancel} className={styles.btnSecondary}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className={styles.dataList}>
          {experiences.map(exp => (
            <div key={exp.id} className={styles.dataItem}>
              <div className={styles.dataItemInfo}>
                <div className={styles.dataItemTitle}>{exp.position}</div>
                <div className={styles.dataItemMeta}>{exp.company} · {exp.period}</div>
              </div>
              <div className={styles.dataItemActions}>
                <button onClick={() => handleEdit(exp)} className={styles.btnEdit}>Edit</button>
                <button onClick={() => handleDelete(exp.id)} className={styles.btnDanger}>Delete</button>
              </div>
            </div>
          ))}
          {experiences.length === 0 && <div className={styles.emptyState}>No experience entries yet.</div>}
        </div>
      )}
    </>
  );
}
