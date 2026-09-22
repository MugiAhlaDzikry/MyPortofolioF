import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from '../Admin.module.css';
import ImageCropperModal from '../../components/Admin/ImageCropperModal';

// Helper to determine if a URL/file is video
const isVideo = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) || url.startsWith('data:video/');
};

export default function HeroAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Layer 1
  const [imageFile1, setImageFile1] = useState(null);
  const [mediaPreview1, setMediaPreview1] = useState(null);

  // Layer 2
  const [imageFile2, setImageFile2] = useState(null);
  const [mediaPreview2, setMediaPreview2] = useState(null);
  
  // Cropper states
  const [showCropper, setShowCropper] = useState(false);
  const [cropTargetLayer, setCropTargetLayer] = useState(1);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  useEffect(() => { fetchHero(); }, []);

  const fetchHero = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('hero').select('*').eq('id', 1).single();
    if (data) setData(data);
    if (error && error.code !== 'PGRST116') console.error(error);
    setLoading(false);
  };

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  // Handle Layer 1 File
  const handleMediaChange1 = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        setImageFile1(file);
        setMediaPreview1(URL.createObjectURL(file));
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setCropTargetLayer(1);
          setCropImageSrc(reader.result);
          setShowCropper(true);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle Layer 2 File
  const handleMediaChange2 = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        setImageFile2(file);
        setMediaPreview2(URL.createObjectURL(file));
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setCropTargetLayer(2);
          setCropImageSrc(reader.result);
          setShowCropper(true);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCropComplete = (croppedBlob) => {
    if (cropTargetLayer === 1) {
      setImageFile1(croppedBlob);
      setMediaPreview1(URL.createObjectURL(croppedBlob));
    } else {
      setImageFile2(croppedBlob);
      setMediaPreview2(URL.createObjectURL(croppedBlob));
    }
    setShowCropper(false);
    setCropImageSrc(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropImageSrc(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    let profileImageUrl = data.profile_image_url || '';
    let profileSecondaryUrl = data.profile_secondary_url || '';

    // Upload Layer 1 if new file chosen
    if (imageFile1) {
      const fileExt = imageFile1.name ? imageFile1.name.split('.').pop() : 'png';
      const fileName = `profile-layer1-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, imageFile1);
      if (uploadError) {
        setMessage('Error uploading Layer 1: ' + uploadError.message);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
      profileImageUrl = urlData.publicUrl;
    }

    // Upload Layer 2 if new file chosen
    if (imageFile2) {
      const fileExt = imageFile2.name ? imageFile2.name.split('.').pop() : 'png';
      const fileName = `profile-layer2-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, imageFile2);
      if (uploadError) {
        setMessage('Error uploading Layer 2: ' + uploadError.message);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
      profileSecondaryUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('hero').upsert({
      id: 1,
      name: data.name,
      role_primary: data.role_primary,
      role_secondary: data.role_secondary,
      description: data.description,
      github_url: data.github_url,
      linkedin_url: data.linkedin_url,
      email: data.email,
      profile_image_url: profileImageUrl,
      profile_secondary_url: profileSecondaryUrl,
    });

    if (error) setMessage('Error: ' + error.message);
    else {
      setMessage('Hero updated successfully!');
      setImageFile1(null);
      setMediaPreview1(null);
      setImageFile2(null);
      setMediaPreview2(null);
      fetchHero();
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div className={styles.emptyState}>Loading...</div>;

  const currentPreview1 = mediaPreview1 || data?.profile_image_url;
  const currentPreview2 = mediaPreview2 || data?.profile_secondary_url;

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Hero Section</h1>
        <p className={styles.pageSubtitle}>Manage your profile photo/video (2 layers), info, and links</p>
      </div>

      {showCropper && cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          aspect={1} // 1:1 aspect ratio for profile picture
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {message && (
        <div className={message.includes('Error') ? styles.messageError : styles.messageSuccess}>
          {message}
        </div>
      )}

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          
          {/* Profile Layer 1 (Primary Photo or Video) */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Profile Media 1 (Layer 1 — Main Photo or Moving Video)
            </label>
            <div className={styles.fileUploadArea}>
              <div className={styles.imagePreview}>
                {currentPreview1 && (
                  isVideo(currentPreview1) ? (
                    <video src={currentPreview1} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={currentPreview1} alt="Layer 1" />
                  )
                )}
              </div>
              <div>
                <input 
                  type="file" 
                  accept="image/*,video/mp4,video/webm,video/quicktime" 
                  onChange={handleMediaChange1} 
                  className={styles.fileInput} 
                />
                <p className={styles.fileHint}>Support: JPG, PNG, GIF, MP4, WebM (Auto-plays seamlessly)</p>
              </div>
            </div>
            <input 
              type="text" 
              name="profile_image_url" 
              placeholder="Or paste Direct Media URL (Image/Video)" 
              value={data?.profile_image_url || ''} 
              onChange={handleChange} 
              className={styles.formInput} 
              style={{ marginTop: '0.5rem' }} 
            />
          </div>

          {/* Profile Layer 2 (Secondary Photo or Video — Click to Switch) */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Profile Media 2 (Layer 2 — Secondary Photo/Video on Click)
            </label>
            <div className={styles.fileUploadArea}>
              <div className={styles.imagePreview}>
                {currentPreview2 && (
                  isVideo(currentPreview2) ? (
                    <video src={currentPreview2} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={currentPreview2} alt="Layer 2" />
                  )
                )}
              </div>
              <div>
                <input 
                  type="file" 
                  accept="image/*,video/mp4,video/webm,video/quicktime" 
                  onChange={handleMediaChange2} 
                  className={styles.fileInput} 
                />
                <p className={styles.fileHint}>Optional: When visitors click your profile circle, it flips to this media!</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input 
                type="text" 
                name="profile_secondary_url" 
                placeholder="Or paste Direct Media URL for Layer 2" 
                value={data?.profile_secondary_url || ''} 
                onChange={handleChange} 
                className={styles.formInput} 
              />
              {data?.profile_secondary_url && (
                <button 
                  type="button" 
                  onClick={() => setData({ ...data, profile_secondary_url: '' })}
                  className={styles.btnSecondary}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Clear Layer 2
                </button>
              )}
            </div>
          </div>

          <div className={styles.sectionDivider} />

          {/* Name */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Full Name</label>
            <input className={styles.formInput} type="text" name="name" value={data?.name || ''} onChange={handleChange} required />
          </div>

          {/* Roles */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Primary Role</label>
              <input className={styles.formInput} type="text" name="role_primary" value={data?.role_primary || ''} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Secondary Role</label>
              <input className={styles.formInput} type="text" name="role_secondary" value={data?.role_secondary || ''} onChange={handleChange} required />
            </div>
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Bio / Description</label>
            <textarea className={styles.formTextarea} name="description" value={data?.description || ''} onChange={handleChange} required rows={5} />
          </div>

          <div className={styles.sectionDivider} />

          {/* Social Links */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>GitHub URL</label>
            <input className={styles.formInput} type="text" name="github_url" value={data?.github_url || ''} onChange={handleChange} placeholder="https://github.com/username" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>LinkedIn URL</label>
              <input className={styles.formInput} type="text" name="linkedin_url" value={data?.linkedin_url || ''} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email (mailto:)</label>
              <input className={styles.formInput} type="text" name="email" value={data?.email || ''} onChange={handleChange} placeholder="mailto:you@email.com" />
            </div>
          </div>

          <div className={styles.btnGroup}>
            <button type="submit" disabled={saving} className={styles.btnPrimary}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
