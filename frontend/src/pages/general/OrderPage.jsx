
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  ArrowLeft, ShoppingCart, MapPin, CreditCard,
  Truck, Plus, Minus, Trash2, CheckCircle, Clock, X, Building2, Wallet, Smartphone
} from 'lucide-react';

const P = {
  bg: '#fdf6f0',
  bgAlt: '#fce8e8',
  card: 'rgba(255,255,255,0.85)',
  border: 'rgba(232,165,152,0.25)',
  borderStrong: 'rgba(232,165,152,0.5)',
  accent: '#e8a598',
  accentDark: '#d4847a',
  accentBg: 'rgba(232,165,152,0.12)',
  text: '#3d2b1f',
  textSub: '#9c7c6e',
  textLight: '#c4a8a0',
  shadow: '0 4px 20px rgba(196,120,110,0.12)',
  shadowBtn: '0 6px 20px rgba(196,120,110,0.35)',
  green: '#6daa7a',
};

const CART_KEY = 'zomatoCart';

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [address, setAddress] = useState({ street: '', city: '', zipCode: '', instructions: '' });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const normalizeCart = (items) => (items || []).map((item) => ({
    ...item,
    foodId: item.foodId || item._id,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 0,
    partnerId: item.partnerId || '',
    partnerName: item.partnerName || '',
  }));

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_KEY);
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      const normalized = normalizeCart(parsed);
      const partnerIds = [...new Set(normalized.map((item) => item.partnerId).filter(Boolean))];

      if (partnerIds.length > 1) {
        const primaryPartnerId = partnerIds[0];
        const compatibleCart = normalized.filter((item) => !item.partnerId || item.partnerId === primaryPartnerId);
        setCart(compatibleCart);
        localStorage.setItem(CART_KEY, JSON.stringify(compatibleCart));
      } else {
        setCart(normalized);
      }
    }
    if (location.state?.cartItem) {
      addToCart(location.state.cartItem);
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart(prev => {
      const nextFoodId = item.foodId || item._id;
      const existing = prev.find(i => i.foodId === nextFoodId);
      if (existing) return prev.map(i => i.foodId === nextFoodId ? { ...i, quantity: (Number(i.quantity) || 0) + 1 } : i);
      return [...prev, { ...item, foodId: nextFoodId, price: Number(item.price) || 0, quantity: 1, partnerId: item.partnerId || '', partnerName: item.partnerName || '' }];
    });
  };

  const updateQuantity = (foodId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.foodId === foodId) {
        const newQty = (Number(item.quantity) || 0) + delta;
        if (newQty <= 0) return null;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (foodId) => setCart(prev => prev.filter(i => i.foodId !== foodId));
  const clearCart = () => { setCart([]); localStorage.removeItem(CART_KEY); };

  const subtotal = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
  const deliveryFee = deliveryMethod === 'delivery' ? 40 : 0;
  const total = subtotal + deliveryFee;

  const placeOrder = async () => {
    if (cart.length === 0) return;
    if (deliveryMethod === 'delivery' && (!address.street.trim() || !address.city.trim() || !address.zipCode.trim())) {
      alert('Please enter street address, city, and zip code');
      return;
    }
    setIsPlacingOrder(true);
    try {
      const res = await API.post('/api/order', {
        items: cart.map(i => ({ foodId: i.foodId, quantity: i.quantity })),
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? address : null,
        paymentMethod
      });
      setOrderDetails(res.data.order);
      setOrderSuccess(true);
      clearCart();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const inputStyle = {
    width: '100%', background: '#fff',
    border: `1.5px solid ${P.border}`,
    borderRadius: 12, padding: '12px 14px',
    color: P.text, fontSize: 14, outline: 'none',
    fontFamily: "'Segoe UI', sans-serif",
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  };

  const sectionTitle = {
    fontSize: 18, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: P.textSub,
    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
    fontFamily: "'Segoe UI', sans-serif",
  };

  // ── Order Success ──
  if (orderSuccess && orderDetails) {
    return (
      <div style={{ minHeight: '100vh', background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{
          width: '100%', maxWidth: 400, background: P.card,
          borderRadius: 24, padding: '40px 28px', textAlign: 'center',
          border: `1px solid ${P.border}`, boxShadow: P.shadow,
          fontFamily: "'Segoe UI', sans-serif",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: P.accentBg, margin: '0 auto 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${P.borderStrong}`,
          }}>
            <CheckCircle size={44} color={P.accent} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: P.text, margin: '0 0 8px' }}>Order Placed! </h2>
          <p style={{ color: P.textSub, margin: '0 0 24px', fontSize: 14 }}>Your order has been placed successfully</p>

          <div style={{ background: P.accentBg, borderRadius: 16, padding: 16, marginBottom: 24, border: `1px solid ${P.border}`, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: P.textSub, fontSize: 13 }}>Order ID</span>
              <span style={{ color: P.text, fontWeight: 700, fontSize: 13 }}>{orderDetails._id?.slice(-8).toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: P.textSub, fontSize: 13 }}>Total Amount</span>
              <span style={{ color: P.accentDark, fontWeight: 800, fontSize: 13 }}>Rs.{orderDetails.totalAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: P.textSub, fontSize: 13 }}>Delivery</span>
              <span style={{ color: P.text, fontSize: 13, textTransform: 'capitalize' }}>{orderDetails.deliveryMethod}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: P.textSub, fontSize: 13, marginBottom: 28 }}>
            <Clock size={15} color={P.textSub} />
            <span>Estimated time: 30-45 mins</span>
          </div>

          <button
            onClick={() => navigate('/home')}
            style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${P.accent}, ${P.accentDark})`,
              color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
              boxShadow: P.shadowBtn, fontFamily: "'Segoe UI', sans-serif",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: P.bg, paddingBottom: 100, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(253,246,240,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${P.border}`,
        boxShadow: '0 2px 12px rgba(196,120,110,0.08)',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: P.accentBg, border: `1px solid ${P.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} color={P.textSub} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: P.accentBg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={18} color={P.accent} />
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: P.text, margin: 0 }}>Your Order</h1>
              <p style={{ fontSize: 11, color: P.textSub, margin: 0 }}>{cart.length} items</p>
            </div>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={18} color={P.textLight} />
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Empty Cart ── */}
        {cart.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: P.accentBg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShoppingCart size={36} color={P.textLight} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text, margin: '0 0 8px' }}>Your cart is empty</h3>
            <p style={{ color: P.textSub, margin: '0 0 24px', fontSize: 14 }}>Add some delicious food to get started</p>
            <button
              onClick={() => navigate('/home')}
              style={{
                padding: '12px 28px', borderRadius: 14, border: 'none',
                background: `linear-gradient(135deg, ${P.accent}, ${P.accentDark})`,
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: P.shadowBtn,
              }}
            >
              Browse Menu
            </button>
          </div>
        )}

        {cart.length > 0 && (
          <>
            {/* ── Cart Items ── */}
            <div>
              <p style={sectionTitle}>Cart Items</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cart.map((item) => (
                  <div key={item.foodId} style={{
                    background: P.card, border: `1px solid ${P.border}`,
                    borderRadius: 16, padding: 14, display: 'flex', gap: 12,
                    boxShadow: P.shadow,
                  }}>
                    <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', background: P.accentBg, flexShrink: 0 }}>
                      {item.video ? (
                        <video
                          src={item.video}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          muted
                          playsInline
                          loop
                          autoPlay
                          preload="metadata"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingCart size={18} color={P.textLight} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: P.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: 8 }}>{item.name}</h3>
                        <button onClick={() => removeFromCart(item.foodId)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                          <X size={20} color={P.textLight} />
                        </button>
                      </div>
                      <p style={{ fontSize: 12, color: P.textSub, margin: '0 0 10px' }}>{item.partnerName}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: P.accentDark, fontWeight: 800, fontSize: 15 }}>Rs.{item.price * item.quantity}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: P.accentBg, borderRadius: 10, padding: '4px 8px', border: `1px solid ${P.border}` }}>
                          <button onClick={() => updateQuantity(item.foodId, -1)} style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Minus size={13} color={P.textSub} />
                          </button>
                          <span style={{ color: P.text, fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.foodId, 1)} style={{ width: 28, height: 28, borderRadius: 8, background: P.accent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Plus size={13} color="#fff" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Delivery Method ── */}
            <div>
              <p style={sectionTitle}><Truck size={13} color={P.accent} /> Delivery Method</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { id: 'delivery', label: 'Delivery', sub: 'Rs.40 fee', Icon: Truck, MetaIcon: Clock, meta: '30-45 mins' },
                  { id: 'pickup', label: 'Pickup', sub: 'Free', Icon: Building2, MetaIcon: CheckCircle, meta: 'Ready at store' },
                ].map(({ id, label, sub, Icon, MetaIcon, meta }) => (
                  <button
                    key={id}
                    onClick={() => setDeliveryMethod(id)}
                    style={{
                      position: 'relative',
                      padding: '16px 12px', borderRadius: 14,
                      border: `2px solid ${deliveryMethod === id ? P.accent : P.border}`,
                      background: deliveryMethod === id ? P.accentBg : P.card,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: deliveryMethod === id ? P.shadow : 'none',
                    }}
                  >
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: deliveryMethod === id ? 'rgba(232,165,152,0.25)' : 'rgba(232,165,152,0.1)',
                      border: `1px solid ${deliveryMethod === id ? P.borderStrong : P.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={18} color={deliveryMethod === id ? P.accentDark : P.textSub} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: deliveryMethod === id ? P.text : P.textSub }}>{label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color: P.textLight }}>{id === 'delivery' ? 'DOORSTEP' : 'TAKEAWAY'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MetaIcon size={11} color={deliveryMethod === id ? P.accentDark : P.textSub} />
                      <span style={{ fontSize: 11, color: deliveryMethod === id ? P.accentDark : P.textSub, fontWeight: 600 }}>{meta}</span>
                    </div>
                    <span style={{ fontSize: 11, color: id === 'pickup' ? P.green : P.textSub }}>{sub}</span>
                    {deliveryMethod === id && (
                      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={14} color={P.accentDark} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Delivery Address ── */}
            {deliveryMethod === 'delivery' && (
              <div>
                <p style={sectionTitle}><MapPin size={13} color={P.accent} /> Delivery Address</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input style={inputStyle} type="text" value={address.street} onChange={(e) => setAddress(p => ({ ...p, street: e.target.value }))} placeholder="Street address, building name"
                    onFocus={e => e.target.style.borderColor = P.accent} onBlur={e => e.target.style.borderColor = P.border} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input
                      style={inputStyle}
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress(p => ({ ...p, city: e.target.value }))}
                      placeholder="City"
                      onFocus={e => e.target.style.borderColor = P.accent}
                      onBlur={e => e.target.style.borderColor = P.border}
                    />
                    <input
                      style={inputStyle}
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={address.zipCode}
                      onChange={(e) => setAddress(p => ({ ...p, zipCode: e.target.value.replace(/[^0-9]/g, '') }))}
                      placeholder="Zip Code"
                      onFocus={e => e.target.style.borderColor = P.accent}
                      onBlur={e => e.target.style.borderColor = P.border}
                    />
                  </div>
                  <textarea style={{ ...inputStyle, resize: 'none', minHeight: 80 }} value={address.instructions} onChange={(e) => setAddress(p => ({ ...p, instructions: e.target.value }))} placeholder="Delivery instructions (optional)" rows={2}
                    onFocus={e => e.target.style.borderColor = P.accent} onBlur={e => e.target.style.borderColor = P.border} />
                </div>
              </div>
            )}

            {/* ── Payment Method ── */}
            <div>
              <p style={sectionTitle}><CreditCard size={13} color={P.accent} /> Payment Method</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { id: 'cash', label: 'Cash', Icon: Wallet },
                  { id: 'card', label: 'Card', Icon: CreditCard },
                  { id: 'upi', label: 'UPI', Icon: Smartphone },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    style={{
                      position: 'relative',
                      padding: '14px 8px', borderRadius: 14,
                      border: `2px solid ${paymentMethod === method.id ? P.accent : P.border}`,
                      background: paymentMethod === method.id ? P.accentBg : P.card,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: paymentMethod === method.id ? P.shadow : 'none',
                    }}
                  >
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: paymentMethod === method.id ? 'rgba(232,165,152,0.25)' : 'rgba(232,165,152,0.1)',
                      border: `1px solid ${paymentMethod === method.id ? P.borderStrong : P.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <method.Icon size={16} color={paymentMethod === method.id ? P.accentDark : P.textSub} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 12, color: paymentMethod === method.id ? P.text : P.textSub }}>{method.label}</span>
                    {paymentMethod === method.id && (
                      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={13} color={P.accentDark} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Order Summary ── */}
            <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 18, boxShadow: P.shadow }}>
              <p style={{ ...sectionTitle, marginBottom: 14 }}>Order Summary</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: P.textSub, fontSize: 14 }}>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span style={{ color: P.textSub, fontSize: 14 }}>Rs.{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: P.textSub, fontSize: 14 }}>Delivery Fee</span>
                  <span style={{ color: deliveryFee > 0 ? P.textSub : P.green, fontSize: 14, fontWeight: 600 }}>
                    {deliveryFee > 0 ? `Rs.${deliveryFee}` : 'Free'}
                  </span>
                </div>
                <div style={{ height: 1, background: P.border, margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: P.text }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: P.accentDark }}>Rs.{total}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Fixed Place Order Button ── */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(253,246,240,0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${P.border}`,
          padding: '12px 16px 24px',
          boxShadow: '0 -4px 20px rgba(196,120,110,0.12)',
        }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <button
              onClick={placeOrder}
              disabled={isPlacingOrder}
              style={{
                width: '100%', padding: '15px', borderRadius: 16, border: 'none',
                background: isPlacingOrder ? P.accentBg : `linear-gradient(135deg, ${P.accent}, ${P.accentDark})`,
                color: isPlacingOrder ? P.textSub : '#fff',
                fontWeight: 800, fontSize: 15, cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: isPlacingOrder ? 'none' : P.shadowBtn,
                transition: 'all 0.2s ease',
                fontFamily: "'Segoe UI', sans-serif",
              }}
            >
              {isPlacingOrder ? (
                <>
                  <div style={{ width: 18, height: 18, border: `2px solid ${P.textLight}`, borderTopColor: P.accentDark, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Placing Order...
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <span style={{ background: 'rgba(255,255,255,0.25)', padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                    Rs.{total}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: rgba(156,124,110,0.45); }
      `}</style>
    </div>
  );
};

export default OrderPage;












