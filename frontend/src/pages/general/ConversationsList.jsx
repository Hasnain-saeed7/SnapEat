import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import API from '../../api/axios';
import BottomNav from '../../components/BottomNav';

const ConversationsList = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem('role');
  const isPartner = role === 'foodPartner';

  useEffect(() => {
    fetchConversations();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const endpoint = isPartner
        ? '/api/messages/partner/conversations'
        : '/api/messages/user/conversations';

      const res = await API.get(endpoint);
      setConversations(res.data.conversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (convo) => {
    navigate(`/messages/${convo._id}`, {
      state: {
        partner: isPartner ? convo.user : convo.partner
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E23744] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#EAEAEA]">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-[#F5F5F5] hover:bg-[#EEE] flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-[#666]" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">Messages</h1>
        </div>
      </div>

      {/* Conversations List */}
      <div className="px-4 py-4">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 border border-[#F0F0F0] shadow-sm">
              <MessageCircle size={36} className="text-[#CCC]" />
            </div>
            <p className="text-[#666] text-sm font-medium">No conversations yet</p>
            <p className="text-[#999] text-xs mt-1">
              {isPartner 
                ? 'Customers will message you here'
                : 'Start a conversation with a restaurant'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((convo) => {
              const other = isPartner ? convo.user : convo.partner;
              const name = isPartner ? other?.fullName : other?.name;
              const subtitle = isPartner ? 'Customer' : (other?.category || 'Restaurant');
              const hasUnread = convo.unreadCount > 0;

              return (
                <button
                  key={convo._id}
                  onClick={() => handleConversationClick(convo)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all shadow-sm ${
                    hasUnread 
                      ? 'bg-[#FFF5F5] border-[#E23744]/20 hover:bg-[#FFEEEE]' 
                      : 'bg-white border-[#F0F0F0] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FDF8F5] flex items-center justify-center shrink-0 border border-[#EEE]">
                      {other?.profilePic ? (
                        <img src={other.profilePic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <MessageCircle size={20} className="text-[#CCC]" />
                      )}
                    </div>
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E23744] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                        {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className={`text-[14px] truncate ${hasUnread ? 'text-[#1A1A1A] font-bold' : 'text-[#1A1A1A] font-semibold'}`}>
                      {name || 'Unknown'}
                    </h3>
                    <p className={`text-[12px] truncate ${hasUnread ? 'text-[#666] font-medium' : 'text-[#999]'}`}>
                      {convo.lastMessage || subtitle}
                    </p>
                  </div>
                  
                  <div className="shrink-0 text-right flex flex-col items-end gap-1">
                    <p className={`text-[10px] ${hasUnread ? 'text-[#E23744] font-semibold' : 'text-[#CCC]'}`}>
                      {convo.lastMessageAt 
                        ? new Date(convo.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                        : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ConversationsList;
