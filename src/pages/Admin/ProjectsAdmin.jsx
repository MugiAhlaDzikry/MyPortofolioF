import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from '../Admin.module.css';
import ImageCropperModal from '../../components/Admin/ImageCropperModal';

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', full_description: '', tech_stack: '',
    role: '', year: '', live_url: '', github_url: '', sort_order: 0, gallery_urls: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Gallery states
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [saving, setSaving] = useState(false);
  
  // Cropper states
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropTarget, setCropTarget] = useState(null); // 'main' or 'gallery'

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*').order('sort_order', { ascending: true });
    if (data) setProjects(data);
    setLoading(false);
  };

  const handleEdit = (project) => {
    setEditingId(project.id || 'new');
    setFormData({
      ...project,
      tech_stack: project.tech_stack ? project.tech_stack.join(', ') : '',
      gallery_urls: project.gallery_urls || []
    });
    setImageFile(null);
    setImagePreview(project.image_url || null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', full_description: '', tech_stack: '', role: '', year: '', live_url: '', github_url: '', sort_order: 0, gallery_urls: [] });
    setImageFile(null);
    setImagePreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e, target = 'main') => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result);
        setCropTarget(target);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob) => {
    if (cropTarget === 'main') {
      setImageFile(croppedBlob);
      setImagePreview(URL.createObjectURL(croppedBlob));
    } else if (cropTarget === 'gallery') {
      setGalleryFiles([...galleryFiles, croppedBlob]);
      setGalleryPreviews([...galleryPreviews, URL.createObjectURL(croppedBlob)]);
    }
    setShowCropper(false);
    setCropImageSrc(null);
    setCropTarget(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropImageSrc(null);
    setCropTarget(null);
  };

  const handleRemoveGalleryExisting = (index) => {
    const newUrls = [...formData.gallery_urls];
    newUrls.splice(index, 1);
    setFormData({ ...formData, gallery_urls: newUrls });
  };

  const handleRemoveGalleryNew = (index) => {
    const newFiles = [...galleryFiles];
    const newPreviews = [...galleryPreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let imageUrl = formData.image_url;
    let currentGalleryUrls = formData.gallery_urls || [];

    // Upload main image
    if (imageFile) {
      const fileExt = imageFile.type.split('/')[1] || 'jpeg';
      const fileName = `project-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, imageFile);
      if (!uploadError) {
        const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }
    }

    // Upload new gallery images
    if (galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        const fileExt = file.type.split('/')[1] || 'jpeg';
        const fileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, file);
        if (!uploadError) {
          const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
          currentGalleryUrls.push(data.publicUrl);
        }
      }
    }

    const payload = {
      title: formData.title, description: formData.description, full_description: formData.full_description,
      tech_stack: formData.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
      role: formData.role, year: formData.year, live_url: formData.live_url, github_url: formData.github_url,
      sort_order: parseInt(formData.sort_order) || 0, image_url: imageUrl, gallery_urls: currentGalleryUrls
    };

    if (editingId && editingId !== 'new') {
      await supabase.from('projects').update(payload).eq('id', editingId);
    } else {
      await supabase.from('projects').insert(payload);
    }
    setSaving(false);
    handleCancel();
    fetchProjects();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      await supabase.from('projects').delete().eq('id', id);
      fetchProjects();
    }
  };

  if (loading) return <div className={styles.emptyState}>Loading...</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className={styles.pageTitle}>Projects</h1>
            <p className={styles.pageSubtitle}>Manage your portfolio projects and case studies</p>
          </div>
          {!editingId && (
            <button onClick={() => handleEdit({})} className={styles.btnPrimary}>
              + New Project
            </button>
          )}
        </div>
      </div>

      {showCropper && cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          aspect={undefined} // Flexible aspect ratio (auto-detects portrait or landscape)
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {editingId !== null ? (
        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Main Thumbnail (Mendukung Landscape, Portrait, & Foto Penuh)</label>
              <div className={styles.fileUploadArea}>
                {imagePreview && (
                  <div className={`${styles.imagePreview} ${styles.imagePreviewSquare}`}>
                    <img src={imagePreview} alt="Preview" style={{ objectFit: 'contain', background: '#222' }} />
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'main')} className={styles.fileInput} />
                  <p className={styles.fileHint}>Mendukung format Landscape (16:9), Portrait (9:16 / HP), Persegi (1:1), atau Foto Penuh tanpa crop</p>
                </div>
              </div>
            </div>

            {/* Gallery Upload */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Gallery Images (Max 5)</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {/* Existing Gallery Images */}
                {(formData.gallery_urls || []).map((url, i) => (
                  <div key={`exist-${i}`} className={`${styles.imagePreview} ${styles.imagePreviewSquare}`}>
                    <img src={url} alt={`Gallery ${i}`} style={{ objectFit: 'cover' }} />
                    <button type="button" onClick={() => handleRemoveGalleryExisting(i)} className={styles.btnRemoveImage} title="Remove image">×</button>
                  </div>
                ))}
                
                {/* New Gallery Images */}
                {galleryPreviews.map((url, i) => (
                  <div key={`new-${i}`} className={`${styles.imagePreview} ${styles.imagePreviewSquare}`}>
                    <img src={url} alt={`Gallery New ${i}`} style={{ objectFit: 'cover' }} />
                    <button type="button" onClick={() => handleRemoveGalleryNew(i)} className={styles.btnRemoveImage} title="Remove image">×</button>
                  </div>
                ))}
              </div>

              {(formData.gallery_urls?.length || 0) + galleryFiles.length < 5 && (
                <div className={styles.fileUploadArea}>
                  <div>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'gallery')} className={styles.fileInput} />
                    <p className={styles.fileHint}>Add up to {5 - ((formData.gallery_urls?.length || 0) + galleryFiles.length)} more images</p>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.sectionDivider} />

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title</label>
                <input className={styles.formInput} type="text" name="title" value={formData.title || ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup} style={{ maxWidth: '120px' }}>
                <label className={styles.formLabel}>Year</label>
                <input className={styles.formInput} type="text" name="year" value={formData.year || ''} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Role</label>
                <input className={styles.formInput} type="text" name="role" value={formData.role || ''} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Short Description</label>
              <input className={styles.formInput} type="text" name="description" value={formData.description || ''} onChange={handleChange} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Description (Modal)</label>
              <textarea className={styles.formTextarea} name="full_description" value={formData.full_description || ''} onChange={handleChange} rows={4} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tech Stack (comma separated)</label>
              <input className={styles.formInput} type="text" name="tech_stack" value={formData.tech_stack || ''} onChange={handleChange} placeholder="React, Node.js, AWS" />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Live URL</label>
                <input className={styles.formInput} type="text" name="live_url" value={formData.live_url || ''} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>GitHub URL</label>
                <input className={styles.formInput} type="text" name="github_url" value={formData.github_url || ''} onChange={handleChange} />
              </div>
              <div className={styles.formGroup} style={{ maxWidth: '100px' }}>
                <label className={styles.formLabel}>Order</label>
                <input className={styles.formInput} type="number" name="sort_order" value={formData.sort_order || 0} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.btnGroup}>
              <button type="submit" disabled={saving} className={styles.btnPrimary}>
                {saving ? 'Saving...' : 'Save Project'}
              </button>
              <button type="button" onClick={handleCancel} className={styles.btnSecondary}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className={styles.dataList}>
          {projects.map(project => (
            <div key={project.id} className={styles.dataItem}>
              <div className={styles.dataItemInfo}>
                <div className={styles.dataItemTitle}>{project.title}</div>
                <div className={styles.dataItemMeta}>{project.role} · {project.year}</div>
              </div>
              <div className={styles.dataItemActions}>
                <button onClick={() => handleEdit(project)} className={styles.btnEdit}>Edit</button>
                <button onClick={() => handleDelete(project.id)} className={styles.btnDanger}>Delete</button>
              </div>
            </div>
          ))}
          {projects.length === 0 && <div className={styles.emptyState}>No projects yet. Click "+ New Project" to add one.</div>}
        </div>
      )}
    </>
  );
}
