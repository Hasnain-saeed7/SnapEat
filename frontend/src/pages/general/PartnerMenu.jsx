
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { ArrowLeft, Plus, Minus, ShoppingCart, IndianRupee } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

const PartnerMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);

  const normalizeCart = (items) => (items || []).map((item) => ({
    ...item,
    _id: item._id,
    foodId: item.foodId || item._id,
    video: item.video || '',
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 0,
    partnerId: item.partnerId || id,
    partnerName: item.partnerName || partner?.name || '',
  }));

  const isSamePartnerCart = (items) => {
    const partnerIds = [...new Set((items || []).map((item) => item.partnerId).filter(Boolean))];
    return partnerIds.length <= 1 && (partnerIds.length === 0 || partnerIds[0] === id);
  };

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('zomatoCart') || '[]');
    const normalizedCart = normalizeCart(savedCart);

    if (normalizedCart.length > 0 && !isSamePartnerCart(normalizedCart)) {
      const compatibleCart = normalizedCart.filter((item) => !item.partnerId || item.partnerId === id);
      const nextCart = compatibleCart.length > 0 ? compatibleCart : [];
      setCart(nextCart);
      localStorage.setItem('zomatoCart', JSON.stringify(nextCart));
      return;
    }

    setCart(normalizedCart);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');

    API.get(`/api/food-partner/${id}`)
      .then((res) => {
        setPartner(res.data.foodPartner);
        setFoodItems(res.data.foodPartner?.foodItems ?? []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load menu.');
        setPartner(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('zomatoCart', JSON.stringify(newCart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const getItemQuantity = (itemId) => {
    const cartItem = cart.find(c => c._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const addToCart = (item) => {
    const existingIndex = cart.findIndex(c => c._id === item._id);
    let newCart;

    if (existingIndex >= 0) {
      newCart = cart.map((c, i) =>
        i === existingIndex ? { ...c, quantity: (Number(c.quantity) || 0) + 1 } : c
      );
    } else {
      newCart = [...cart, {
        _id: item._id,
        name: item.name,
        video: item.video || '',
        price: Number(item.price) || 0,
        quantity: 1,
        partnerId: id,
        partnerName: partner?.name
      }];
    }
    updateCart(newCart);
  };

  const removeFromCart = (itemId) => {
    const existingIndex = cart.findIndex(c => c._id === itemId);
    if (existingIndex < 0) return;

    const item = cart[existingIndex];
    let newCart;

    if (item.quantity > 1) {
      newCart = cart.map((c, i) =>
        i === existingIndex ? { ...c, quantity: Math.max(0, (Number(c.quantity) || 0) - 1) } : c
      );
    } else {
      newCart = cart.filter(c => c._id !== itemId);
    }
    updateCart(newCart);
  };

  const cartTotal = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
  const cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#fdf6f0' }} className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin"
            style={{ borderColor: '#e8a598', borderTopColor: 'transparent' }}
          />
          <p style={{ color: '#3d2b1f', opacity: 0.5 }} className="text-sm font-medium">Loading menu…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#fdf6f0' }} className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#e8a598', opacity: 0.3 }}
        >
          <ShoppingCart size={24} style={{ color: '#3d2b1f' }} />
        </div>
        <p style={{ color: '#3d2b1f', opacity: 0.6 }} className="text-sm">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold px-5 py-2 rounded-full transition-all"
          style={{ backgroundColor: '#e8a598', color: '#3d2b1f' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fdf6f0', minHeight: '100vh' }} className="pb-32 md:max-w-[520px] md:mx-auto md:shadow-2xl">

      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: '-80px', right: '-60px',
        width: '220px', height: '220px', borderRadius: '50%',
        backgroundColor: '#e8a598', opacity: 0.15, filter: 'blur(50px)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '120px', left: '-60px',
        width: '180px', height: '180px', borderRadius: '50%',
        backgroundColor: '#a8c5a0', opacity: 0.15, filter: 'blur(40px)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Header */}
      <div
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{
          backgroundColor: 'rgba(253,246,240,0.92)',
          borderColor: 'rgba(61,43,31,0.08)'
        }}
      >
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{ backgroundColor: 'rgba(232,165,152,0.15)', border: '1.5px solid rgba(232,165,152,0.3)' }}
          >
            <ArrowLeft size={18} style={{ color: '#3d2b1f' }} />
          </button>
          <div className="flex-1">
            <h1
              className="text-lg font-bold tracking-tight"
              style={{ color: '#3d2b1f', fontFamily: 'Georgia, serif' }}
            >
              {partner?.name || 'Menu'}
            </h1>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#e8a598' }}>
              {partner?.category || 'Restaurant'}
            </p>
          </div>
          {/* Cart badge in header */}
          {cartCount > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(232,165,152,0.2)', border: '1.5px solid rgba(232,165,152,0.4)' }}
            >
              <ShoppingCart size={14} style={{ color: '#3d2b1f' }} />
              <span className="text-xs font-bold" style={{ color: '#3d2b1f' }}>{cartCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-6 relative z-10">
        {foodItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(232,165,152,0.15)', border: '2px dashed rgba(232,165,152,0.4)' }}
            >
              <ShoppingCart size={30} style={{ color: '#e8a598' }} />
            </div>
            <p className="font-semibold" style={{ color: '#3d2b1f', fontFamily: 'Georgia, serif' }}>
              No items available
            </p>
            <p className="text-xs text-center" style={{ color: '#3d2b1f', opacity: 0.45 }}>
              This restaurant hasn't added any menu items yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {foodItems.map((item) => {
              const quantity = getItemQuantity(item._id);
              return (
                <div
                  key={item._id}
                  className="rounded-2xl p-4 flex items-center gap-4 transition-all"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid rgba(232,165,152,0.25)',
                    boxShadow: '0 2px 12px rgba(61,43,31,0.06)'
                  }}
                >
                  {/* Video Thumbnail */}
                  {item.video && (
                    <div
                      className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ border: '1.5px solid rgba(232,165,152,0.2)' }}
                    >
                      <video
                        src={item.video}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    </div>
                  )}

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-base truncate"
                      style={{ color: '#3d2b1f', fontFamily: 'Georgia, serif' }}
                    >
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-0.5 mt-1.5"> 
                      <div className='name'  size={13} style={{ color: '#e8a598' }} />
                      {/* <IndianRupee size={13} style={{ color: '#e8a598' }} /> */}
                      <span className="font-bold text-lg" style={{ color: '#3d2b1f' }}>
                       Rs. {item.price}
                      </span>
                    </div>
                  </div>

                  {/* Cart Controls */}
                  <div className="flex-shrink-0">
                    {quantity === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                        style={{
                          backgroundColor: '#e8a598',
                          color: '#3d2b1f',
                          boxShadow: '0 2px 8px rgba(232,165,152,0.35)'
                        }}
                      >
                        <Plus size={15} />
                        Add
                      </button>
                    ) : (
                      <div
                        className="flex items-center gap-2 rounded-xl p-1"
                        style={{ backgroundColor: 'rgba(232,165,152,0.12)', border: '1.5px solid rgba(232,165,152,0.3)' }}
                      >
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
                          style={{ backgroundColor: '#067A55' }}
                        >
                          <Minus size={18} style={{ color: '#3d2b1f' }} />
                        </button>
                        <span className="w-6 text-center font-bold text-sm" style={{ color: '#3d2b1f' }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
                          style={{ backgroundColor: 'pink' }}
                        >
                          <Plus size={18} style={{ color: '#3d2b1f' }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-40 md:max-w-[520px] md:left-1/2 md:-translate-x-1/2">
          <button
            onClick={() => navigate('/order')}
            className="w-full py-4 rounded-2xl font-bold flex items-center justify-between px-6 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: '#059669',
              color: '#fdf6f0',
              boxShadow: '0 8px 24px rgba(61,43,31,0.3)'
            }}
          >
            <div className="flex items-center gap-3">
              <div
                  className="rounded-lg px-2.5 py-1"
                  style={{ backgroundColor: 'rgba(253,246,240,0.15)' }}
                >
                  <span className="text-sm font-bold" style={{ color: 'white' }}>{cartCount}</span>
                </div>
                <span style={{ fontFamily: 'Georgia, serif' }}>View Cart</span>
              </div>  
              <div className="flex items-center gap-0.5">
                <div  size={15} style={{ color: '#e8a598' }} /> <span>Rs.</span>
                <span style={{ color: 'white' }}>{cartTotal}</span>
              </div>
            </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default PartnerMenu;
