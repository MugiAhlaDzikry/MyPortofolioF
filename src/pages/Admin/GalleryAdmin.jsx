import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from '../Admin.module.css';
import ImageCropperModal from '../../components/Admin/ImageCropperModal';
import { DEFAULT_ACTIVITIES } from '../../sections/Gallery';

const SLOT_NAMES = [
  'Kolom 1 - Atas (10×12″ Landscape)',
  'Kolom 1 - Bawah (12×16″ Portrait)',
  'Kolom 2 - Atas (12×16″ Portrait)',
  'Kolom 2 - Bawah (10×12″ Landscape)',
  'Kolom 3 - Atas (10×12″ Landscape)',
  'Kolom 3 - Bawah (12×16″ Portrait)',
  'Kolom 4 - Atas (12×16″ Portrait)',
  'Kolom 4 - Bawah (10×12″ Landscape)',
];

export default function GalleryAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    format: 'landscape',
    date: '',
    location: '',
    description: '',
    sort_order: 1,
    image_url: null
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(true);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Cropper states
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    let loadedItems = null;

    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        loadedItems = data;
        setSupabaseConnected(true);
      } else if (error) {
        setSupabaseConnected(false);
      }
    } catch {
      setSupabaseConnected(false);
    }

    if (!loadedItems) {
      const local = localStorage.getItem('portfolio_gallery');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedItems = parsed;
          }
        } catch {
          // ignore
        }
      }
    }

    setItems(loadedItems || DEFAULT_ACTIVITIES);
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id || 'new');
    setFormData({
      title: item.title || '',
      category: item.category || 'Hackathon',
      format: item.format || 'landscape',
      date: item.date || '',
      location: item.location || '',
      description: item.description || '',
      sort_order: item.sort_order || (items.length + 1),
      image_url: item.image_url || null
    });
    setImageFile(null);
    setImagePreview(item.image_url || null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: '',
      format: 'landscape',
      date: '',
      location: '',
      description: '',
      sort_order: 1,
      image_url: null
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

    // Upload to Supabase Storage if file is provided
    if (imageFile) {
      try {
        const fileExt = imageFile.type.split('/')[1] || 'jpeg';
        const fileName = `gallery-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(fileName, imageFile);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('portfolio-images')
            .getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        } else {
          // If upload fails, create data URL or local object URL
          imageUrl = imagePreview;
        }
      } catch {
        imageUrl = imagePreview;
      }
    }

    const payload = {
      title: formData.title,
      category: formData.category,
      format: formData.format,
      date: formData.date,
      location: formData.location,
      description: formData.description,
      sort_order: parseInt(formData.sort_order, 10) || 1,
      image_url: imageUrl
    };

    let updatedList = [...items];

    // Attempt save to Supabase
    let savedToSupabase = false;
    try {
      if (editingId && editingId !== 'new') {
        const { error } = await supabase
          .from('gallery')
          .update(payload)
          .eq('id', editingId);
        if (!error) savedToSupabase = true;
      } else {
        const { error } = await supabase
          .from('gallery')
          .insert([payload]);
        if (!error) savedToSupabase = true;
      }
    } catch {
      savedToSupabase = false;
    }

    // Always update local cache & localStorage
    if (editingId && editingId !== 'new') {
      updatedList = updatedList.map((it) => (it.id === editingId ? { ...it, ...payload } : it));
    } else {
      updatedList.push({ ...payload, id: Date.now() });
    }

    // Sort by sort_order
    updatedList.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    setItems(updatedList);
    localStorage.setItem('portfolio_gallery', JSON.stringify(updatedList));

    setSaving(false);
    handleCancel();
    if (savedToSupabase) fetchGallery();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus foto kegiatan ini dari galeri?')) {
      try {
        await supabase.from('gallery').delete().eq('id', id);
      } catch {
        // ignore
      }
      const filtered = items.filter((it) => it.id !== id);
      setItems(filtered);
      localStorage.setItem('portfolio_gallery', JSON.stringify(filtered));
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan galeri ke 8 foto kegiatan kurasi default (The Balanced)?')) {
      setItems(DEFAULT_ACTIVITIES);
      localStorage.setItem('portfolio_gallery', JSON.stringify(DEFAULT_ACTIVITIES));
      alert('Galeri berhasil dikembalikan ke data kurasi default!');
    }
  };

  const sqlSnippet = `-- Jalankan di SQL Editor Supabase untuk sinkronisasi cloud
CREATE TABLE IF NOT EXISTS public.gallery (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  format TEXT DEFAULT 'landscape',
  date TEXT,
  location TEXT,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public Insert" ON public.gallery FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.gallery FOR UPDATE USING (true);
CREATE POLICY "Public Delete" ON public.gallery FOR DELETE USING (true);
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (loading) return <div className={styles.emptyState}>Memuat data galeri...</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className={styles.pageTitle}>Activity Gallery (The Balanced)</h1>
            <p className={styles.pageSubtitle}>
              Kelola 8 foto kegiatan besar dengan tata letak &quot;The Balanced&quot; (4 kolom × 2 baris alternating)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleResetToDefault}
              className={styles.btnSecondary}
              style={{ fontSize: '0.85rem' }}
            >
              ↺ Reset Default
            </button>
            {!editingId && (
              <button onClick={() => handleEdit({})} className={styles.btnPrimary}>
                + Tambah Foto
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Supabase status banner */}
      {!supabaseConnected && (
        <div style={{
          background: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: 'var(--admin-text)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#EAB308' }}>Mode Sinkronisasi Lokal Aktif:</strong> Tabel Supabase <code>public.gallery</code> belum dibuat di cloud. Perubahan Anda tetap tersimpan dan berfungsi sempurna via penyimpanan lokal browser.
            </div>
            <button
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className={styles.btnSecondary}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              {showSqlGuide ? 'Tutup Panduan SQL' : 'Buat Tabel di Supabase'}
            </button>
          </div>

          {showSqlGuide && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(234, 179, 8, 0.2)' }}>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Salin query SQL berikut dan jalankan di menu <strong>SQL Editor</strong> di dashboard Supabase Anda:
              </p>
              <pre style={{
                background: '#0D0D12',
                color: '#34D399',
                padding: '0.85rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                overflowX: 'auto',
                fontFamily: 'monospace'
              }}>
                {sqlSnippet}
              </pre>
              <button
                onClick={copySql}
                className={styles.btnPrimary}
                style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
              >
                {copiedSql ? '✓ Tersalin ke Clipboard' : '📋 Salin Script SQL'}
              </button>
            </div>
          )}
        </div>
      )}

      {showCropper && cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          aspect={formData.format === 'portrait' ? 3 / 4 : 4 / 3}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {editingId !== null ? (
        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            {/* Foto Kegiatan */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Foto Kegiatan ({formData.format === 'portrait' ? 'Portrait 12×16″ / 3:4' : 'Landscape 10×12″ / 4:3'})
              </label>
              <div className={styles.fileUploadArea}>
                {imagePreview && (
                  <div className={`${styles.imagePreview} ${styles.imagePreviewSquare}`}>
                    <img src={imagePreview} alt="Preview" style={{ objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className={styles.btnRemoveImage}
                      title="Hapus foto"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                  />
                  <p className={styles.fileHint}>
                    Pilih foto dokumentasi kegiatan beresolusi tinggi (JPG/PNG/WebP).
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.sectionDivider} />

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Judul Kegiatan</label>
                <input
                  className={styles.formInput}
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="contoh: National Tech Hackathon 2024"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Kategori / Badge</label>
                <input
                  className={styles.formInput}
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="contoh: Hackathon, Conference, Workshop"
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Format Bingkai (The Balanced)</label>
                <select
                  className={styles.formSelect}
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                >
                  <option value="landscape">10×12″ Landscape (Lebar)</option>
                  <option value="portrait">12×16″ Portrait (Tinggi)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Urutan Slot (1 - 8)</label>
                <input
                  className={styles.formInput}
                  type="number"
                  name="sort_order"
                  min="1"
                  max="12"
                  value={formData.sort_order}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Waktu / Tanggal</label>
                <input
                  className={styles.formInput}
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  placeholder="contoh: Oktober 2024"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Lokasi / Tempat</label>
                <input
                  className={styles.formInput}
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="contoh: Jakarta Convention Center"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Deskripsi / Cerita Kegiatan</label>
              <textarea
                className={styles.formTextarea}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ceritakan peran, pencapaian, dan dampak dari kegiatan besar ini..."
                rows={3}
                required
              />
            </div>

            <div className={styles.btnGroup}>
              <button type="submit" disabled={saving} className={styles.btnPrimary}>
                {saving ? 'Menyimpan...' : 'Simpan Foto'}
              </button>
              <button type="button" onClick={handleCancel} className={styles.btnSecondary}>
                Batal
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className={styles.dataList}>
          {items.map((item, idx) => {
            const slotTitle = SLOT_NAMES[idx] || `Slot ${idx + 1}`;
            return (
              <div key={item.id || idx} className={styles.dataItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      style={{
                        width: item.format === 'portrait' ? '45px' : '65px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid var(--admin-border)',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <div className={styles.dataItemInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontFamily: 'monospace',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10B981',
                        fontWeight: 600
                      }}>
                        {slotTitle}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>
                        #{item.sort_order || (idx + 1)}
                      </span>
                    </div>
                    <div className={styles.dataItemTitle}>{item.title}</div>
                    <div className={styles.dataItemMeta}>
                      {item.category} · {item.date || 'Tanggal -'} · {item.location || 'Lokasi -'}
                    </div>
                  </div>
                </div>
                <div className={styles.dataItemActions}>
                  <button onClick={() => handleEdit(item)} className={styles.btnEdit}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className={styles.btnDanger}>
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className={styles.emptyState}>
              Belum ada foto kegiatan. Klik tombol <strong>+ Tambah Foto</strong> atau <strong>Reset Default</strong>.
            </div>
          )}
        </div>
      )}
    </>
  );
}
