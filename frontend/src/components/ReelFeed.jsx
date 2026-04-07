
// import React, { useEffect, useRef, useState } from 'react'
// import { Link } from 'react-router-dom'
// import axios from 'axios'

// const ReelFeed = ({ items = [], onLike, onSave, onCommentAdded, onCommentDeleted, currentUser, emptyMessage = 'No videos yet.' }) => {
//   const videoRefs = useRef(new Map())

//   const [activeFood, setActiveFood] = useState(null)
//   const [commentsCache, setCommentsCache] = useState({})
//   const [commentText, setCommentText] = useState('')
//   const [loadingComments, setLoadingComments] = useState(false)
//   const [posting, setPosting] = useState(false)
//   const [deleting, setDeleting] = useState(null)
//   const [soundOn, setSoundOn] = useState(false)
//   const inputRef = useRef(null)

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           const video = entry.target
//           if (!(video instanceof HTMLVideoElement)) return
//           if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
//             video.muted = !soundOn
//             video.play().catch(() => {})
//           } else {
//             video.pause()
//           }
//         })
//       },
//       { threshold: [0, 0.25, 0.6, 0.9, 1] }
//     )
//     videoRefs.current.forEach((vid) => observer.observe(vid))
//     return () => observer.disconnect()
//   }, [items, soundOn])

//   useEffect(() => {
//     videoRefs.current.forEach((video) => {
//       video.muted = !soundOn
//     })
//   }, [soundOn])

//   const setVideoRef = (id) => (el) => {
//     if (!el) { videoRefs.current.delete(id); return }
//     videoRefs.current.set(id, el)
//   }

//   const openComments = async (foodId) => {
//     setActiveFood(foodId)
//     setCommentText('')
//     setLoadingComments(true)
//     try {
//       const res = await axios.get(`http://localhost:3000/api/food/comments?foodId=${foodId}`, { withCredentials: true })
//       setCommentsCache(prev => ({ ...prev, [foodId]: res.data.comments || [] }))
//     } catch (e) {
//       console.error('Failed to load comments', e)
//       setCommentsCache(prev => ({ ...prev, [foodId]: [] }))
//     } finally {
//       setLoadingComments(false)
//     }
//     setTimeout(() => inputRef.current?.focus(), 300)
//   }

//   const closeComments = () => {
//     setActiveFood(null)
//     setCommentText('')
//   }

//   const postComment = async () => {
//     if (!commentText.trim() || posting) return
//     setPosting(true)
//     try {
//       const res = await axios.post('http://localhost:3000/api/food/comment', {
//         foodId: activeFood,
//         comment: commentText.trim()
//       }, { withCredentials: true })
//       setCommentsCache(prev => ({
//         ...prev,
//         [activeFood]: [...(prev[activeFood] || []), res.data.comment]
//       }))
//       setCommentText('')
//       if (onCommentAdded) onCommentAdded(activeFood)
//     } catch (e) {
//       console.error('Failed to post comment', e)
//     } finally {
//       setPosting(false)
//     }
//   }

//   const handleKeyDown = (e) => { if (e.key === 'Enter') postComment() }

//   const deleteComment = async (commentId) => {
//     if (deleting) return
//     setDeleting(commentId)
//     try {
//       await axios.delete(`http://localhost:3000/api/food/comment/${commentId}`, { withCredentials: true })
//       setCommentsCache(prev => ({
//         ...prev,
//         [activeFood]: (prev[activeFood] || []).filter(c => c._id !== commentId)
//       }))
//       if (onCommentDeleted) onCommentDeleted(activeFood)
//     } catch (e) {
//       console.error('Failed to delete comment', e)
//     } finally {
//       setDeleting(null)
//     }
//   }

//   const currentComments = activeFood ? (commentsCache[activeFood] || []) : []

//   // Pastel Pantry comment sheet styles
//   const s = {
//     overlay: {
//       position: 'fixed', inset: 0, zIndex: 200,
//       background: 'rgba(61,43,31,0.4)',
//       backdropFilter: 'blur(6px)',
//       display: 'flex', alignItems: 'flex-end',
//       animation: 'fadeIn 0.2s ease',
//     },
//     sheet: {
//       width: '100%', maxWidth: 480, margin: '0 auto',
//       background: '#fdf6f0',
//       borderRadius: '24px 24px 0 0',
//       borderTop: '2px solid rgba(232,165,152,0.3)',
//       maxHeight: '75vh',
//       display: 'flex', flexDirection: 'column',
//       animation: 'slideUp 0.3s ease',
//       overflow: 'hidden',
//       boxShadow: '0 -8px 40px rgba(196,120,110,0.15)',
//     },
//     sheetHeader: {
//       display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//       padding: '16px 20px 12px',
//       borderBottom: '1px solid rgba(232,165,152,0.2)',
//       background: '#fdf6f0',
//     },
//     sheetTitle: {
//       color: '#3d2b1f', fontSize: 15, fontWeight: 800,
//       fontFamily: "'Segoe UI', sans-serif",
//     },
//     closeBtn: {
//       background: 'rgba(232,165,152,0.15)',
//       border: '1px solid rgba(232,165,152,0.3)',
//       cursor: 'pointer',
//       width: 30, height: 30, borderRadius: '50%',
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       color: '#c4786e',
//     },
//     commentsList: {
//       flex: 1, overflowY: 'auto', padding: '12px 20px',
//       display: 'flex', flexDirection: 'column', gap: 14,
//       background: '#fdf6f0',
//     },
//     commentItem: {
//       display: 'flex', gap: 10, alignItems: 'flex-start',
//       padding: '10px 12px', borderRadius: 14,
//       background: '#fff',
//       border: '1px solid rgba(232,165,152,0.15)',
//       boxShadow: '0 2px 8px rgba(196,120,110,0.06)',
//     },
//     avatar: {
//       width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
//       background: 'rgba(232,165,152,0.2)',
//       border: '1.5px solid rgba(232,165,152,0.4)',
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       color: '#c4786e', fontSize: 13, fontWeight: 700,
//       fontFamily: "'Segoe UI', sans-serif",
//       objectFit: 'cover',
//     },
//     commentBody: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
//     commentUser: {
//       fontSize: 12, fontWeight: 700, color: '#c4786e',
//       fontFamily: "'Segoe UI', sans-serif",
//     },
//     commentText: {
//       fontSize: 14, color: '#3d2b1f', lineHeight: 1.4,
//       fontFamily: "'Segoe UI', sans-serif",
//     },
//     deleteBtn: {
//       background: 'none', border: 'none', cursor: 'pointer',
//       color: 'rgba(196,120,110,0.4)',
//       padding: 4,
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       transition: 'color 0.2s ease',
//       marginLeft: 'auto',
//     },
//     emptyComments: {
//       textAlign: 'center', padding: '32px 0',
//       color: '#9c7c6e', fontSize: 13,
//       fontFamily: "'Segoe UI', sans-serif",
//     },
//     inputRow: {
//       display: 'flex', gap: 10, alignItems: 'center',
//       padding: '12px 16px 24px',
//       borderTop: '1px solid rgba(232,165,152,0.2)',
//       background: '#fdf6f0',
//     },
//     input: {
//       flex: 1,
//       background: '#fff',
//       border: '1.5px solid rgba(232,165,152,0.3)',
//       borderRadius: 14, padding: '10px 14px',
//       color: '#3d2b1f', fontSize: 14, outline: 'none',
//       fontFamily: "'Segoe UI', sans-serif",
//       boxShadow: '0 2px 8px rgba(196,120,110,0.06)',
//     },
//     sendBtn: {
//       width: 40, height: 40, borderRadius: 12, border: 'none',
//       background: commentText.trim()
//         ? 'linear-gradient(135deg, #e8a598, #d4847a)'
//         : 'rgba(232,165,152,0.15)',
//       cursor: commentText.trim() ? 'pointer' : 'default',
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       transition: 'background 0.2s ease', flexShrink: 0,
//       boxShadow: commentText.trim() ? '0 4px 12px rgba(196,120,110,0.3)' : 'none',
//     },
//   }

//   return (
//     <>
//       <div className="reels-page">
//         <div className="reels-feed" role="list">
//           {items.length === 0 && (
//             <div className="empty-state"><p>{emptyMessage}</p></div>
//           )}

//           {items.map((item) => (
//             <section key={item._id} className="reel" role="listitem">
//                <video
//                  ref={setVideoRef(item._id)}
//                 className="reel-video"
//                 src={item.video}
//                 muted={!soundOn}
//                 playsInline
//                  loop
//                preload="metadata"
//               />

//               <div className="reel-overlay">
//                 <div className="reel-overlay-gradient" aria-hidden="true" />
//                 <div className="reel-actions">

//                   {/* Sound */}
//                   <div className="reel-action-group">
//                     <button
//                       onClick={() => setSoundOn((v) => !v)}
//                       className="reel-action"
//                       aria-label={soundOn ? 'Mute' : 'Unmute'}
//                     >
//                       {soundOn ? (
//                         <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
//                           <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
//                           <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
//                         </svg>
//                       ) : (
//                         <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
//                           <line x1="23" y1="9" x2="17" y2="15" />
//                           <line x1="17" y1="9" x2="23" y2="15" />
//                         </svg>
//                       )}
//                     </button>
//                     <div className="reel-action__count">{soundOn ? 'On' : 'Off'}</div>
//                   </div>

//                   {/* Like */}
//                   <div className="reel-action-group">
//                     <button onClick={onLike ? () => onLike(item) : undefined} className="reel-action" aria-label="Like">
//                       <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
//                       </svg>
//                     </button>
//                     <div className="reel-action__count">{item.likeCount ?? 0}</div>
//                   </div>

//                   {/* Save */}
//                   <div className="reel-action-group">
//                     <button onClick={onSave ? () => onSave(item) : undefined} className="reel-action" aria-label="Bookmark">
//                       <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
//                       </svg>
//                     </button>
//                     <div className="reel-action__count">{item.savesCount ?? 0}</div>
//                   </div>

//                   {/* Comment */}
//                   <div className="reel-action-group">
//                     <button className="reel-action" aria-label="Comments" onClick={() => openComments(item._id)}>
//                       <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
//                       </svg>
//                     </button>
//                     <div className="reel-action__count">{item.commentsCount ?? 0}</div>
//                   </div>

//                 </div>

//                 <div className="reel-content">
//                   {/* Name + Price */}
//                   {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'left', justifyContent: 'space-between', marginBottom: 18 }}> */}
//                       <div style={{ display:'flex' , flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 , gap: 10}}>
//                     <h3 style={{ color: '#fff', fontSize: 25, fontWeight: 700, margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
//                       {item.name}
//                     </h3>
//                     {item.price > 0 && (
//                       <span style={{
                       
//                         color: '#fff', padding: '6px 14px', borderRadius: 20,
//                         fontSize: 20, fontWeight: 900,
//                         boxShadow: '0 4px 12px rgba(196,120,110,0.4)'
//                       }}>
//                         Rs.{item.price} 
//                       </span>
//                     )}
//                   </div>

//                   {/* Partner info */}
//                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
//                     {item.foodPartner && (() => {
//                       const partner = typeof item.foodPartner === 'object' ? item.foodPartner : null
//                       const partnerId = partner?._id ?? item.foodPartner
//                       if (!partnerId) return null
//                       return (
//                         <Link
//                           to={"/food-partner/profile/" + partnerId}
//                           style={{
//                             display: 'flex', alignItems: 'center', gap: 10,
//                             textDecoration: 'none', padding: '8px 12px',
//                             background: 'rgba(253,246,240,0.15)',
//                             backdropFilter: 'blur(8px)',
//                             borderRadius: 12, flex: 1, minWidth: 0,
//                             border: '1px solid rgba(232,165,152,0.3)',
//                           }}
//                         >
//                           <div style={{
//                             width: 36, height: 36, borderRadius: '50%',
//                             border: '2px solid rgba(232,165,152,0.8)',
//                             overflow: 'hidden', background: 'rgba(232,165,152,0.2)',
//                             display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
//                           }}>
//                             {partner?.profilePic
//                               ? <img src={partner.profilePic} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                               : <span style={{ color: '#e8a598', fontWeight: 700, fontSize: 14 }}>{partner?.name?.[0]?.toUpperCase() || 'R'}</span>
//                             }
//                           </div>
//                           <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
//                             <span style={{ color: '#fff', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                               {partner?.name || 'Restaurant'}
//                             </span>
//                             <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
//                               {partner?.category || 'Restaurant'}
//                             </span>
//                           </div>
//                         </Link>
//                       )
//                     })()}
//                   </div>
//                 </div>
//               </div>
//             </section>
//           ))}
//         </div>
//       </div>

//       {/* ── Comment Bottom Sheet ── */}
//       {activeFood && (
//         <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) closeComments() }}>
//           <div style={s.sheet}>

//             {/* Header */}
//             <div style={s.sheetHeader}>
//               <span style={s.sheetTitle}>💬 Comments</span>
//               <button style={s.closeBtn} onClick={closeComments}>
//                 <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                   <path d="M18 6 6 18M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             {/* Comments List */}
//             <div style={s.commentsList}>
//               {loadingComments ? (
//                 <p style={s.emptyComments}>Loading comments...</p>
//               ) : currentComments.length === 0 ? (
//                 <p style={s.emptyComments}>No comments yet. Be the first! 🌸</p>
//               ) : (
//                 currentComments.map((c, i) => {
//                   const isOwnComment = currentUser && c.user && c.user._id === currentUser._id
//                   return (
//                     <div key={c._id ?? i} style={s.commentItem}>
//                       {c.user?.profilePic ? (
//                         <img src={c.user.profilePic} alt={c.user.fullName || 'User'} style={{ ...s.avatar, objectFit: 'cover' }} />
//                       ) : (
//                         <div style={s.avatar}>
//                           {(c.user?.fullName?.[0] ?? c.user?.username?.[0] ?? 'U').toUpperCase()}
//                         </div>
//                       )}
//                       <div style={s.commentBody}>
//                         <span style={s.commentUser}>{c.user?.fullName ?? c.user?.username ?? 'User'}</span>
//                         <span style={s.commentText}>{c.text}</span>
//                       </div>
//                       {isOwnComment && (
//                         <button
//                           style={s.deleteBtn}
//                           onClick={() => deleteComment(c._id)}
//                           disabled={deleting === c._id}
//                           onMouseEnter={e => e.currentTarget.style.color = '#c4786e'}
//                           onMouseLeave={e => e.currentTarget.style.color = 'rgba(196,120,110,0.4)'}
//                         >
//                           {deleting === c._id ? (
//                             <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" opacity="0.3"/></svg>
//                           ) : (
//                             <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                               <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
//                             </svg>
//                           )}
//                         </button>
//                       )}
//                     </div>
//                   )
//                 })
//               )}
//             </div>

//             {/* Input */}
//             <div style={s.inputRow}>
//               <input
//                 ref={inputRef}
//                 style={s.input}
//                 placeholder="Add a comment..."
//                 value={commentText}
//                 onChange={(e) => setCommentText(e.target.value)}
//                 onKeyDown={handleKeyDown}
//               />
//               <button style={s.sendBtn} onClick={postComment} disabled={posting}>
//                 <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
//                   stroke={commentText.trim() ? '#fff' : 'rgba(196,120,110,0.4)'}
//                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
//                 </svg>
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
//         @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
//         input::placeholder { color: rgba(196,120,110,0.4) !important; }
//       `}</style>
//     </>
//   )
// }

// export default ReelFeed 
























 


import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

const ReelFeed = ({ items = [], onLike, onSave, onCommentAdded, onCommentDeleted, currentUser, emptyMessage = 'No videos yet.' }) => {
  const videoRefs = useRef(new Map())
  const [activeFood, setActiveFood] = useState(null)
  const [commentsCache, setCommentsCache] = useState({})
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [posting, setPosting] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const inputRef = useRef(null)

  // ── Original Autoplay Observer ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!(video instanceof HTMLVideoElement)) return
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.muted = !soundOn
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { threshold: [0.6] }
    )
    videoRefs.current.forEach((vid) => observer.observe(vid))
    return () => observer.disconnect()
  }, [items, soundOn])

  const setVideoRef = (id) => (el) => {
    if (!el) { videoRefs.current.delete(id); return }
    videoRefs.current.set(id, el)
  }

  // ── Comments logic ──
  const openComments = async (foodId) => {
    setActiveFood(foodId)
    setCommentText('')
    setLoadingComments(true)
    try {
      const res = await API.get(`/api/food/comments?foodId=${foodId}`)
      setCommentsCache(prev => ({ ...prev, [foodId]: res.data.comments || [] }))
    } catch (e) { console.error(e) }
    finally { setLoadingComments(false) }
    setTimeout(() => inputRef.current?.focus(), 300)
  }

  const closeComments = () => {
    setActiveFood(null)
    setCommentText('')
  }

  const postComment = async () => {
    if (!commentText.trim() || posting) return
    setPosting(true)
    try {
      const res = await API.post('/api/food/comment', {
        foodId: activeFood,
        comment: commentText.trim()
      })
      setCommentsCache(prev => ({
        ...prev,
        [activeFood]: [...(prev[activeFood] || []), res.data.comment]
      }))
      setCommentText('')
      if (onCommentAdded) onCommentAdded(activeFood)
    } catch (e) {
      console.error('Failed to post comment', e)
    } finally {
      setPosting(false)
    }
  }

  const currentComments = activeFood ? (commentsCache[activeFood] || []) : []

  return (
    <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide md:flex md:justify-center" style={{ scrollSnapType: 'y mandatory' }}>
      <div className="w-full md:max-w-[450px]">
        {items.map((item) => (
          <div key={item._id} className="h-screen w-full snap-start relative flex items-center justify-center">
            
            {/* Video (Original Fixed Path) */}
            <video
              ref={setVideoRef(item._id)}
              src={item.video}
              className="absolute inset-0 w-full h-full object-cover"
              muted={!soundOn}
              playsInline
              loop
              preload="metadata"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

            {/* Actions (Exact same as ReelView) */}
            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
              <button onClick={() => setSoundOn(!soundOn)} className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  {soundOn ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                  )}
                </div>
                <span className="text-white text-xs font-semibold">{soundOn ? 'On' : 'Off'}</span>
              </button>

              <button onClick={() => onLike(item)} className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                </div>
                <span className="text-white text-xs font-semibold">{item.likeCount ?? 0}</span>
              </button>

              <button onClick={() => openComments(item._id)} className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /></svg>
                </div>
                <span className="text-white text-xs font-semibold">{item.commentsCount ?? 0}</span>
              </button>

              <button onClick={() => onSave(item)} className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" /></svg>
                </div>
                <span className="text-white text-xs font-semibold">{item.savesCount ?? 0}</span>
              </button>
            </div>

            {/* Bottom Content (Fixed Margin & Alignment) */}
            <div className="absolute bottom-10 left-4 right-16">
              <h3 className="text-white font-bold text-2xl mb-5 text-shadow">{item.name}</h3>
              
              {item.price > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3 shadow-lg" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="text-white font-bold text-lg">Rs.{item.price}</span>
                </div>
              )}

              {/* Partner info - Fixed Bottom Gap */}
              <div className="flex items-center gap-3 mb-10">
                {item.foodPartner && (
                  <Link to={`/food-partner/profile/${item.foodPartner._id || item.foodPartner}`} className="flex items-center gap-2 group flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full border-2 border-[#E23744] overflow-hidden bg-white/10">
                      <img src={item.foodPartner.profilePic || "/default-avatar.png"} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-white font-semibold text-sm truncate">{item.foodPartner.name}</span>
                      <span className="text-white/50 text-xs">{item.foodPartner.category || 'Restaurant'}</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Comments Sheet */}
      {activeFood && (
        <div 
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end"
          onClick={(e) => { if (e.target === e.currentTarget) closeComments(); }}
        >
          <div className="w-full max-w-lg mx-auto bg-[#1a1a1a] rounded-t-2xl border-t border-white/10 max-h-[75vh] flex flex-col">
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
          </div>
        </div>
      )}

      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  )
}

export default ReelFeed