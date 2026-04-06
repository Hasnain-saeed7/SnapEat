
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Store, ChevronRight, Sparkles, Play } from 'lucide-react';

const ChooseRegister = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const styles = {
    root: {
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FDF8F5', // Warm Cream Base
      fontFamily: "'Inter', 'Poppins', sans-serif",
    },
    bgLayer: { position: 'absolute', inset: 0, overflow: 'hidden' },
    bgGradient: {
      position: 'absolute', inset: 0,
      background: 'linear-gradient(160deg, #FFE4E1 0%, #FDF8F5 50%, #D1FAE5 100%)',
    },
    blob1: {
      position: 'absolute', width: 400, height: 400,
      top: -120, right: -100, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,126,126,0.25) 0%, transparent 70%)',
      animation: 'blob1 10s ease-in-out infinite',
    },
    blob2: {
      position: 'absolute', width: 350, height: 350,
      bottom: -50, left: -80, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
      animation: 'blob2 12s ease-in-out infinite',
    },
  
   // Styles object ke andar ye add karein:
         
   logo: {
  position: 'relative', 
  zIndex: 10,
  display: 'flex', 
  flexDirection: 'column', // Vertical align karne ke liye
  alignItems: 'flex-start', // Left side par align karne ke liye
  gap: 4, // Logo aur tagline ke darmiyan halka sa fasla
  padding: '20px 24px 0',
  animation: 'fadeDown 0.6s ease both',
},

logoImage: {
  height: 150,
  width: 150,
  objectFit: 'cover',
  borderRadius: '50%',
  filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.05))',
},

taglineWrap: {
  display: 'flex',
  alignItems: 'center',
  gap: 4, // Dots aur words ke darmiyan space
  marginLeft: '4px',
  marginTop: '10px',
  animation: 'fadeDown 0.8s ease both 0.2s',
},
wordSnap: {
  color: '#E23744', // SnapEat Red (Action/Speed)
  fontWeight: 800,
  fontSize: 25,
  letterSpacing: '0.5px',
},
wordEat: {
  color: '#059669', // Vibrant Green (Food/Freshness)
  fontWeight: 800,
  fontSize: 25,
  letterSpacing: '0.5px',
},
wordRepeat: {
  color: '#F59E0B', // Amber/Orange (Satisfaction/Cycle)
  fontWeight: 800,
  fontSize: 25,
  letterSpacing: '0.5px',
},
dot: {
  color: 'black', // Light gray dots taake words pop karein
  fontWeight: 900,
},


    content: {
      position: 'relative', zIndex: 10,
      marginTop: '20px',
      padding: '0 24px 60px',
      animation: 'fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both',
    },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 16px', borderRadius: 999,
      fontSize: 13, fontWeight: 600,
      color: '#E23744',
      background: '#FFEAEA',
      border: '1px solid rgba(226,55,68,0.15)',
      marginBottom: 20,
    },
    heading: {
      fontSize: 44, fontWeight: 900,
      color: '#1A1A1A', letterSpacing: '-1.5px',
      lineHeight: 1.1, margin: '0 0 10px',
    },
    headingAccent: { color: '#E23744' },
    subtext: {
      fontSize: 16, color: '#666',
      margin: '0 0 32px', maxWidth: '85%',
    },
    cardsWrap: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 },
    card: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '22px 24px', borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.85)',
      border: '1px solid rgba(255, 255, 255, 1)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      backdropFilter: 'blur(10px)',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
    },
    cardLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    
    // --- Icons Styling ---
    iconBoxUser: {
      width: 52, height: 52, borderRadius: 16,
      background: '#FFF0F0', // Soft Red Tint
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    iconBoxPartner: {
      width: 52, height: 52, borderRadius: 16,
      background: '#B9F6CA', // Vibrant Mint Green Tint
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(16,185,129,0.16)'
    },
    
    cardTitle: { color: '#1A1A1A', fontWeight: 700, fontSize: 16, margin: 0 },
    cardSub: { color: '#757575', fontSize: 14, margin: '2px 0 0' },
    chevronBox: {
      width: 36, height: 36, borderRadius: '50%',
      background: '#F5F5F5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    dividerRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
    dividerLine: { flex: 1, height: 1, background: '#EAEAEA' },
    dividerText: { color: '#999', fontSize: 13 },
    footer: { textAlign: 'center', fontSize: 15, color: '#666' },
    signIn: { color: '#E23744', fontWeight: 700, textDecoration: 'none' },
  };

  return (
    <div style={styles.root}>
      <div style={styles.bgLayer}>
        <div style={styles.bgGradient} />
        <div style={styles.blob1} />
        <div style={styles.blob2} />
      </div>

      {/* SnapEat Logo */}
     {/* SnapEat Logo & Multi-Color Tagline */}
<div style={styles.logo}>
  <img 
    src="/assets/logo-icon2.png" 
    alt="SnapEat Logo" 
    style={styles.logoImage} 
  />
  
  {/* Multi-Color Tagline Line */}
  <div style={styles.taglineWrap}>
    <span style={styles.wordSnap}>Snap</span>
    <span style={styles.dot}>•</span>
    <span style={styles.wordEat}>Eat</span>
    <span style={styles.dot}>•</span>
    <span style={styles.wordRepeat}>Repeat</span>
  </div>
</div>
       
     

 
      <div style={styles.content}>
        <div style={styles.badge}>
          <Sparkles size={12} />
          Fresh way to order
        </div>

        <h1 style={styles.heading}>
          Join <span style={styles.headingAccent}>SnapEat</span>
        </h1>
        <p style={styles.subtext}>How would you like to get started?</p>

        <div style={styles.cardsWrap}>
          {/* User Card */}
          <Link to="/user/register" style={styles.card} className="card-hover">
            <div style={styles.cardLeft}>
              <div style={styles.iconBoxUser}>
                <User size={26} color="#E23744" strokeWidth={2.2} />
              </div>
              <div>
                <p style={styles.cardTitle}>Register as User</p>
                <p style={styles.cardSub}>For foodies & customers</p>
              </div>
            </div>
            <div style={styles.chevronBox}>
              <ChevronRight size={18} color="#999" />
            </div>
          </Link>

          {/* Partner Card */}
          <Link to="/food-partner/register" style={styles.card} className="card-hover">
            <div style={styles.cardLeft}>
              <div style={styles.iconBoxPartner}>
                <Store size={26} color="#059669" strokeWidth={2.2} />
              </div>
              <div>
                <p style={styles.cardTitle}>Food Partner</p>
                <p style={styles.cardSub}>For restaurants , Bakers & vendors</p>
              </div>
            </div>
            <div style={styles.chevronBox}>
              <ChevronRight size={18} color="#999" />
            </div>
          </Link>
        </div>

        <div style={styles.dividerRow}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/user/login" style={styles.signIn}>Sign in</Link>
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
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(20px, -40px) scale(1.15); }
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.07) !important;
          background: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default ChooseRegister;













































































