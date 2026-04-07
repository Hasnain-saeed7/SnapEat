
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Camera, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { validateEmail, validatePassword, validatePasswordMatch, validateName, getPasswordStrengthLabel, getPasswordStrengthColor, validatePasswordStrength } from '../../utils/validations';

const UserRegister = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEmailChange = async (e) => {
    const email = e.target.value;
    if (email) {
      const emailErrors = validateEmail(email);
      if (emailErrors.length === 0) {
        // Check if email exists
        setEmailCheckLoading(true);
        try {
          const response = await API.post("/api/auth/check-email", { email });
          setEmailExists(response.data.exists);
          if (response.data.exists) {
            setErrors(prev => ({ ...prev, email: ['This email is already registered'] }));
          } else {
            setErrors(prev => { const newErrors = { ...prev }; delete newErrors.email; return newErrors; });
          }
        } catch (err) {
          console.error('Error checking email:', err);
        } finally {
          setEmailCheckLoading(false);
        }
      } else {
        setErrors(prev => ({ ...prev, email: emailErrors }));
      }
    }
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    const strength = validatePasswordStrength(pwd);
    setPasswordStrength(strength);
    
    if (pwd) {
      const pwdErrors = validatePassword(pwd);
      if (pwdErrors.length > 0) {
        setErrors(prev => ({ ...prev, password: pwdErrors }));
      } else {
        setErrors(prev => { const newErrors = { ...prev }; delete newErrors.password; return newErrors; });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const firstName = e.target.firstName.value;
    const lastName = e.target.lastName.value;
    const email = e.target.email.value;
    const pwd = e.target.password.value;
    const confirmPwd = e.target.confirmPassword.value;

    // Reset errors
    const newErrors = {};

    // Validate all fields
    const firstNameErrors = validateName(firstName);
    if (firstNameErrors.length > 0) newErrors.firstName = firstNameErrors;

    const lastNameErrors = validateName(lastName);
    if (lastNameErrors.length > 0) newErrors.lastName = lastNameErrors;

    const emailErrors = validateEmail(email);
    if (emailErrors.length > 0) newErrors.email = emailErrors;

    const passwordErrors = validatePassword(pwd);
    if (passwordErrors.length > 0) newErrors.password = passwordErrors;

    const confirmErrors = validatePasswordMatch(pwd, confirmPwd);
    if (confirmErrors.length > 0) newErrors.confirmPassword = confirmErrors;

    if (emailExists) {
      newErrors.email = ['This email is already registered'];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', firstName + " " + lastName);
      formData.append('email', email);
      formData.append('password', pwd);
      if (profilePic) formData.append('profilePic', profilePic);

      const response = await API.post("/api/auth/user/register", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log(response.data);
      navigate("/user/login");
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
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
      maxWidth: '100vw',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FDF8F5',
      fontFamily: "'Inter', 'Poppins', sans-serif",
      overflowX: 'hidden',
    },
    bgGradient: {
      position: 'fixed', inset: 0,
      background: 'linear-gradient(160deg, #FFE4E1 0%, #FDF8F5 50%, #D1FAE5 100%)',
      zIndex: -1,
    },
    blob1: {
      position: 'fixed', width: 300, height: 300,
      top: -100, right: -80, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,126,126,0.25) 0%, transparent 70%)',
      animation: 'blob1 10s ease-in-out infinite', pointerEvents: 'none',
      zIndex: 0,
    },
    blob2: {
      position: 'fixed', width: 250, height: 250,
      bottom: -30, left: -60, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
      animation: 'blob2 12s ease-in-out infinite', pointerEvents: 'none',
      zIndex: 0,
    },
    logo: {
      position: 'relative', zIndex: 10,
      display: 'flex', flexDirection: 'column',
      alignItems: 'flex-start', gap: 4,
      padding: '32px 20px 0',
      animation: 'fadeDown 0.6s ease both',
    },
    logoCard: {
      background: 'rgba(255,255,255,0.85)',
      borderRadius: '50%', padding: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid rgba(255,255,255,1)',
      width: 120, height: 120, overflow: 'hidden',
    },
    logoImage: { height: '100%', width: '100%', objectFit: 'cover', borderRadius: '50%' },
    logoLabel: { fontSize: 13, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.3px' },
    taglineWrap: {
      display: 'flex', alignItems: 'center', gap: 5,
      marginTop: 16, animation: 'fadeDown 0.8s ease both 0.2s',
    },
    wordSnap:   { color: '#E23744', fontWeight: 800, fontSize: 18, letterSpacing: '0.5px' },
    wordEat:    { color: '#059669', fontWeight: 800, fontSize: 18, letterSpacing: '0.5px' },
    wordRepeat: { color: '#F59E0B', fontWeight: 800, fontSize: 18, letterSpacing: '0.5px' },
    dot: { color: '#111', fontWeight: 900 },
    content: {
      position: 'relative', zIndex: 10,
      marginTop: '20px',
      padding: '0 16px 40px',
      animation: 'fadeUp 0.8s cubic-bezier(0.2,0.8,0.2,1) both',
    },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 16px', borderRadius: 999,
      fontSize: 13, fontWeight: 600, color: '#E23744',
      background: '#FFEAEA', border: '1px solid rgba(226,55,68,0.15)',
      marginBottom: 16,
    },
    heading: {
      fontSize: 32, fontWeight: 900, color: '#1A1A1A',
      letterSpacing: '-1px', lineHeight: 1.1, margin: '0 0 8px',
    },
    headingAccent: { color: '#059669' },
    subtext: { fontSize: 15, color: '#666', margin: '0 0 18px' },
    switchRow: { display: 'flex', gap: 10, marginBottom: 16 },
    switchActive: {
      flex: 1, padding: '10px 0', borderRadius: 14, border: 'none',
      background: ' #059669',
      color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
      boxShadow: '0 4px 14px rgba(226,55,68,0.3)',
      textAlign: 'center', textDecoration: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    switchInactive: {
      flex: 1, padding: '10px 0', borderRadius: 14,
      background: 'rgba(255,255,255,0.7)', color: '#999',
      fontWeight: 600, fontSize: 13, cursor: 'pointer',
      border: '1px solid rgba(0,0,0,0.08)',
      textAlign: 'center', textDecoration: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    card: {
      background: 'rgba(255,255,255,0.85)',
      border: '1px solid rgba(255,255,255,1)',
      borderRadius: 20, padding: '18px 16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      backdropFilter: 'blur(10px)',
      marginBottom: 16,
    },
    profilePicSection: {
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 8, marginBottom: 18,
    },
    profilePicCircle: {
      width: 72, height: 72, borderRadius: '50%',
      border: '2px solid rgba(226,55,68,0.25)',
      background: '#FFF0F0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', cursor: 'pointer',
      transition: 'transform 0.2s ease',
    },
    profilePicImage: { width: '100%', height: '100%', objectFit: 'cover' },
    uploadLabel: {
      fontSize: 12, color: '#E23744', fontWeight: 600,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
    },
    twoCol: {
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 8, marginBottom: 12,
    },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 },
    label: {
      fontSize: 11, fontWeight: 700, letterSpacing: 1,
      color: '#999', textTransform: 'uppercase',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: {
      position: 'absolute', left: 13,
      color: 'rgba(0,0,0,0.25)', pointerEvents: 'none',
    },
    input: {
      width: '100%', padding: '11px 13px 11px 38px',
      borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)',
      background: 'rgba(255,255,255,0.8)',
      color: '#1A1A1A', fontSize: 14, outline: 'none',
      boxSizing: 'border-box',
      transition: 'border 0.2s ease, box-shadow 0.2s ease',
    },
    inputNoIcon: {
      width: '100%', padding: '11px 13px',
      borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)',
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
    successMessage: {
      fontSize: 12, color: '#059669', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
    },
    passwordStrengthBar: {
      height: 4, borderRadius: 2, marginTop: 4,
      background: '#EAEAEA', overflow: 'hidden',
    },
    passwordStrengthFill: {
      height: '100%', transition: 'width 0.3s ease, background 0.3s ease',
    },
    passwordStrengthLabel: {
      fontSize: 11, color: '#666', marginTop: 4,
    },
    btn: {
      width: '100%', padding: '13px', borderRadius: 14, border: 'none',
      background: '#059669',
      color: '#fff', fontWeight: 800, fontSize: 15,
      cursor: 'pointer', marginTop: 4,
      boxShadow: '0 6px 20px rgba(226,55,68,0.3)',
      transition: 'opacity 0.2s ease, transform 0.15s ease',
      letterSpacing: 0.3,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    },
    btnDisabled: {
      opacity: 0.6, cursor: 'not-allowed',
    },
    dividerRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
    dividerLine: { flex: 1, height: 1, background: '#EAEAEA' },
    dividerText: { color: '#999', fontSize: 13 },
    footer: { textAlign: 'center', fontSize: 14, color: '#666' },
    link: { color: '#E23744', fontWeight: 700, textDecoration: 'none' },
    hiddenInput: { display: 'none' },
  };

  const focusOn  = e => { e.target.style.border = '1px solid rgba(226,55,68,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,55,68,0.12)'; };
  const focusOff = e => { e.target.style.border = '1px solid rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={s.root}>
      <div style={s.bgGradient} />
      <div style={s.blob1} />
      <div style={s.blob2} />

      {/* Logo — top left */}
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
        <div style={s.badge}>✦ Join SnapEat</div>

        <h1 style={s.heading}>
          Create your <span style={s.headingAccent}>account</span>
        </h1>
        <p style={s.subtext}>Join to explore & enjoy delicious meals.</p>

        {/* Switch tabs */}
        <div style={s.switchRow}>
          <Link to="/user/register" style={s.switchActive}>👤 User</Link>
          <Link to="/food-partner/register" style={s.switchInactive}>🏪 Partner</Link>
        </div>

        {/* Form Card */}
        <div style={s.card}>
          {errors.submit && (
            <div style={{ ...s.errorMessage, background: '#FEE2E2', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px' }}>
              <AlertCircle size={16} />
              {errors.submit[0]}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>

            {/* Profile Pic */}
            <div style={s.profilePicSection}>
              <div
                style={s.profilePicCircle}
                onClick={() => document.getElementById('profilePicInput').click()}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {profilePicPreview
                  ? <img src={profilePicPreview} alt="Preview" style={s.profilePicImage} />
                  : <Camera size={28} color="rgba(226,55,68,0.5)" />
                }
              </div>
              <label htmlFor="profilePicInput" style={s.uploadLabel}>
                <Camera size={13} />
                {profilePic ? 'Change Photo' : 'Add Profile Photo '}
              </label>
              <input
                id="profilePicInput" type="file" accept="image/*"
                onChange={handleProfilePicChange} style={s.hiddenInput}
              />
            </div>

            {/* Name */}
            <div style={s.twoCol}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={s.label}>First Name</label>
                <input id="firstName" name="firstName" placeholder="Jane"
                  autoComplete="given-name" style={{ ...s.inputNoIcon, ...(errors.firstName ? s.inputError : {})} }
                  onFocus={focusOn} onBlur={focusOff} />
                {errors.firstName && errors.firstName.map((err, i) => (
                  <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={s.label}>Last Name</label>
                <input id="lastName" name="lastName" placeholder="Doe"
                  autoComplete="family-name" style={{ ...s.inputNoIcon, ...(errors.lastName ? s.inputError : {}) }}
                  onFocus={focusOn} onBlur={focusOff} />
                {errors.lastName && errors.lastName.map((err, i) => (
                  <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
                ))}
              </div>
            </div>

            {/* Email */}
            <div style={s.fieldGroup}>
              <label style={s.label}>
                Email
                {emailCheckLoading && <span style={{ fontSize: 11, color: '#F59E0B' }}>Checking...</span>}
              </label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><Mail size={15} /></span>
                <input id="email" name="email" type="email"
                  placeholder="you@example.com" autoComplete="email"
                  onChange={handleEmailChange}
                  style={{ ...s.input, ...(errors.email ? s.inputError : {}) }}
                  onFocus={focusOn} onBlur={focusOff} />
              </div>
              {!errors.email && !emailCheckLoading && !emailExists && (
                <div style={s.successMessage}><CheckCircle size={14} /> Email looks good</div>
              )}
              {errors.email && errors.email.map((err, i) => (
                <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
              ))}
            </div>

            {/* Password */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Password</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><Lock size={15} /></span>
                <input id="password" name="password" type="password"
                  placeholder="••••••••" autoComplete="new-password"
                  onChange={handlePasswordChange}
                  style={{ ...s.input, ...(errors.password ? s.inputError : {}) }}
                  onFocus={focusOn} onBlur={focusOff} />
              </div>
              {password && (
                <>
                  <div style={s.passwordStrengthBar}>
                    <div style={{
                      ...s.passwordStrengthFill,
                      width: `${(passwordStrength / 4) * 100}%`,
                      background: getPasswordStrengthColor(passwordStrength),
                    }} />
                  </div>
                  <div style={{ ...s.passwordStrengthLabel, color: getPasswordStrengthColor(passwordStrength) }}>
                    Strength: {getPasswordStrengthLabel(passwordStrength)}
                  </div>
                </>
              )}
              {errors.password && errors.password.map((err, i) => (
                <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
              ))}
            </div>

            {/* Confirm Password */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Confirm Password</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><Lock size={15} /></span>
                <input id="confirmPassword" name="confirmPassword" type="password"
                  placeholder="••••••••" autoComplete="new-password"
                  style={{ ...s.input, ...(errors.confirmPassword ? s.inputError : {}) }}
                  onFocus={focusOn} onBlur={focusOff} />
              </div>
              {errors.confirmPassword && errors.confirmPassword.map((err, i) => (
                <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
              ))}
            </div>

            <button 
              type="submit" 
              style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
              disabled={loading}
              onMouseEnter={e => { if (!loading) { e.target.style.opacity = '0.9'; e.target.style.transform = 'translateY(-1px)'; }}}
              onMouseLeave={e => { if (!loading) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}}
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>
        </div>

        <div style={s.dividerRow}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or</span>
          <div style={s.dividerLine} />
        </div>

        <p style={s.footer}>
          Already have an account?{' '}
          <Link to="/user/login" style={s.link}>Sign in</Link>
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

export default UserRegister;