
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Mic, Square, Play, Pause, Trash2, Check, CheckCheck, MoreVertical } from 'lucide-react';
import API from '../../api/axios';

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const recordingTimerRef = useRef(null);
  
  // Audio playback states
  const [playingId, setPlayingId] = useState(null);
  const [playbackProgress, setPlaybackProgress] = useState({});
  const audioRef = useRef(null);
  
  const role = localStorage.getItem('role');
  const isPartner = role === 'foodPartner';

  const partnerFromState = location.state?.partner;

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get(
        `/api/messages/${conversationId}`
      );
      setMessages(res.data.messages);
      setConversation(res.data.conversation);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const endpoint = isPartner 
        ? `/api/messages/partner/${conversationId}/send`
        : `/api/messages/user/${conversationId}/send`;

      const res = await API.post(
        endpoint,
        { content: newMessage.trim() }
      );

      setMessages(prev => [...prev, res.data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Voice Recording Functions
  const getSupportedMimeType = () => {
    const types = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'audio/webm';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        setAudioChunks(chunks);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Microphone access denied:', error);
      alert('Please allow microphone access to send voice messages');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const sendVoiceMessage = async () => {
    if (audioChunks.length === 0 || sending) return;

    setSending(true);
    try {
      const mimeType = mediaRecorder?.mimeType || 'audio/webm';
      const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      const formData = new FormData();
      formData.append('voice', audioBlob, `voice.${ext}`);
      formData.append('duration', recordingTime);

      const endpoint = isPartner
        ? `/api/messages/partner/${conversationId}/voice`
        : `/api/messages/user/${conversationId}/voice`;

      const res = await API.post(endpoint, formData);

      setMessages(prev => [...prev, res.data.message]);
      setAudioChunks([]);
      setRecordingTime(0);
    } catch (error) {
      console.error('Failed to send voice:', error);
      alert('Failed to send voice message');
    } finally {
      setSending(false);
    }
  };

  const cancelRecording = () => {
    setAudioChunks([]);
    setRecordingTime(0);
  };

  // Audio Playback with progress
  const togglePlayAudio = (msgId, voiceUrl, duration) => {
    if (playingId === msgId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      const audio = new Audio(voiceUrl);
      audioRef.current = audio;
      
      audio.ontimeupdate = () => {
        const progress = (audio.currentTime / (duration || audio.duration)) * 100;
        setPlaybackProgress(prev => ({ ...prev, [msgId]: progress }));
      };
      
      audio.onended = () => {
        setPlayingId(null);
        setPlaybackProgress(prev => ({ ...prev, [msgId]: 0 }));
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        console.error('Audio source:', voiceUrl);
        console.error('Error code:', audio.error?.code, 'Message:', audio.error?.message);
        alert('Failed to play audio. The audio format may not be supported or the file may be corrupted.');
        setPlayingId(null);
      };
      
      audio.play().catch(err => {
        console.error('Play error:', err);
        alert('Failed to play audio: ' + err.message);
        setPlayingId(null);
      });
      
      setPlayingId(msgId);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      await API.delete(
        `/api/messages/message/${messageId}`
      );
      setMessages(prev => prev.filter(m => m._id !== messageId));
      setSelectedMessage(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  // Delete entire conversation
  const deleteConversation = async () => {
    try {
      await API.delete(
        `/api/messages/conversation/${conversationId}`
      );
      // Navigate back to conversations list
      navigate(-1);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete chat');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOtherParty = () => {
    if (partnerFromState) return partnerFromState;
    if (!conversation) return null;
    return isPartner ? conversation.user : conversation.partner;
  };

  const otherParty = getOtherParty();
  const otherName = isPartner 
    ? (otherParty?.fullName || 'User')
    : (otherParty?.name || 'Restaurant');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#EAEAEA]">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-[#F5F5F5] hover:bg-[#EEE] flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-[#666]" />
          </button>
          
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FDF8F5] flex items-center justify-center border border-[#EEE]">
            {otherParty?.profilePic ? (
              <img src={otherParty.profilePic} alt="" className="w-full h-full object-cover" />
            ) : (
              <MessageCircle size={18} className="text-[#CCC]" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-[#1A1A1A] font-bold truncate">{otherName}</h1>
            <p className="text-[#999] text-xs">
              {isPartner ? 'Customer' : (otherParty?.category || 'Restaurant')}
            </p>
          </div>

          {/* Three-dot menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full bg-[#F5F5F5] hover:bg-[#EEE] flex items-center justify-center transition-colors"
            >
              <MoreVertical size={20} className="text-[#666]" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#EAEAEA] overflow-hidden z-50">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600"
                  >
                    <Trash2 size={18} />
                    <span className="font-medium">Delete Chat</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="p-6">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] text-center mb-2">
                Delete Chat?
              </h2>
              <p className="text-[#666] text-center text-sm mb-6">
                This will delete all messages in this conversation. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#F5F5F5] hover:bg-[#EEE] text-[#1A1A1A] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    deleteConversation();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FDF8F5]" onClick={() => { setSelectedMessage(null); setShowMenu(false); }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-[#F0F0F0]">
              <MessageCircle size={28} className="text-[#10B981]/20" />
            </div>
            <p className="text-[#999] text-sm font-medium">No messages yet</p>
            <p className="text-[#CCC] text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = isPartner 
              ? msg.senderModel === 'foodpartner'
              : msg.senderModel === 'user';
            const progress = playbackProgress[msg._id] || 0;

            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'} relative group`}
              >
                {/* Delete button - only for own messages */}
                {isMine && selectedMessage === msg._id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMessage(msg._id); }}
                    className="absolute w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all "
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                )}
                
                <div
                  onClick={(e) => { e.stopPropagation(); isMine && setSelectedMessage(selectedMessage === msg._id ? null : msg._id); }}
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm cursor-pointer transition-all ${
                    isMine
                      ? 'bg-gradient-to-r from-[#34D399] to-[#10B981] text-white rounded-br-none'
                      : 'bg-white border border-[#EAEAEA] text-[#1A1A1A] rounded-bl-none'
                  } ${selectedMessage === msg._id ? 'ring-2 ring-red-300' : ''}`}
                >
                  {msg.messageType === 'voice' ? (
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePlayAudio(msg._id, msg.voiceUrl, msg.voiceDuration); }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isMine ? 'bg-white/20 hover:bg-white/30' : 'bg-[#10B981]/10 hover:bg-[#10B981]/20'
                        }`}
                      >
                        {playingId === msg._id ? (
                          <Pause size={16} className={isMine ? 'text-white' : 'text-[#10B981]'} />
                        ) : (
                          <Play size={16} className={isMine ? 'text-white' : 'text-[#10B981]'} fill="currentColor" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className={`h-1 rounded-full overflow-hidden ${isMine ? 'bg-white/30' : 'bg-[#10B981]/20'}`}>
                          <div 
                            className={`h-full rounded-full transition-all duration-100 ${isMine ? 'bg-white' : 'bg-[#10B981]'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-[#999]'}`}>
                          {formatTime(msg.voiceDuration || 0)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[14px] leading-relaxed font-medium">{msg.content}</p>
                  )}
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-tighter ${isMine ? 'text-white/70' : 'text-[#999]'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {/* Read/Unread indicator - only for sent messages */}
                    {isMine && (
                      msg.read ? (
                        <CheckCheck size={14} className="text-white" />
                      ) : (
                        <Check size={14} className="text-white/50" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white border-t border-[#EAEAEA] px-4 py-3 pb-8">
        {/* Recording UI */}
        {isRecording ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-red-50 border border-red-200 rounded-full px-5 py-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-600 font-semibold">{formatTime(recordingTime)}</span>
              <span className="text-red-400 text-sm">Recording...</span>
            </div>
            <button
              onClick={stopRecording}
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg"
            >
              <Square size={18} className="text-white" fill="white" />
            </button>
          </div>
        ) : audioChunks.length > 0 ? (
          <div className="flex items-center gap-3">
            <button
              onClick={cancelRecording}
              className="w-12 h-12 rounded-full bg-[#F5F5F5] hover:bg-[#EEE] flex items-center justify-center transition-all"
            >
              <span className="text-[#999] text-xl">×</span>
            </button>
            <div className="flex-1 flex items-center gap-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-full px-5 py-3">
              <Mic size={18} className="text-[#10B981]" />
              <span className="text-[#10B981] font-semibold">{formatTime(recordingTime)}</span>
              <span className="text-[#10B981]/70 text-sm">Ready to send</span>
            </div>
            <button
              onClick={sendVoiceMessage}
              disabled={sending}
              className="w-12 h-12 rounded-full bg-[#10B981] hover:scale-105 flex items-center justify-center transition-all shadow-lg"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={18} className="text-white" />
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-[#F5F5F5] border border-transparent rounded-full px-5 py-3 text-[#1A1A1A] placeholder:text-[#BBB] focus:outline-none focus:bg-white focus:border-[#10B981]/30 transition-all"
            />
            {newMessage.trim() ? (
              <button
                type="submit"
                disabled={sending}
                className="w-12 h-12 rounded-full bg-[#10B981] hover:scale-105 flex items-center justify-center transition-all shadow-lg shadow-emerald-100"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={18} className="text-white" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="w-12 h-12 rounded-full bg-[#10B981] hover:scale-105 flex items-center justify-center transition-all shadow-lg shadow-emerald-100"
              >
                <Mic size={18} className="text-white" />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Messages;