
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, MapPin, Briefcase, ChefHat, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { validateEmail, validatePassword, validatePasswordMatch, validateName, validatePhone, validateAddress, getPasswordStrengthLabel, getPasswordStrengthColor, validatePasswordStrength } from '../../utils/validations';

const CATEGORIES = [
  'Restaurant', 'Fast Food', 'Cafe', 'Bakery',
  

];

const FoodPartnerRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if this is edit mode
  const isEdit = location.state?.isEdit || false;
  const partnerData = location.state?.partnerData || null;
  const initialCategory = partnerData?.category || 'Restaurant';
  const hasInitialCustomCategory = initialCategory && !CATEGORIES.includes(initialCategory);
  
  const [category, setCategory] = useState(initialCategory);
  const [customCategory, setCustomCategory] = useState(hasInitialCustomCategory ? initialCategory : '');
  const [formData, setFormData] = useState({
    businessName: partnerData?.name || '',
    contactName: partnerData?.contactName || '',
    phone: partnerData?.phone || '',
    email: partnerData?.email || '',
    password: '',
    confirmPassword: '',
    address: partnerData?.address || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  useEffect(() => {
    if (partnerData) {
      setFormData({
        businessName: partnerData.name || '',
        contactName: partnerData.contactName || '',
        phone: partnerData.phone || '',
        email: partnerData.email || '',
        password: '',
        confirmPassword: '',
        address: partnerData.address || ''
      });
      const incomingCategory = partnerData.category || 'Restaurant';
      setCategory(incomingCategory);
      setCustomCategory(CATEGORIES.includes(incomingCategory) ? '' : incomingCategory);
    }
  }, [partnerData]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailChange = async (e) => {
    const email = e.target.value;
    handleInputChange(e);
    
    if (email && !isEdit) {
      const emailErrors = validateEmail(email);
      if (emailErrors.length === 0) {
        setEmailCheckLoading(true);
        try {
          const response = await axios.post("http://localhost:3000/api/auth/check-email", { email });
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
    handleInputChange(e);
    
    if (!isEdit && pwd) {
      const strength = validatePasswordStrength(pwd);
      setPasswordStrength(strength);
      
      const pwdErrors = validatePassword(pwd);
      if (pwdErrors.length > 0) {
        setErrors(prev => ({ ...prev, password: pwdErrors }));
      } else {
        setErrors(prev => { const newErrors = { ...prev }; delete newErrors.password; return newErrors; });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const resolvedCategory = (customCategory || category || '').trim() || 'Restaurant';
    
    // Validate fields
    const newErrors = {};

    const businessNameErrors = validateName(formData.businessName);
    if (businessNameErrors.length > 0) newErrors.businessName = businessNameErrors;

    const contactNameErrors = validateName(formData.contactName);
    if (contactNameErrors.length > 0) newErrors.contactName = contactNameErrors;

    const phoneErrors = validatePhone(formData.phone);
    if (phoneErrors.length > 0) newErrors.phone = phoneErrors;

    const emailErrors = validateEmail(formData.email);
    if (emailErrors.length > 0) newErrors.email = emailErrors;

    const addressErrors = validateAddress(formData.address);
    if (addressErrors.length > 0) newErrors.address = addressErrors;

    if (!isEdit) {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) newErrors.password = passwordErrors;

      const confirmErrors = validatePasswordMatch(formData.password, formData.confirmPassword);
      if (confirmErrors.length > 0) newErrors.confirmPassword = confirmErrors;

      if (emailExists) {
        newErrors.email = ['This email is already registered'];
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    if (isEdit) {
      // Update existing partner
      axios.put(`http://localhost:3000/api/food-partner/${partnerData._id}`, {
        name: formData.businessName,
        contactName: formData.contactName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        category: resolvedCategory
      }, { withCredentials: true })
        .then(() => {
       
          navigate(`/food-partner/profile/${partnerData._id}`);
        })
        .catch(err => {
          const errorMsg = err.response?.data?.message || "Update failed. Please try again.";
          setErrors({ submit: [errorMsg] });
          setLoading(false);
        });
    } else {
      // Register new partner
      axios.post("http://localhost:3000/api/auth/food-partner/register", {
        name: formData.businessName,
        contactName: formData.contactName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        category: resolvedCategory
      }, { withCredentials: true })
        .then(res => {
          const partnerId = res.data.foodPartner._id;
          navigate(`/food-partner/profile/${partnerId}`);
        })
        .catch(err => {
          const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
          setErrors({ submit: [errorMsg] });
          setLoading(false);
        });
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
  overflowX: 'hidden',
},
    bgGradient: {
      position: 'fixed', inset: 0,
      zIndex: -1,
      minHeight: '100%',
      background: 'linear-gradient(160deg, #FFE4E1 0%, #FDF8F5 50%, #D1FAE5 100%)',
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
      alignItems: 'flex-start', 
      padding: '20px 16px 0',
      animation: 'fadeDown 0.6s ease both',
    },
    logoCard: {
      background: 'rgba(255,255,255,0.85)', borderRadius: '50%',
      padding: 0, display: 'flex', flexDirection: 'column',
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
      position: 'relative', zIndex: 5,
      marginTop: '20px',
      padding: '0 16px 40px',
      animation: 'fadeUp 0.8s cubic-bezier(0.2,0.8,0.2,1) both',
    },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 16px', borderRadius: 999,
      fontSize: 13, fontWeight: 600, color: '#059669',
      background: '#E8F5E9', border: '1px solid rgba(5,150,105,0.2)',
      marginBottom: 16,
    },
    heading: {
      fontSize: 32, fontWeight: 900, color: '#1A1A1A',
      letterSpacing: '-1px', lineHeight: 1.1, margin: '0 0 8px',
    },
    headingAccent: { color: '#E23744' },
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
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 },
    label: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#999', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: 13, color: 'rgba(0,0,0,0.25)', pointerEvents: 'none' },
    input: {
      width: '100%', padding: '11px 13px 11px 38px', borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.8)',
      color: '#1A1A1A', fontSize: 14, outline: 'none', boxSizing: 'border-box',
      transition: 'border 0.2s ease, box-shadow 0.2s ease',
    },
    inputNoIcon: {
      width: '100%', padding: '11px 13px', borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.8)',
      color: '#1A1A1A', fontSize: 14, outline: 'none', boxSizing: 'border-box',
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
    note: { fontSize: 11, color: '#aaa', marginTop: 3 },
    btn: {
      width: '100%', padding: '13px', borderRadius: 14, border: 'none',
      background: ' #059669',
      color: '#fff', fontWeight: 800, fontSize: 15,
      cursor: 'pointer', marginTop: 4,
      boxShadow: '0 6px 20px rgba(226,55,68,0.3)',
      transition: 'opacity 0.2s ease, transform 0.15s ease', letterSpacing: 0.3,
    },
    btnDisabled: {
      opacity: 0.6, cursor: 'not-allowed',
    },
    dividerRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
    dividerLine: { flex: 1, height: 1, background: '#EAEAEA' },
    dividerText: { color: '#999', fontSize: 13 },
    footer: { textAlign: 'center', fontSize: 14, color: '#666' },
    link: { color: '#E23744', fontWeight: 700, textDecoration: 'none' },
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
        <div style={s.badge}>{isEdit ? '✏️ Update your info' : '🏪 Grow your business'}</div>

        <h1 style={s.heading}>
          {isEdit ? 'Edit ' : 'Partner '}<span style={s.headingAccent}>{isEdit ? 'Profile' : 'sign up'}</span>
        </h1>
        <p style={s.subtext}>{isEdit ? 'Update your business information.' : 'Grow your business with our platform.'}</p>

        {/* Switch tabs — only show in register mode */}
        {!isEdit && (
          <div style={s.switchRow}>
            <Link to="/user/register" style={s.switchInactive}>👤 User</Link>
            <Link to="/food-partner/register" style={s.switchActive}>🏪 Partner</Link>
          </div>
        )}

        {/* Form Card */}
        <div style={s.card}>
          {errors.submit && (
            <div style={{ ...s.errorMessage, background: '#FEE2E2', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px' }}>
              <AlertCircle size={16} />
              {errors.submit[0]}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>

            {/* Business Name */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Business Name</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><Briefcase size={14} /></span>
                <input id="businessName" name="businessName" placeholder="Tasty Bites"
                  autoComplete="organization" style={{ ...s.input, ...(errors.businessName ? s.inputError : {}) }}
                  value={formData.businessName}
                  onChange={handleInputChange}
                  onFocus={e => { e.target.style.border = '1px solid rgba(226,55,68,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,55,68,0.12)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {errors.businessName && errors.businessName.map((err, i) => (
                <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
              ))}
            </div>

            {/* Contact + Phone */}
            <div style={s.twoCol}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={s.label}>Contact</label>
                <input id="contactName" name="contactName" placeholder="Jane Doe"
                  autoComplete="name" style={{ ...s.inputNoIcon, ...(errors.contactName ? s.inputError : {}) }}
                  value={formData.contactName}
                  onChange={handleInputChange}
                  onFocus={e => { e.target.style.border = '1px solid rgba(226,55,68,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,55,68,0.12)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                {errors.contactName && errors.contactName.map((err, i) => (
                  <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={s.label}>Phone</label>
                <input id="phone" name="phone" placeholder="+1 555 0000"
                  autoComplete="tel" style={{ ...s.inputNoIcon, ...(errors.phone ? s.inputError : {}) }}
                  value={formData.phone}
                  onChange={handleInputChange}
                  onFocus={e => { e.target.style.border = '1px solid rgba(226,55,68,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,55,68,0.12)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                {errors.phone && errors.phone.map((err, i) => (
                  <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
                ))}
              </div>
            </div>

            {/* Email */}
            <div style={s.fieldGroup}>
              <label style={{...s.label, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                Email
                {emailCheckLoading && <span style={{ fontSize: 11, color: '#F59E0B', textTransform: 'none' }}>Checking...</span>}
              </label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><Mail size={14} /></span>
                <input id="email" name="email" type="email" placeholder="business@example.com"
                  autoComplete="email" style={{ ...s.input, ...(errors.email ? s.inputError : {}) }}
                  value={formData.email}
                  onChange={handleEmailChange}
                  onFocus={e => { e.target.style.border = '1px solid rgba(226,55,68,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,55,68,0.12)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {!errors.email && !emailCheckLoading && !emailExists && !isEdit && (
                <div style={s.successMessage}><CheckCircle size={14} /> Email looks good</div>
              )}
              {errors.email && errors.email.map((err, i) => (
                <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
              ))}
            </div>

            {/* Password - only show in register mode */}
            {!isEdit && (
              <>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Password</label>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}><Lock size={14} /></span>
                    <input id="password" name="password" type="password" placeholder="••••••••"
                      autoComplete="new-password" style={{ ...s.input, ...(errors.password ? s.inputError : {}) }}
                      value={formData.password}
                      onChange={handlePasswordChange}
                      onFocus={e => { e.target.style.border = '1px solid rgba(226,55,68,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,55,68,0.12)'; }}
                      onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {formData.password && (
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
                    <span style={s.inputIcon}><Lock size={14} /></span>
                    <input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••"
                      autoComplete="new-password" style={{ ...s.input, ...(errors.confirmPassword ? s.inputError : {}) }}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={e => { e.target.style.border = '1px solid rgba(226,55,68,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,55,68,0.12)'; }}
                      onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {errors.confirmPassword && errors.confirmPassword.map((err, i) => (
                    <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
                  ))}
                </div>
              </>
            )}

            {/* Address */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Address</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><MapPin size={14} /></span>
                <input id="address" name="address" placeholder="123 Market Street"
                  autoComplete="street-address" style={{ ...s.input, ...(errors.address ? s.inputError : {}) }}
                  value={formData.address}
                  onChange={handleInputChange}
                  onFocus={e => { e.target.style.border = '1px solid rgba(226,55,68,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,55,68,0.12)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {errors.address && errors.address.map((err, i) => (
                <div key={i} style={s.errorMessage}><AlertCircle size={14} /> {err}</div>
              ))}
              <p style={s.note}>Full address helps customers find you faster.</p>
            </div> 

           

            {/* Category */}
            <div style={s.fieldGroup}>
              <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ChefHat size={12} style={{ color: '#E23744' }} /> Category
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setCustomCategory('');
                    }}
                    style={{
                      padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                      border: category === cat ? '1.5px solid #E23744' : '1px solid rgba(0,0,0,0.08)',
                      background: category === cat ? 'rgba(226,55,68,0.07)' : 'rgba(255,255,255,0.7)',
                      color: category === cat ? '#E23744' : '#888',
                      fontSize: 12, fontWeight: category === cat ? 700 : 600,
                      transition: 'all 0.2s ease', textAlign: 'center',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={s.label}>Or type your own category</label>
                <input
                  id="customCategory"
                  name="customCategory"
                  placeholder="e.g. Street Food"
                  style={s.inputNoIcon}
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    setCategory(e.target.value);
                  }}
                  onFocus={focusOn}
                  onBlur={focusOff}
                />
              </div>
            </div>

            <button type="submit" style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
              disabled={loading}
              onMouseEnter={e => { if (!loading) { e.target.style.opacity = '0.9'; e.target.style.transform = 'translateY(-1px)'; }}}
              onMouseLeave={e => { if (!loading) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}}
            >
              {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes →' : 'Create Partner Account →')}
            </button>
          </form>
        </div>

        {!isEdit && (
          <>
            <div style={s.dividerRow}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>or</span>
              <div style={s.dividerLine} />
            </div>

            <p style={s.footer}>
              Already a partner?{' '}
              <Link to="/food-partner/login" style={s.link}>Sign in</Link>
            </p>
          </>
        )}
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

export default FoodPartnerRegister;




























