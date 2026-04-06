
import React, { useEffect, useRef, useState } from 'react';
import { Plus, Play, Star, UserPlus, UserCheck, Camera, Video, Trash2, MapPin, Phone, Edit3 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import BottomNav from './BottomNav';

const FoodPartnerProfile = () => {
  const { id } = useParams();
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [profilePic, setProfilePic] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [localVideos, setLocalVideos] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const role = localStorage.getItem('role');
  const loggedInPartnerId = localStorage.getItem('partnerId');
  const isOwner = role === 'foodPartner' && loggedInPartnerId === id;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    axios
      .get(`http://localhost:3000/api/food-partner/${id}`, { withCredentials: true })
      .then((res) => {
        setPartner(res.data.foodPartner);
        setLocalVideos(res.data.foodPartner?.foodItems ?? []);
        setFollowers(res.data.foodPartner?.followersCount ?? 0);
        setFollowing(res.data.foodPartner?.isFollowing ?? false);
        if (res.data.foodPartner.profilePic) setProfilePic(res.data.foodPartner.profilePic);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load restaurant.');
        setPartner(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const videos = localVideos;
  const category = partner?.category || 'Fast Food'; // Example default category
  const rating = 4;
  const address = partner?.address || 'Address not available';
  const contact = partner?.phone || 'Contact not available';

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePic(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('profilePic', file);
    try {
      await axios.post(`http://localhost:3000/api/food-partner/${id}/profile-pic`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
    }
  };

  const toggleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      const res = await axios.post(`http://localhost:3000/api/food-partner/${id}/follow`, {}, { withCredentials: true });
      setFollowing(res.data.isFollowing);
      setFollowers(res.data.followersCount);
    } catch (err) {
      console.error('Follow error:', err);
      alert(err.response?.data?.message || 'Failed to follow/unfollow');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId, e) => {
    e.stopPropagation();
    if (deletingId) return;
    setDeletingId(videoId);
    try {
      await axios.delete(`http://localhost:3000/api/food/${videoId}`, { withCredentials: true });
      setLocalVideos(prev => prev.filter(v => v._id !== videoId));
    } catch (err) {
      console.error('Failed to delete video:', err);
      alert(err.response?.data?.message || 'Failed to delete video.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleVideoClick = (index) => {
    navigate('/reels', {
      state: { filteredVideos: videos, startIndex: index, partner: { _id: id, name: partner?.name, profilePic, category } }
    });
  };

  if (loading) return (
    <div className="bg-[#FDF8F5] min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E23744] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-[#FDF8F5] min-h-screen flex items-center justify-center">
      <p className="text-[#666] text-sm">{error}</p>
    </div>
  );

  return (
    <div className="bg-[#FDF8F5] min-h-screen text-[#1A1A1A] pb-24" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
      {/* ── Main Header Section ── */}
      <div className="px-4 pt-6 pb-4 border-b border-[#EAEAEA] bg-white/60 backdrop-blur-md">
        <div className="flex gap-4">
          
          {/* Left: Profile Picture */}
          <div
            className={`relative w-[80px] h-[80px] shrink-0 rounded-full overflow-hidden flex items-center justify-center ${isOwner ? 'cursor-pointer' : ''}`}
            onClick={() => isOwner && fileInputRef.current.click()}
            style={{
              background: 'linear-gradient(135deg, #FF7E7E 0%, #E23744 100%)',
              padding: '3px'
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white" style={{ padding: '2px' }}>
              <div className="w-full h-full rounded-full overflow-hidden bg-[#FDF8F5] flex items-center justify-center">
                {profilePic
                  ? <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  : <Camera size={24} className="text-[#E23744]/30" />
                }
              </div>
            </div>
            {isOwner && (
              <>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleProfilePicUpload} />
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#FF7E7E] to-[#E23744] flex items-center justify-center pointer-events-none shadow-lg">
                  <Camera size={11} className="text-white" />
                </div>
              </>
            )}
          </div>

          {/* Center: Name & Rating */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h1 className="text-[24px] font-extrabold text-[#1A1A1A] leading-tight truncate mb-1">
              {partner?.name || 'Restaurant'}
            </h1>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14}
                  fill={i < rating ? '#F59E0B' : 'none'}
                  color={i < rating ? '#F59E0B' : '#EAEAEA'}
                />
              ))}
            </div>
          </div>

          {/* Right: Category Badge + Upload Button */}
          <div className="shrink-0 flex flex-col items-end gap-4">
            
            {/* ── Teal Green Fast Food Badge ── */}
            <span 
              className="px-3 py-1 text-[#10B981] text-[11px] font-bold rounded-full border border-[#10B981]/30"
              style={{
                background: '#DCFCE7' // Tez Green BG
              }}
            >
              {category}
            </span>

            {isOwner && (
              /* ── Teal Green Upload Button ── */
              <button
                className="text-[#10B981] text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-all duration-200 border border-[#10B981]/30 hover:scale-105"
                style={{
                  background: '#DCFCE7' // Tez Green BG
                }}
                onClick={() => navigate('/food-partner/create-food')}
              >
                <Plus size={14} strokeWidth={2.5} /> Upload
              </button>
            )}
            
            {/* Baki buttons (Follow) same rahengy color architecture ke mutabiq */}
            {!isOwner && (
                <button
                className={`px-4 py-2 rounded-full text-[11px] font-bold flex items-center gap-12 transition-all duration-200 ${
                  following ? 'bg-white text-[#666] border border-[#EEE]' : 'text-[#E23744] border border-[#E23744]'
                } ${followLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                style={{
                   background: following ? '#FFF' : 'transparent'
                }}
                onClick={toggleFollow}
                disabled={followLoading}
              >
                {following ? <UserCheck size={13} /> : <UserPlus size={13} />}
                {followLoading ? '...' : following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Address & Contact */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-[#666] text-[13px]">
            <MapPin size={28} className="text-[#37d9e2] shrink-0" />
            <span className="truncate">{address}</span>
          </div>
          <div className="flex items-center gap-2 text-[#666] text-[13px]">
            <Phone size={28} className="text-[#E23744] shrink-0" />
            <span>{contact}</span>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="mx-4 mt-4 mb-4 flex gap-3">
        <div className="flex-1 flex flex-col items-center py-4 rounded-2xl bg-brown border border-[#D9D9D9] shadow-sm">
          <p className="text-3xl font-black text-[#1A1A1A]">{followers}</p>
          <p className="text-[11px] mt-0.5 text-[#999]">Followers</p>
        </div>
        
        {isOwner && (
          <button 
            onClick={() => navigate('/food-partner/register', { 
              state: { 
                isEdit: true, 
                partnerData: {
                  _id: id,
                  name: partner?.name,
                  contactName: partner?.contactName,
                  phone: partner?.phone,
                  email: partner?.email,
                  address: partner?.address,
                  category: partner?.category
                }
              }
            })}
            className="flex-1 flex flex-col items-center justify-center py-4 rounded-2xl bg-brown border border-[#D9D9D9] shadow-sm transition-all hover:bg-[#FAFAFA]"
          >
            <Edit3 size={20} className="text-black mb-1" />
            <p className="text-[11px] text-black">Edit Profile </p> 
            
          </button>
        )}
      </div>

      {/* ── Place Order & Message CTAs ── */}
      {!isOwner && (
        <div className="mx-4 mb-4 flex gap-3">
          <button
            onClick={() => navigate(`/partner/${id}/menu`)}
            className="flex-1 py-4 rounded-2xl text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
            style={{
              background: '#059669',
              boxShadow: '0 6px 20px rgba(226, 55, 68, 0.25)',
            }}
          >
            Place Order
          </button>
          <button
            onClick={async () => {
              try {
                const res = await axios.post(`http://localhost:3000/api/messages/user/conversation/${id}`, {}, { withCredentials: true });
                navigate(`/messages/${res.data.conversation._id}`, {
                  state: { partner: { _id: id, name: partner?.name, profilePic, category } }
                });
              } catch (err) { alert('Please login to message'); }
            }}
            className="py-4 px-6 rounded-2xl bg-brown-1800 border border-[#D9D9D9] text-[#666] flex items-center justify-center transition-all hover:bg-[#FAFAFA]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Video Grid ── */}
      <div className="px-1">
        <div className="px-3 py-2 border-b border-[#F0F0F0] mb-1">
          <p className="text-[12px] text-[#999] font-semibold uppercase tracking-wider">Videos</p>
        </div>
        
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Video size={28} className="text-[#CCC]" />
            <p className="text-[#999] text-sm">No videos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {videos.map((video, index) => (
              <div
                key={video._id}
                className="relative aspect-square cursor-pointer group overflow-hidden bg-[#F5F5F5]"
                onClick={() => handleVideoClick(index)}
              >
                <video src={video.video} muted playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white shadow-sm">
                  <Play size={10} fill="white" />
                  <span className="text-[10px] font-bold">{video.likeCount ?? 0}</span>
                </div>
                {isOwner && (
                  <button
                    onClick={(e) => handleDeleteVideo(video._id, e)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-md text-[#E23744]"
                  >
                    <Trash2 size={12} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default FoodPartnerProfile;