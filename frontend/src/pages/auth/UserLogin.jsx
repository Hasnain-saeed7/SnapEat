
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { validateEmail, validatePassword } from '../../utils/validations';

const UserLogin = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    // Reset errors
    const newErrors = {};

    // Validate fields
    const emailErrors = validateEmail(email);
    if (emailErrors.length > 0) newErrors.email = emailErrors;

    if (!password) {
      newErrors.password = ['Password is required'];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/auth/user/login", {
        email,
        password
      }, { withCredentials: true });
      console.log(response.data);
      localStorage.setItem('role', 'user');
      navigate("/home");
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
      setErrors({ submit: [errorMsg] });
    } finally {
      setLoading(false);
    }
  };

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
    logo: {
      position: 'relative', zIndex: 10,
      display: 'flex', flexDirection: 'column',
      alignItems: 'flex-start', gap: 4,
      padding: '10px 24px 0',
      animation: 'fadeDown 0.6s ease both',
    },
    logoCard: {
      background: 'rgba(255,255,255,0.85)',
      borderRadius: '50%', padding: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid rgba(255,255,255,1)',
      width: 150, height: 150, overflow: 'hidden',
    },
    logoImage: { 
      height: '100%', width: '100%', objectFit: 'cover',
      borderRadius: '50%',
    },
    logoLabel: {
      fontSize: 13, fontWeight: 700,
      color: '#1A1A1A', letterSpacing: '-0.3px',
    },
    taglineWrap: {
      display: 'flex', alignItems: 'center', gap: 5,
      marginTop: 20, animation: 'fadeDown 0.8s ease both 0.2s',
    },
    wordSnap:   { color: '#E23744', fontWeight: 800, fontSize: 22, letterSpacing: '0.5px' },
    wordEat:    { color: '#059669', fontWeight: 800, fontSize: 22, letterSpacing: '0.5px' },
    wordRepeat: { color: '#F59E0B', fontWeight: 800, fontSize: 22, letterSpacing: '0.5px' },
    dot: { color: '#111', fontWeight: 900 },
    content: {
      position: 'relative', zIndex: 10,
      marginTop: 'auto',
      padding: '0 24px 60px',
      animation: 'fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both',
    },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 16px', borderRadius: 999,
      fontSize: 13, fontWeight: 600, color: '#E23744',
      background: '#FFEAEA', border: '1px solid rgba(226,55,68,0.15)',
      marginBottom: 20,
    },
    heading: {
      fontSize: 30, fontWeight: 900, color: '#1A1A1A',
      letterSpacing: '-1.5px', lineHeight: 1.6, margin: '0 0 10px',
    },
    headingAccent: { color: '#059669' },
    subtext: { fontSize: 14, color: '#666', margin: '0 0 24px' },
    card: {
      background: 'rgba(255,255,255,0.85)',
      border: '1px solid rgba(255,255,255,1)',
      borderRadius: 24, padding: '22px 20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      backdropFilter: 'blur(10px)',
      marginBottom: 20,
    },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 },
    label: {
      fontSize: 11, fontWeight: 700, letterSpacing: 1,
      color: '#999', textTransform: 'uppercase',
    },
    input: {
      width: '100%', padding: '11px 13px', borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.1)',
      background: 'rgba(255,255,255,0.8)',
      color: '#1A1A1A', fontSize: 14, outline: 'none',
      boxSizing: 'border-box',
      transition: 'border 0.2s ease, box-shadow 0.2s ease',
    },
    inputError: {
      borderColor: '#DC2626',
      background: 'rgba(220, 38, 38, 0.05)',
    },
    errorMessage: {
      fontSize: 12, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
    },
    btn: {
      width: '100%', padding: '13px', borderRadius: 14, border: 'none',
      background: ' #059669',
      color: '#fff', fontWeight: 800, fontSize: 15,
      cursor: 'pointer', marginTop: 6,
      boxShadow: '0 6px 20px rgba(226,55,68,0.3)',
      transition: 'opacity 0.2s ease, transform 0.15s ease',
      letterSpacing: 0.3,
    },
    btnDisabled: {
      opacity: 0.6, cursor: 'not-allowed',
    },
    dividerRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
    dividerLine: { flex: 1, height: 1, background: '#EAEAEA' },
    dividerText: { color: '#999', fontSize: 13 },
    footer: { textAlign: 'center', fontSize: 15, color: '#666' },
    link: { color: '#E23744', fontWeight: 700, textDecoration: 'none' },
  };

  return (
    <div style={s.root}>
      <div style={s.bgGradient} />
      <div style={s.blob1} />
      <div style={s.blob2} />

      {/* Logo — top left, matching your screenshot */}
      <div style={s.logo}>
        <div style={s.logoCard}>
          <img src="/assets/logo-icon2.png" alt="SnapEat" style={s.logoImage} />
        
        </div>
        <div style={s.taglineWrap}>
          <span style={s.wordSnap}>Snap</span>
          <span style={s.dot}>•</span>
          <span style={s.wordEat}>Eat</span>
          <span style={s.dot}>•</span>
          <span style={s.wordRepeat}>Repeat</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={s.content}>
        <div style={s.badge}>✦ Welcome back</div>

        <h1 style={s.heading}>
          Sign in to <span style={s.headingAccent}>SnapEat</span>
        </h1>
        <p style={s.subtext}>Continue your food journey.</p>

        {/* Form Card */}
        <div style={s.card}>
          {errors.submit && (
            <div style={{ ...s.errorMessage, background: '#FEE2E2', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px' }}>
              <AlertCircle size={16} />
              {errors.submit[0]}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="email">Email</label>
              <input
                style={{ ...s.input, ...(errors.email ? s.inputError : {}) }}
                id="email" name="email" type="email"
                placeholder="you@example.com"
                autoComplete="email"
                onFocus={e => { e.target.style.border = '1px solid rgba(226,55,68,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,55,68,0.12)'; }}
                onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.email && errors.email.map((err, i) => (
                <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
              ))}
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="password">Password</label>
              <input
                style={{ ...s.input, ...(errors.password ? s.inputError : {}) }}
                id="password" name="password" type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                onFocus={e => { e.target.style.border = '1px solid rgba(226,55,68,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,55,68,0.12)'; }}
                onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.password && errors.password.map((err, i) => (
                <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
              ))}
            </div>
            <button
              style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
              type="submit"
              disabled={loading}
              onMouseEnter={e => { if (!loading) { e.target.style.opacity = '0.9'; e.target.style.transform = 'translateY(-1px)'; }}}
              onMouseLeave={e => { if (!loading) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={s.dividerRow}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or</span>
          <div style={s.dividerLine} />
        </div>

        <p style={s.footer}>
          New here?{' '}
          <a href="/user/register" style={s.link}>Create account</a>
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50%       { transform: translate(-30px, 30px) scale(1.1); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50%       { transform: translate(20px, -40px) scale(1.15); }
        }
        input::placeholder { color: rgba(0,0,0,0.3); }
      `}</style>
    </div>
  );
};

export default UserLogin;