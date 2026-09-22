import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from '../Admin.module.css';

export default function EducationAdmin() {
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    period: '',
    gpa: '',
    description: '',
    highlights: '',
    sort_order: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchEducation(); }, []);

  const fetchEducation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) setEducations(data);
    } catch (e) {
      console.warn('Failed to fetch education:', e);
    }
    setLoading(false);
  };

  const handleEdit = (edu) => {
    setEditingId(edu.id || 'new');
    setFormData({
      institution: edu.institution || '',
      degree: edu.degree || '',
      period: edu.period || '',
      gpa: edu.gpa || '',
      description: edu.description || '',
      highlights: Array.isArray(edu.highlights) ? edu.highlights.join(', ') : (edu.highlights || ''),
      sort_order: edu.sort_order || 0
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      institution: '',
      degree: '',
      period: '',
      gpa: '',
      description: '',
      highlights: '',
      sort_order: 0
    });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      institution: formData.institution,
      degree: formData.degree,
      period: formData.period,
      gpa: formData.gpa,
      description: formData.description,
      highlights: formData.highlights.split(',').map(s => s.trim()).filter(Boolean),
      sort_order: parseInt(formData.sort_order) || 0
    };

    try {
      if (editingId && editingId !== 'new') {
        const { error } = await supabase.from('education').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('education').insert([payload]);
        if (error) throw error;
      }
      handleCancel();
      fetchEducation();
    } catch (err) {
      alert(`Error saving education: ${err.message || 'Make sure the "education" table exists in Supabase.'}`);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this education entry?')) {
      await supabase.from('education').delete().eq('id', id);
      fetchEducation();
    }
  };

  if (loading) return <div className={styles.emptyState}>Loading...</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className={styles.pageTitle}>Education</h1>
            <p className={styles.pageSubtitle}>Manage your academic background and degrees</p>
          </div>
          {!editingId && (
            <button onClick={() => handleEdit({})} className={styles.btnPrimary}>
              + Add Education
            </button>
          )}
        </div>
      </div>

      {editingId !== null ? (
        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Institution / University</label>
                <input
                  className={styles.formInput}
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="e.g. Universitas Indonesia"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Degree / Major</label>
                <input
                  className={styles.formInput}
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g. S1 Teknik Informatika"
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Period / Year</label>
                <input
                  className={styles.formInput}
                  type="text"
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  placeholder="e.g. 2020 — 2024"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>GPA / Honors (Optional)</label>
                <input
                  className={styles.formInput}
                  type="text"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  placeholder="e.g. IPK 3.85 / 4.00 (Cum Laude)"
                />
              </div>
              <div className={styles.formGroup} style={{ maxWidth: '100px' }}>
                <label className={styles.formLabel}>Order</label>
                <input
                  className={styles.formInput}
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                className={styles.formTextarea}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi fokus studi, konsentrasi, atau pencapaian akademis..."
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Key Coursework / Highlights (comma separated)</label>
              <input
                className={styles.formInput}
                type="text"
                name="highlights"
                value={formData.highlights}
                onChange={handleChange}
                placeholder="Software Engineering, Algorithms, Database Systems, Web Tech"
              />
            </div>

            <div className={styles.btnGroup}>
              <button type="submit" disabled={saving} className={styles.btnPrimary}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={handleCancel} className={styles.btnSecondary}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className={styles.dataList}>
          {educations.map(edu => (
            <div key={edu.id} className={styles.dataItem}>
              <div className={styles.dataItemInfo}>
                <div className={styles.dataItemTitle}>{edu.degree}</div>
                <div className={styles.dataItemMeta}>
                  {edu.institution} · {edu.period} {edu.gpa ? `· ${edu.gpa}` : ''}
                </div>
              </div>
              <div className={styles.dataItemActions}>
                <button onClick={() => handleEdit(edu)} className={styles.btnEdit}>Edit</button>
                <button onClick={() => handleDelete(edu.id)} className={styles.btnDanger}>Delete</button>
              </div>
            </div>
          ))}
          {educations.length === 0 && (
            <div className={styles.emptyState}>
              No education entries in database yet (showing default placeholder in portfolio). Click "+ Add Education" to create one.
            </div>
          )}
        </div>
      )}
    </>
  );
}

