import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import API from '../../api/axios';

const ReelView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from navigation state
  const { filteredVideos = [], startIndex = 0, partner = null } = location.state || {};
  
  const [items, setItems] = useState(filteredVideos);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [activeFood, setActiveFood] = useState(null);
  const [commentsCache, setCommentsCache] = useState({});
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [posting, setPosting] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  
  const containerRef = useRef(null);
  const videoRefs = useRef(new Map());
  const inputRef = useRef(null);
  
  // Swipe gesture values
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 100], [1, 0.5]);
  const scale = useTransform(x, [0, 100], [1, 0.95]);

  // Scroll to start index on mount
  useEffect(() => {
    if (containerRef.current && startIndex > 0) {
      const scrollTo = startIndex * window.innerHeight;
      containerRef.current.scrollTo({ top: scrollTo, behavior: 'instant' });
    }
  }, [startIndex]);

  // Video autoplay on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!(video instanceof HTMLVideoElement)) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.muted = !soundOn;
            video.play().catch(() => {});
            // Update current index based on which video is visible
            const id = video.dataset.id;
            const idx = items.findIndex(item => item._id === id);
            if (idx !== -1) setCurrentIndex(idx);
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    );
    videoRefs.current.forEach((vid) => observer.observe(vid));
    return () => observer.disconnect();
  }, [items, soundOn]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      video.muted = !soundOn;
    });
  }, [soundOn]);

  const setVideoRef = (id) => (el) => {
    if (!el) { videoRefs.current.delete(id); return; }
    videoRefs.current.set(id, el);
  };

  // Handle swipe-to-back gesture
  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100 && Math.abs(info.velocity.x) > 100) {
      navigate(-1);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }
  };

  // Like handler
  const handleLike = async (item) => {
    try {
      const res = await API.post('/api/food/like', 
        { foodId: item._id }
      );
      setItems(prev => prev.map(v => 
        v._id === item._id 
          ? { ...v, likeCount: res.data.like ? (v.likeCount || 0) + 1 : Math.max(0, (v.likeCount || 0) - 1) }
          : v
      ));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Save handler
  const handleSave = async (item) => {
    try {
      const res = await API.post('/api/food/save',
        { foodId: item._id }
      );
      setItems(prev => prev.map(v =>
        v._id === item._id
          ? { ...v, savesCount: res.data.save ? (v.savesCount || 0) + 1 : Math.max(0, (v.savesCount || 0) - 1) }
          : v
      ));
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  // Comments handlers
  const openComments = async (foodId) => {
    setActiveFood(foodId);
    setCommentText('');
    setLoadingComments(true);
    try {
      const res = await API.get(`/api/food/comments?foodId=${foodId}`);
      setCommentsCache(prev => ({ ...prev, [foodId]: res.data.comments || [] }));
    } catch (e) {
      console.error('Failed to load comments', e);
      setCommentsCache(prev => ({ ...prev, [foodId]: [] }));
    } finally {
      setLoadingComments(false);
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const closeComments = () => {
    setActiveFood(null);
    setCommentText('');
  };

  const postComment = async () => {
    if (!commentText.trim() || posting) return;
    setPosting(true);
    try {
      const res = await API.post('/api/food/comment', {
        foodId: activeFood,
        comment: commentText.trim()
      });
      setCommentsCache(prev => ({
        ...prev,
        [activeFood]: [...(prev[activeFood] || []), res.data.comment]
      }));
      setCommentText('');
      // Update comment count
      setItems(prev => prev.map(v =>
        v._id === activeFood
          ? { ...v, commentsCount: (v.commentsCount || 0) + 1 }
          : v
      ));
    } catch (e) {
      console.error('Failed to post comment', e);
    } finally {
      setPosting(false);
    }
  };

  const currentComments = activeFood ? (commentsCache[activeFood] || []) : [];

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/40">No videos to show</p>
      </div>
    );
  }

  return (
    <motion.div
      style={{ x, opacity, scale }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.2, right: 0 }}
      onDragEnd={handleDragEnd}
      dragDirectionLock
      className="fixed inset-0 bg-black z-50"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-[60] w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10 hover:bg-black/70 transition-colors"
      >
        <ArrowLeft size={20} className="text-white" />
      </button>

      {/* Swipe indicator */}
      <div className="fixed top-1/2 left-2 -translate-y-1/2 z-[55] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.3, x: 0 }}
          className="flex items-center gap-1 text-white/30 text-xs"
        >
          <ArrowLeft size={14} />
          <span>Swipe</span>
        </motion.div>
      </div>

      {/* Reels Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide md:flex md:justify-center"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        <div className="w-full md:max-w-[450px]">
        {items.map((item, index) => (
          <div
            key={item._id}
            className="h-screen w-full snap-start relative flex items-center justify-center"
          >
            {/* Video */}
            <video
              ref={setVideoRef(item._id)}
              data-id={item._id}
              src={item.video}
              className="absolute inset-0 w-full h-full object-cover"
              muted={!soundOn}
              playsInline
              loop
              preload="metadata"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

            {/* Actions (right side) */}
            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
              {/* Sound */}
              <button
                onClick={() => setSoundOn((v) => !v)}
                className="flex flex-col items-center gap-1"
                aria-label={soundOn ? 'Mute' : 'Unmute'}
              >
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  {soundOn ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  )}
                </div>
                <span className="text-white text-xs font-semibold">{soundOn ? 'On' : 'Off'}</span>
              </button>

              {/* Like */}
              <button
                onClick={() => handleLike(item)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                </div>
                <span className="text-white text-xs font-semibold">{item.likeCount ?? 0}</span>
              </button>

              {/* Comment */}
              <button
                onClick={() => openComments(item._id)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                  </svg>
                </div>
                <span className="text-white text-xs font-semibold">{item.commentsCount ?? 0}</span>
              </button>

              {/* Save */}
              <button
                onClick={() => handleSave(item)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                  </svg>
                </div>
                <span className="text-white text-xs font-semibold">{item.savesCount ?? 0}</span>
              </button>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-6 left-4 right-16">
            
              {/* Name */}
              {item.name && (
                <h3 className="text-white font-bold text-2xl mb-5 text-shadow">{item.name}</h3>
              )}
              
                 {/* Price badge */}
              {item.price > 0 && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r px-4 py-2 rounded-full mb-3 shadow-lg shadow-[#E23744]/30">
                  <span className="text-white font-bold text-lg">Rs.
                    {item.price}</span>
                </div>
              )}
  

              {/* Partner info */}
              <div className="flex items-center gap-3">
                {partner && (
                  <Link
                    to={`/food-partner/profile/${partner._id}`}
                    className="flex items-center gap-2 group flex-1 min-w-0"
                  >
                    <div className="w-9 h-9 rounded-full border-2 border-[#E23744] overflow-hidden bg-white/10 flex-shrink-0">
                      {partner.profilePic ? (
                        <img src={partner.profilePic} alt={partner.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/60 text-sm font-bold">
                          {partner.name?.[0]?.toUpperCase() || 'R'}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-white font-semibold text-sm group-hover:text-[#E23744] transition-colors truncate">
                        {partner.name}
                      </span>
                      <span className="text-white/50 text-xs">{partner.category || 'Restaurant'}</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Comments Sheet */}
      {activeFood && (
        <div 
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end"
          onClick={(e) => { if (e.target === e.currentTarget) closeComments(); }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg mx-auto bg-[#1a1a1a] rounded-t-2xl border-t border-white/10 max-h-[75vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="text-white font-bold text-base">Comments</span>
              <button
                onClick={closeComments}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
              {loadingComments ? (
                <p className="text-white/50 text-center py-8">Loading...</p>
              ) : currentComments.length === 0 ? (
                <p className="text-white/50 text-center py-8">No comments yet. Be the first! 👇</p>
              ) : (
                currentComments.map((c, i) => (
                  <div key={c._id ?? i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E23744]/20 border border-[#E23744]/30 flex items-center justify-center text-[#E23744] text-xs font-bold flex-shrink-0">
                      {c.user?.profilePic ? (
                        <img src={c.user.profilePic} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (c.user?.fullName?.[0] ?? 'U').toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="text-white/50 text-xs font-semibold block">{c.user?.fullName || 'User'}</span>
                      <span className="text-white text-sm">{c.text}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="flex gap-3 p-4 border-t border-white/10 bg-[#1a1a1a]">
              <input
                ref={inputRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && postComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#E23744]"
              />
              <button
                onClick={postComment}
                disabled={!commentText.trim() || posting}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                  commentText.trim() ? 'bg-[#E23744]' : 'bg-white/10'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={commentText.trim() ? 'white' : 'rgba(255,255,255,0.3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
};

export default ReelView;
