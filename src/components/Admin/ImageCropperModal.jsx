import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg, { createImage } from '../../utils/cropImage';

const ASPECT_RATIOS = [
  { label: '16:9 (Web)', value: 16 / 9 },
  { label: '9:16 (Portrait / HP)', value: 9 / 16 },
  { label: '3:4 (Portrait)', value: 3 / 4 },
  { label: '4:3 (Standar)', value: 4 / 3 },
  { label: '1:1 (Persegi)', value: 1 / 1 },
  { label: 'Bebas (Free)', value: undefined },
];

export default function ImageCropperModal({ imageSrc, aspect, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [selectedAspect, setSelectedAspect] = useState(aspect);

  // Auto-detect image dimensions to suggest portrait vs landscape aspect
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      const isPortrait = img.naturalHeight > img.naturalWidth * 1.15;
      if (isPortrait) {
        // If image is portrait (like mobile app screenshot), auto-select 9:16 or 3:4
        setSelectedAspect(img.naturalHeight / img.naturalWidth >= 1.7 ? 9 / 16 : 3 / 4);
      } else if (aspect !== undefined) {
        setSelectedAspect(aspect);
      } else {
        setSelectedAspect(16 / 9);
      }
    };
    img.src = imageSrc;
  }, [imageSrc, aspect]);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Normal Crop and Save
  const handleSave = async () => {
    try {
      setProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (e) {
      console.error(e);
      alert('Error cropping image');
    } finally {
      setProcessing(false);
    }
  };

  // Direct Save without any cropping (Use 100% full original image)
  const handleUseOriginal = async () => {
    try {
      setProcessing(true);
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      onCropComplete(blob);
    } catch (e) {
      console.error('Direct fetch failed, falling back to canvas', e);
      try {
        const img = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            onCropComplete(blob);
          } else {
            alert('Gagal memproses gambar asli');
          }
        }, 'image/png');
      } catch (canvasErr) {
        alert('Gagal menggunakan gambar asli: ' + canvasErr.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px', backdropFilter: 'blur(8px)'
    }}>
      {/* Aspect Ratio Toolbar */}
      <div style={{
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <span style={{ color: '#aaa', fontSize: '0.82rem', fontWeight: 600, marginRight: '4px' }}>
          Aspek Rasio:
        </span>
        {ASPECT_RATIOS.map((item) => {
          const isActive = selectedAspect === item.value;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setSelectedAspect(item.value)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: isActive ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.15)',
                background: isActive ? '#6366f1' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 12px rgba(99,102,241,0.4)' : 'none'
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Cropper Viewport */}
      <div style={{
        position: 'relative',
        width: '90%',
        maxWidth: '850px',
        height: '65vh',
        background: '#18181b',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={selectedAspect}
          onCropChange={setCrop}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={setZoom}
          objectFit="contain"
        />
      </div>

      {/* Bottom Controls */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#888', fontSize: '0.75rem' }}>Zoom</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.05}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: '140px', accentColor: '#6366f1', cursor: 'pointer' }}
          />
        </div>

        {/* Use Full Original Button (No Crop) */}
        <button
          type="button"
          onClick={handleUseOriginal}
          disabled={processing}
          title="Gunakan seluruh gambar tanpa dipotong sama sekali"
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 10px rgba(16,185,129,0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          {processing ? 'Memproses...' : '✓ Pakai Foto Penuh (Tanpa Crop)'}
        </button>

        {/* Crop & Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={processing}
          style={{
            padding: '8px 18px',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem',
            boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          {processing ? 'Cropping...' : 'Crop Sesuai Pilihan'}
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          style={{
            padding: '8px 14px',
            background: 'transparent',
            color: '#bbb',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.82rem',
            transition: 'all 0.2s ease'
          }}
        >
          Batal
        </button>
      </div>
    </div>
  );
}
