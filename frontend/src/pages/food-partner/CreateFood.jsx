
import React, { useEffect, useRef, useState } from 'react';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Film, ArrowLeft, Sparkles, IndianRupee } from 'lucide-react';

const CreateFood = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState('');
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!videoFile) { setVideoURL(''); return; }
    const url = URL.createObjectURL(videoFile);
    setVideoURL(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) { setVideoFile(null); setFileError(''); return; }
    if (!file.type.startsWith('video/')) { setFileError('Please select a valid video file.'); return; }
    if (file.size > 100 * 1024 * 1024) { setFileError('File size must be under 100MB.'); return; }
    setFileError('');
    setVideoFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { setFileError('Please drop a valid video file.'); return; }
    if (file.size > 100 * 1024 * 1024) { setFileError('File size must be under 100MB.'); return; }
    setFileError('');
    setVideoFile(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !videoFile || !price) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('mama', videoFile);
      const response = await API.post('/api/food', formData);
      const partnerId = response.data.food?.foodPartner?._id || response.data.food?.foodPartner;
      navigate(partnerId ? `/food-partner/profile/${partnerId}` : '/');
    } catch (error) {
      setFileError(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const isDisabled = !name.trim() || !videoFile || !price || uploading;

  const s = {
    root: {
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FDF8F5',
      fontFamily: "'Inter', 'Poppins', sans-serif",
      overflow: 'hidden',
    
    },
    bgGradient: {
      position: 'absolute', inset: 0,
      background: 'linear-gradient(160deg, #FFE4E1 0%, #FDF8F5 50%, #D1FAE5 100%)',
    },
    blob1: {
      position: 'absolute', width: 400, height: 400,
      top: -120, right: -100, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,126,126,0.25) 0%, transparent 70%)',
      animation: 'blob1 10s ease-in-out infinite', pointerEvents: 'none',
    },
    blob2: {
      position: 'absolute', width: 350, height: 350,
      bottom: -50, left: -80, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
      animation: 'blob2 12s ease-in-out infinite', pointerEvents: 'none',
    },
    header: {
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(253,248,245,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
    },
    backBtn: {
      width: 38, height: 38, borderRadius: '50%',
      background: 'rgba(255,255,255,0.85)',
      border: '1px solid rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'background 0.2s ease',
    },
    headerTitle: {
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 17, fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.3px',
    },
    headerSub: { fontSize: 12, color: '#999', margin: 0 },
   
    content: {
  position: 'relative', zIndex: 10,
  flex: 1,
  padding: '150px 20px 12px',
  display: 'flex', flexDirection: 'column', gap: 10,
},  



    sectionLabel: {
      fontSize: 11, fontWeight: 700, letterSpacing: 1,
      color: '#999', textTransform: 'uppercase', marginBottom: 8,
      display: 'block',
    },
    dropZone: (active) => ({
      borderRadius: 20,
      border: `2px dashed ${active ? '#E23744' : 'rgba(226,55,68,0.25)'}`,
      background: active ? 'rgba(226,55,68,0.05)' : 'rgba(255,255,255,0.7)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      transform: active ? 'scale(1.02)' : 'scale(1)',
    }),
    dropZoneInner: {
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    },
    uploadIconBox: (active) => ({
      width: 72, height: 72, borderRadius: '50%',
      background: active ? 'rgba(226,55,68,0.15)' : '#FFF0F0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 14, transition: 'background 0.2s ease',
    }),
    dropTitle: { fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' },
    dropSub: { fontSize: 13, color: '#999', margin: '0 0 14px' },
    formatPills: { display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
    formatPill: {
      padding: '4px 10px', borderRadius: 999,
      background: 'rgba(226,55,68,0.08)', color: '#E23744',
      fontSize: 11, fontWeight: 600,
    },
    videoWrap: {
      position: 'relative', borderRadius: 20, overflow: 'hidden',
      background: 'rgba(255,255,255,0.7)',
      border: '1px solid rgba(0,0,0,0.08)',
    },
    videoEl: { width: '100%', maxHeight: 360, objectFit: 'contain', display: 'block' },
    removeBtn: {
      position: 'absolute', top: 12, right: 12,
      width: 32, height: 32, borderRadius: '50%',
      background: 'rgba(255,255,255,0.9)',
      border: '1px solid rgba(0,0,0,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'background 0.2s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    videoMeta: {
      position: 'absolute', bottom: 12, left: 12, right: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    videoName: {
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
      borderRadius: 10, padding: '6px 12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    videoSize: {
      background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
      borderRadius: 10, padding: '6px 12px', fontSize: 13, color: '#666',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    input: {
      width: '100%', padding: '13px 16px', borderRadius: 14,
      border: '1px solid rgba(0,0,0,0.1)',
      background: 'rgba(255,255,255,0.85)',
      color: '#1A1A1A', fontSize: 14, outline: 'none',
      boxSizing: 'border-box',
      transition: 'border 0.2s ease, box-shadow 0.2s ease',
    },
    priceWrap: { position: 'relative' },
    rupeeSign: {
      position: 'absolute', left: 14, top: '50%',
      transform: 'translateY(-50%)',
      color: '#999', fontWeight: 600, fontSize: 15, pointerEvents: 'none',
    },
    priceInput: {
      width: '100%', padding: '13px 16px 13px 34px', borderRadius: 14,
      border: '1px solid rgba(0,0,0,0.1)',
      background: 'rgba(255,255,255,0.85)',
      color: '#1A1A1A', fontSize: 14, outline: 'none',
      boxSizing: 'border-box',
      transition: 'border 0.2s ease, box-shadow 0.2s ease',
    },
       btn: (disabled) => ({
  width: '100%', padding: '15px', borderRadius: 16, border: 'none',
  background: disabled
    ? 'rgba(0,0,0,0.08)'
    : 'linear-gradient(135deg, #34A853 0%, #2E7D52 100%)',
  color: disabled ? 'rgba(0,0,0,0.3)' : '#fff',
  fontWeight: 800, fontSize: 15, cursor: disabled ? 'not-allowed' : 'pointer',
  boxShadow: disabled ? 'none' : '0 6px 20px rgba(52,168,83,0.3)',
  transition: 'all 0.2s ease', letterSpacing: 0.3,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
}),
    errorText: {
      color: '#E23744', fontSize: 13,
      display: 'flex', alignItems: 'center', gap: 6,
    },
  };

  const focusOn  = e => { e.target.style.border = '1px solid rgba(226,55,68,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,55,68,0.12)'; };
  const focusOff = e => { e.target.style.border = '1px solid rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={s.root}>
      <div style={s.bgGradient} />
      <div style={s.blob1} />
      <div style={s.blob2} />

      {/* Header */}
      <div style={s.header}>
        <button
          style={s.backBtn}
          onClick={() => navigate(-1)}
          onMouseEnter={e => e.currentTarget.style.background = '#fff'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}
        >
          <ArrowLeft size={18} color="#666" />
        </button>
        <div>
          <div style={s.headerTitle}>
            <Sparkles size={16} color="#E23744" />
            Upload Video
          </div>
          <p style={s.headerSub}>Share your delicious creations</p>
        </div>
      </div>

      {/* Content */}
      <div style={s.content}>
        <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Video Upload */}
          <div>
            <label style={s.sectionLabel}>Video</label>
            <input ref={fileInputRef} type="file" accept="video/*" onChange={onFileChange} style={{ display: 'none' }} />

            {!videoFile ? (
              <div
                style={s.dropZone(dragActive)}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div style={s.dropZoneInner}>
                  <div style={s.uploadIconBox(dragActive)}>
                    <Upload size={30} color={dragActive ? '#E23744' : '#E23744'} strokeWidth={1.8} />
                  </div>
                  <p style={s.dropTitle}>{dragActive ? 'Drop your video here' : 'Tap to upload video'}</p>
                  <p style={s.dropSub}>or drag and drop</p>
                  <div style={s.formatPills}>
                    {['MP4', 'WebM', 'MOV', '<100MB'].map(f => (
                      <span key={f} style={s.formatPill}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={s.videoWrap}>
                <video src={videoURL} controls playsInline style={s.videoEl} />
                <button
                  type="button"
                  style={s.removeBtn}
                  onClick={() => { setVideoFile(null); setFileError(''); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF0F0'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                >
                  <X size={15} color="#E23744" />
                </button>
                <div style={s.videoMeta}>
                  <div style={s.videoName}>
                    <Film size={13} color="#E23744" />
                    <span style={{ fontSize: 13, color: '#1A1A1A', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {videoFile.name}
                    </span>
                  </div>
                  <span style={s.videoSize}>
                    {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>
            )}

            {fileError && (
              <p style={s.errorText}><X size={13} /> {fileError}</p>
            )}
          </div>

          {/* Food Name */}
          <div>
            <label style={s.sectionLabel}>Food Name</label>
            <input
              id="name" type="text"
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g., Spicy Paneer Wrap"
              required style={s.input}
              onFocus={focusOn} onBlur={focusOff}
            />
          </div>

          {/* Price */}
          <div>
             <label style={{ ...s.sectionLabel, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#E23744' }}>PKR</span> Price
             </label>
            <div style={s.priceWrap}>
              <span style={s.rupeeSign}>Rs</span>
              <input
                id="price" type="number"
                value={price} onChange={e => setPrice(e.target.value)}
                placeholder="200" required min="0" step="1"
                style={s.priceInput}
                onFocus={focusOn} onBlur={focusOff}
              />
            </div>
          </div>

          {/* Submit */}
              <button
  type="submit"
  disabled={isDisabled}
  style={s.btn(isDisabled)}
  onMouseEnter={e => {
    if (!isDisabled) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 10px 28px rgba(52,168,83,0.35)';
    }
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = isDisabled ? 'none' : '0 6px 20px rgba(52,168,83,0.3)';
  }}
>
  {uploading ? (
    <>
      <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      Uploading...
    </>
  ) : (
    <>
      <Upload size={18} />
      Publish Video
    </>
  )}
</button>
        </form>
      </div>

      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50%       { transform: translate(-30px, 30px) scale(1.1); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50%       { transform: translate(20px, -40px) scale(1.15); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: rgba(0,0,0,0.3); }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
};

export default CreateFood;