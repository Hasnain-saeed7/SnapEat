
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

  // ── Pastel Pantry Styles (Cream BG Sync) ──
  const nav = {
    position: 'fixed', bottom: 0, left:'50%', transform: 'translateX(-50%)', width: '100%', height: 60, maxWidth: 380, zIndex: 50,
    background: '#FDF8F5',
    borderTop: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.03)',
    fontFamily: "'Inter', 'Poppins', sans-serif",
    paddingBottom: 'env(safe-area-inset-bottom)',
  }
  const inner = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '10px 8px 14px',
    maxWidth: 380,
    margin: '0 auto',
  }
  const btn = (active) => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
    padding: '8px 16px', borderRadius: 16, border: 'none', cursor: 'pointer',
    background: active ? '#FFEAEA' : 'transparent', 
    color: active ? '#E23744' : '#A0A0A0', 
    transition: 'all 0.2s ease',
    minWidth: 56,
    position: 'relative',
  })
  const label = { fontSize: 10, fontWeight: 700, letterSpacing: 0.5, marginTop: 1 }
  const badge = {
    position: 'absolute',
    top: 2,
    right: 8,
    background: '#E23744',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    boxShadow: '0 2px 6px rgba(226,55,68,0.4)',
  }

  // Icons with Theme Colors
  const HomeIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={active ? 'rgba(226,55,68,0.1)' : 'none'}
      stroke={active ? '#E23744' : '#A0A0A0'}
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5"/>
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/>
    </svg>
  )
  const SaveIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24"
      fill={active ? '#E23744' : 'none'}
      stroke={active ? '#E23744' : '#A0A0A0'}
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>
    </svg>
  )
  const MessageIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24"
      fill={active ? 'rgba(226,55,68,0.1)' : 'none'}
      stroke={active ? '#E23744' : '#A0A0A0'}
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
  const LogoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#A0A0A0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            <HomeIcon active={homeActive} />
            <span style={{ ...label, color: homeActive ? '#E23744' : '#A0A0A0' }}>Home</span>
          </button>
          <button style={btn(msgActive)} onClick={() => navigate('/messages')}>
            <MessageIcon active={msgActive} />
            {unreadCount > 0 && <span style={badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
            <span style={{ ...label, color: msgActive ? '#E23744' : '#A0A0A0' }}>Messages</span>
          </button>
          <button style={btn(false)} onClick={handleLogout}>
            <LogoutIcon />
            <span style={{ ...label, color: '#A0A0A0' }}>Logout</span>
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
            <HomeIcon active={isActive('/home')} />
            <span style={{ ...label, color: isActive('/home') ? '#E23744' : '#A0A0A0' }}>Home</span>
          </button>
          <button style={btn(msgActive)} onClick={() => navigate('/messages')}>
            <MessageIcon active={msgActive} />
            {unreadCount > 0 && <span style={badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
            <span style={{ ...label, color: msgActive ? '#E23744' : '#A0A0A0' }}>Messages</span>
          </button>
          <button style={btn(isActive('/saved'))} onClick={() => navigate('/saved')}>
            <SaveIcon active={isActive('/saved')} />
            <span style={{ ...label, color: isActive('/saved') ? '#E23744' : '#A0A0A0' }}>Saved</span>
          </button>
          <button style={btn(false)} onClick={handleLogout}>
            <LogoutIcon />
            <span style={{ ...label, color: '#A0A0A0' }}>Logout</span>
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
          <HomeIcon active={isActive('/home')} />
          <span style={{ ...label, color: isActive('/home') ? '#E23744' : '#A0A0A0' }}>Home</span>
        </button>
        <button style={btn(msgActive)} onClick={() => navigate('/messages')}>
          <MessageIcon active={msgActive} />
          {unreadCount > 0 && <span style={badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
          <span style={{ ...label, color: msgActive ? '#E23744' : '#A0A0A0' }}>Messages</span>
        </button>
        <button style={btn(isActive('/saved'))} onClick={() => navigate('/saved')}>
          <SaveIcon active={isActive('/saved')} />
          <span style={{ ...label, color: isActive('/saved') ? '#E23744' : '#A0A0A0' }}>Saved</span>
        </button>
        <button style={btn(false)} onClick={handleLogout}>
          <LogoutIcon />
          <span style={{ ...label, color: '#A0A0A0' }}>Logout</span>
        </button>
      </div>
    </nav>
  )
}

export default BottomNav;