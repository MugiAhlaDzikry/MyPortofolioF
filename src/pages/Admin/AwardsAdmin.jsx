import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from '../Admin.module.css';
import ImageCropperModal from '../../components/Admin/ImageCropperModal';

export default function AwardsAdmin() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', organization: '', year: '', description: '', sort_order: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cropper states
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  useEffect(() => { fetchAwards(); }, []);

  const fetchAwards = async () => {
    setLoading(true);
    const { data } = await supabase.from('awards').select('*').order('sort_order', { ascending: true });
    if (data) setAwards(data);
    setLoading(false);
  };

  const handleEdit = (awd) => {
    setEditingId(awd.id || 'new');
    setFormData(awd);
    setImageFile(null);
    setImagePreview(awd.image_url || null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: '', organization: '', year: '', description: '', sort_order: 0 });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob) => {
    setImageFile(croppedBlob);
    setImagePreview(URL.createObjectURL(croppedBlob));
    setShowCropper(false);
    setCropImageSrc(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropImageSrc(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image_url: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let imageUrl = formData.image_url || null;

    // Upload image if new file selected
    if (imageFile) {
      const fileExt = imageFile.type.split('/')[1] || 'jpeg';
      const fileName = `award-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, imageFile);
      if (!uploadError) {
        const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }
    }

    const payload = {
      title: formData.title, organization: formData.organization,
      year: formData.year, description: formData.description,
      sort_order: parseInt(formData.sort_order) || 0,
      image_url: imageUrl
    };

    if (editingId && editingId !== 'new') {
      await supabase.from('awards').update(payload).eq('id', editingId);
    } else {
      await supabase.from('awards').insert([payload]);
    }
    setSaving(false);
    handleCancel();
    fetchAwards();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this award?')) {
      await supabase.from('awards').delete().eq('id', id);
      fetchAwards();
    }
  };

  if (loading) return <div className={styles.emptyState}>Loading...</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className={styles.pageTitle}>Awards & Certifications</h1>
            <p className={styles.pageSubtitle}>Manage your achievements and recognitions</p>
          </div>
          {!editingId && (
            <button onClick={() => handleEdit({})} className={styles.btnPrimary}>
              + Add Award
            </button>
          )}
        </div>
      </div>

      {showCropper && cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          aspect={16 / 9}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {editingId !== null ? (
        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            {/* Certificate Image Upload */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Certificate / Document Image (16:9)</label>
              <div className={styles.fileUploadArea}>
                {imagePreview && (
                  <div className={`${styles.imagePreview} ${styles.imagePreviewSquare}`}>
                    <img src={imagePreview} alt="Preview" />
                    <button type="button" onClick={handleRemoveImage} className={styles.btnRemoveImage} title="Remove image">×</button>
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
                  <p className={styles.fileHint}>Upload a certificate, diploma, or award document image</p>
                </div>
              </div>
            </div>

            <div className={styles.sectionDivider} />

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title</label>
                <input className={styles.formInput} type="text" name="title" value={formData.title || ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Organization</label>
                <input className={styles.formInput} type="text" name="organization" value={formData.organization || ''} onChange={handleChange} required />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup} style={{ maxWidth: '120px' }}>
                <label className={styles.formLabel}>Year</label>
                <input className={styles.formInput} type="text" name="year" value={formData.year || ''} onChange={handleChange} required />
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
            <div className={styles.btnGroup}>
              <button type="submit" disabled={saving} className={styles.btnPrimary}>{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={handleCancel} className={styles.btnSecondary}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className={styles.dataList}>
          {awards.map(awd => (
            <div key={awd.id} className={styles.dataItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {awd.image_url && (
                  <img
                    src={awd.image_url}
                    alt={awd.title}
                    style={{
                      width: '64px', height: '36px', objectFit: 'cover',
                      borderRadius: '6px', border: '1px solid var(--admin-border)',
                      flexShrink: 0
                    }}
                  />
                )}
                <div className={styles.dataItemInfo}>
                  <div className={styles.dataItemTitle}>{awd.title}</div>
                  <div className={styles.dataItemMeta}>{awd.organization} · {awd.year}</div>
                </div>
              </div>
              <div className={styles.dataItemActions}>
                <button onClick={() => handleEdit(awd)} className={styles.btnEdit}>Edit</button>
                <button onClick={() => handleDelete(awd.id)} className={styles.btnDanger}>Delete</button>
              </div>
            </div>
          ))}
          {awards.length === 0 && <div className={styles.emptyState}>No awards yet.</div>}
        </div>
      )}
    </>
  );
}
