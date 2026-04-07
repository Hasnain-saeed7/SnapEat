
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../api/axios'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const role = localStorage.getItem('role')
  const partnerId = localStorage.getItem('partnerId')
  const isPartnerProfile = location.pathname.startsWith('/food-partner/profile')
  const [cartCount, setCartCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('zomatoCart') || '[]')
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
    }
    updateCartCount()
    window.addEventListener('storage', updateCartCount)
    window.addEventListener('cartUpdated', updateCartCount)
    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', updateCartCount)
    }
  }, [location])

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const endpoint = role === 'foodPartner'
          ? '/api/messages/partner/unread'
          : '/api/messages/user/unread';
        
        const res = await API.get(endpoint);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (error) {
        // Silently fail - user may not be logged in
      }
    };

    if (role) {
      fetchUnreadCount();
      // Poll for new messages every 10 seconds
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [role, location]);

  const handleLogout = async () => {
    try {
      if (role === 'foodPartner') {
        await API.post('/api/auth/food-partner/logout', {})
      } else {
        await API.post('/api/auth/user/logout', {})
      }
    } catch (e) {
      console.error('Logout error:', e)
    }
    localStorage.clear()
    navigate(role === 'foodPartner' ? '/food-partner/login' : '/user/login')
  }

  const isActive = (path) => location.pathname === path

  // ── Dark Glass Nav (Reels-optimized) ──
  const nav = {
    position: 'fixed', bottom: 0, left: 0, right: 0, width: '100%',
    height: 70,
    background: 'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 100%)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    zIndex: 1000,
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
    paddingBottom: 'env(safe-area-inset-bottom)',
  }
  const inner = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    maxWidth: 500,
    margin: '0 auto',
    padding: '0 12px',
  }
  const btn = (active) => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '10px 18px', borderRadius: 14, border: 'none', cursor: 'pointer',
    background: 'transparent',
    color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    minWidth: 60,
    position: 'relative',
  })
  const label = { fontSize: 11, fontWeight: 600, letterSpacing: 0.4, marginTop: 2 }
  const badge = {
    position: 'absolute',
    top: 4,
    right: 10,
    background: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 5px',
    boxShadow: '0 2px 8px rgba(255,71,87,0.5)',
  }
  const activeIndicator = {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 28,
    height: 3,
    background: 'linear-gradient(90deg, #ff4757, #ff6b81)',
    borderRadius: '0 0 4px 4px',
  }

  // Icons with Dark Theme Colors
  const HomeIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24"
      fill={active ? 'rgba(255,255,255,0.15)' : 'none'}
      stroke={active ? '#ffffff' : 'rgba(255,255,255,0.5)'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5"/>
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/>
    </svg>
  )
  const SaveIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={active ? '#ffffff' : 'none'}
      stroke={active ? '#ffffff' : 'rgba(255,255,255,0.5)'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>
    </svg>
  )
  const MessageIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={active ? 'rgba(255,255,255,0.15)' : 'none'}
      stroke={active ? '#ffffff' : 'rgba(255,255,255,0.5)'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
  const LogoutIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 17l5-5-5-5M21 12H9M13 5v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"/>
    </svg>
  )

  if (role === 'foodPartner') {
    const homeActive = isActive('/home')
    const msgActive = isActive('/messages') || location.pathname.startsWith('/messages/')
    
    return (
      <nav style={nav}>
        <div style={inner}>
          <button style={btn(homeActive)} onClick={() => navigate('/home')}>
            {homeActive && <div style={activeIndicator} />}
            <HomeIcon active={homeActive} />
            <span style={{ ...label, color: homeActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>Home</span>
          </button>
          <button style={btn(msgActive)} onClick={() => navigate('/messages')}>
            {msgActive && <div style={activeIndicator} />}
            <MessageIcon active={msgActive} />
            {unreadCount > 0 && <span style={badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
            <span style={{ ...label, color: msgActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>Messages</span>
          </button>
          <button style={btn(false)} onClick={handleLogout}>
            <LogoutIcon />
            <span style={{ ...label, color: 'rgba(255,255,255,0.5)' }}>Logout</span>
          </button>
        </div>
      </nav>
    )
  }

  // User on partner profile - show Messages in bottom nav
  if (role === 'user' && isPartnerProfile) {
    const msgActive = isActive('/messages') || location.pathname.startsWith('/messages/')
    return (
      <nav style={nav}>
        <div style={inner}>
          <button style={btn(isActive('/home'))} onClick={() => navigate('/home')}>
            {isActive('/home') && <div style={activeIndicator} />}
            <HomeIcon active={isActive('/home')} />
            <span style={{ ...label, color: isActive('/home') ? '#fff' : 'rgba(255,255,255,0.5)' }}>Home</span>
          </button>
          <button style={btn(msgActive)} onClick={() => navigate('/messages')}>
            {msgActive && <div style={activeIndicator} />}
            <MessageIcon active={msgActive} />
            {unreadCount > 0 && <span style={badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
            <span style={{ ...label, color: msgActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>Messages</span>
          </button>
          <button style={btn(isActive('/saved'))} onClick={() => navigate('/saved')}>
            {isActive('/saved') && <div style={activeIndicator} />}
            <SaveIcon active={isActive('/saved')} />
            <span style={{ ...label, color: isActive('/saved') ? '#fff' : 'rgba(255,255,255,0.5)' }}>Saved</span>
          </button>
          <button style={btn(false)} onClick={handleLogout}>
            <LogoutIcon />
            <span style={{ ...label, color: 'rgba(255,255,255,0.5)' }}>Logout</span>
          </button>
        </div>
      </nav>
    )
  }

  // User on home/saved - show Messages
  const msgActive = isActive('/messages') || location.pathname.startsWith('/messages/')
  return (
    <nav style={nav}>
      <div style={inner}>
        <button style={btn(isActive('/home'))} onClick={() => navigate('/home')}>
          {isActive('/home') && <div style={activeIndicator} />}
          <HomeIcon active={isActive('/home')} />
          <span style={{ ...label, color: isActive('/home') ? '#fff' : 'rgba(255,255,255,0.5)' }}>Home</span>
        </button>
        <button style={btn(msgActive)} onClick={() => navigate('/messages')}>
          {msgActive && <div style={activeIndicator} />}
          <MessageIcon active={msgActive} />
          {unreadCount > 0 && <span style={badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
          <span style={{ ...label, color: msgActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>Messages</span>
        </button>
        <button style={btn(isActive('/saved'))} onClick={() => navigate('/saved')}>
          {isActive('/saved') && <div style={activeIndicator} />}
          <SaveIcon active={isActive('/saved')} />
          <span style={{ ...label, color: isActive('/saved') ? '#fff' : 'rgba(255,255,255,0.5)' }}>Saved</span>
        </button>
        <button style={btn(false)} onClick={handleLogout}>
          <LogoutIcon />
          <span style={{ ...label, color: 'rgba(255,255,255,0.5)' }}>Logout</span>
        </button>
      </div>
    </nav>
  )
}

export default BottomNav;