import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messages as msgApi, requests as reqApi } from '../services/api';
import {
  Send, Image, MapPin, User, ChevronLeft, Calendar,
  Droplets, MessageSquare, AlertCircle, RefreshCw, X, Map
} from 'lucide-react';

const BUEA_LANDMARKS = [
  { name: 'Molyko - Beside University of Buea', lat: 4.1565, lng: 9.2718 },
  { name: 'Mile 17 - Motor Park', lat: 4.1489, lng: 9.2825 },
  { name: 'Bonduma - Near Petrol Station', lat: 4.1633, lng: 9.2601 },
  { name: 'Malingo - Street 1', lat: 4.1610, lng: 9.2785 },
  { name: 'Clerks Quarters - Near Governor\'s Office', lat: 4.1522, lng: 9.2392 },
  { name: 'Buea Town - Government Station', lat: 4.1578, lng: 9.2281 },
];

export default function Chat() {
  const { user } = useAuth();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  
  const [requestsList, setRequestsList] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Read initial request_id from query params or navigation state
  useEffect(() => {
    const searchParams = new URLSearchParams(routerLocation.search);
    const initialId = searchParams.get('request_id') || routerLocation.state?.requestId;
    
    const loadRequests = async () => {
      setLoadingRequests(true);
      try {
        const res = await reqApi.getAll();
        if (res.data) {
          // Sort requests by newest first
          const sorted = [...res.data].sort((a, b) => b.id - a.id);
          setRequestsList(sorted);
          
          if (initialId) {
            const req = sorted.find(r => r.id === Number(initialId));
            if (req) {
              setActiveRequest(req);
            }
          } else if (sorted.length > 0 && !activeRequest) {
            // Do not auto-select on mobile to show requests list first
            if (window.innerWidth > 768) {
              setActiveRequest(sorted[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error loading requests:', err);
      } finally {
        setLoadingRequests(false);
      }
    };
    
    loadRequests();
  }, [routerLocation]);

  // Load messages whenever the active request changes
  useEffect(() => {
    if (!activeRequest) return;
    
    const fetchMessages = async (showLoading = true) => {
      if (showLoading) setLoadingMessages(true);
      try {
        const res = await msgApi.get(activeRequest.id);
        if (res.data) {
          setMessages(res.data);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        if (showLoading) setLoadingMessages(false);
      }
    };

    fetchMessages();
    
    // Set up auto polling for real-time chat feeling
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeRequest]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRequest) return;

    const text = inputText;
    setInputText('');

    try {
      const res = await msgApi.send({
        requestId: activeRequest.id,
        type: 'text',
        body: text
      });
      if (res.data) {
        setMessages(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSendLocation = async (landmark) => {
    if (!activeRequest) return;
    setShowLocationModal(false);

    const bodyData = JSON.stringify({
      name: landmark.name,
      lat: landmark.lat,
      lng: landmark.lng
    });

    try {
      const res = await msgApi.send({
        requestId: activeRequest.id,
        type: 'location',
        body: bodyData
      });
      if (res.data) {
        setMessages(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Failed to send location:', err);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeRequest) return;

    try {
      setLoadingMessages(true);
      const res = await msgApi.sendImage({
        requestId: activeRequest.id,
        file
      });
      if (res.data) {
        setMessages(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const formatTime = (timeStr) => {
    try {
      const parts = timeStr.split(' ');
      if (parts.length === 2) {
        // HH:MM
        return parts[1].substring(0, 5);
      }
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="chat-page-wrapper animate-in" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="chat-layout-grid" style={{
        display: 'grid',
        gridTemplateColumns: activeRequest ? '300px 1fr' : '1fr',
        height: '100%',
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-1)',
        overflow: 'hidden'
      }}>
        
        {/* Sidebar: Requests thread list */}
        <div className={`chat-sidebar-pane ${activeRequest ? 'has-active' : ''}`} style={{
          borderRight: '1px solid var(--gray-200)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: 'var(--gray-50)'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-200)', background: 'var(--white)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Active Conversations</h3>
            <p className="text-xs text-muted">Select a request thread to chat</p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {loadingRequests ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                <span className="spinner" />
              </div>
            ) : requestsList.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <MessageSquare size={36} className="empty-state-icon" />
                <div className="empty-state-title" style={{ fontSize: '0.95rem' }}>No conversations yet</div>
                <div className="empty-state-text" style={{ fontSize: '0.8rem' }}>Place or accept a request to begin chatting.</div>
              </div>
            ) : (
              requestsList.map((req) => {
                const partnerName = user.role === 'supplier' ? req.resident_name : req.supplier_name;
                const isSelected = activeRequest?.id === req.id;
                
                return (
                  <div
                    key={req.id}
                    onClick={() => setActiveRequest(req)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-100)' : 'transparent',
                      color: isSelected ? 'var(--primary-800)' : 'var(--text-primary)',
                      marginBottom: '4px',
                      transition: 'all 0.2s'
                    }}
                    className="chat-thread-item"
                  >
                    <div className="avatar avatar-sm" style={{ background: isSelected ? 'var(--primary-500)' : 'var(--primary-400)' }}>
                      {partnerName ? partnerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {partnerName}
                      </div>
                      <div className="text-xs" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', opacity: 0.8 }}>
                        <span>Qty: {req.quantity}</span>
                        <span style={{ textTransform: 'capitalize' }}>{req.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main: Message view */}
        {activeRequest ? (
          <div className="chat-messages-pane" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'var(--white)'
          }}>
            {/* Chat header */}
            <div className="chat-header" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--gray-200)',
              background: 'var(--white)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  className="btn btn-icon btn-ghost btn-sm mobile-back-btn"
                  onClick={() => setActiveRequest(null)}
                  style={{ display: 'none', width: '32px', height: '32px' }}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="avatar">
                  {(user.role === 'supplier' ? activeRequest.resident_name : activeRequest.supplier_name)?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {user.role === 'supplier' ? activeRequest.resident_name : activeRequest.supplier_name}
                  </div>
                  <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span>Request ID: {activeRequest.id}</span>
                    <span>•</span>
                    <span className={`chip chip-neutral`} style={{ padding: '1px 6px', fontSize: '10px', textTransform: 'capitalize' }}>
                      {activeRequest.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={12} />
                <span>{activeRequest.created_at.split(' ')[0]}</span>
              </div>
            </div>

            {/* Messages box */}
            <div className="chat-messages" style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#f8fafc'
            }}>
              {/* Initial Request Note */}
              <div style={{
                alignSelf: 'center',
                background: 'var(--primary-50)',
                color: 'var(--primary-900)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '85%',
                fontSize: '0.875rem',
                border: '1px solid var(--primary-100)',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Droplets size={16} /> Water Request Placed
                </div>
                <div>Requested Quantity: <strong>{activeRequest.quantity} units</strong></div>
                {activeRequest.note && (
                  <div style={{ marginTop: '6px', fontStyle: 'italic', opacity: 0.9 }}>
                    "{activeRequest.note}"
                  </div>
                )}
              </div>

              {loadingMessages ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <span className="spinner" />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '20px', fontSize: '0.85rem' }}>
                  No messages yet. Send a message to start communicating!
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_id === user.id;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`chat-bubble ${isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'}`}
                      style={{
                        alignSelf: isOwn ? 'flex-end' : 'flex-start',
                        background: isOwn ? 'linear-gradient(135deg, var(--primary-500), var(--primary-600))' : 'var(--white)',
                        color: isOwn ? 'var(--white)' : 'var(--text-primary)',
                        boxShadow: 'var(--shadow-1)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        borderBottomRightRadius: isOwn ? '4px' : 'var(--radius-lg)',
                        borderBottomLeftRadius: isOwn ? 'var(--radius-lg)' : '4px',
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      {!isOwn && (
                        <span style={{ fontSize: '10px', fontWeight: 600, opacity: 0.6, display: 'block' }}>
                          {msg.sender_name}
                        </span>
                      )}
                      
                      {/* Text Type */}
                      {msg.type === 'text' && (
                        <p style={{ fontSize: '0.9375rem', margin: 0, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                          {msg.body}
                        </p>
                      )}

                      {/* Image Type */}
                      {msg.type === 'image' && (
                        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginTop: '4px' }}>
                          <img
                            src={msg.body}
                            alt="Attachment"
                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                            onError={(e) => {
                              // If base64 fails or link fails, show placeholder
                              e.target.style.display = 'none';
                            }}
                          />
                          <a
                            href={msg.body}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '11px', color: isOwn ? '#b3e5fc' : 'var(--primary-600)', display: 'block', marginTop: '4px', textDecoration: 'underline' }}
                          >
                            View Image
                          </a>
                        </div>
                      )}

                      {/* Location Type */}
                      {msg.type === 'location' && (() => {
                        let loc = { name: 'Shared Location', lat: 0, lng: 0 };
                        try {
                          loc = JSON.parse(msg.body);
                        } catch {}
                        
                        return (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            background: isOwn ? 'rgba(255,255,255,0.1)' : 'var(--gray-50)',
                            padding: '8px',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${isOwn ? 'rgba(255,255,255,0.2)' : 'var(--gray-200)'}`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                              <MapPin size={16} style={{ color: isOwn ? '#fff' : 'var(--primary-600)' }} />
                              <span>{loc.name}</span>
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.8 }}>
                              Coordinates: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                            </div>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{
                                fontSize: '11px',
                                padding: '4px 8px',
                                border: isOwn ? '1px solid rgba(255,255,255,0.4)' : '1px solid var(--primary-200)',
                                background: isOwn ? 'transparent' : 'var(--white)',
                                color: isOwn ? 'var(--white)' : 'var(--primary-600)',
                                justifyContent: 'center'
                              }}
                            >
                              <Map size={12} /> Open in Google Maps
                            </a>
                          </div>
                        );
                      })()}

                      <span style={{
                        fontSize: '9px',
                        opacity: 0.7,
                        alignSelf: 'flex-end',
                        marginTop: '2px'
                      }}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSendMessage} className="chat-input-area" style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--gray-200)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              background: 'var(--white)'
            }}>
              {/* Image upload shortcut */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={handleImageUploadClick}
                style={{ width: '40px', height: '40px', flexShrink: 0 }}
                title="Send Image"
              >
                <Image size={20} />
              </button>

              {/* Location pin shortcut */}
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setShowLocationModal(true)}
                style={{ width: '40px', height: '40px', flexShrink: 0 }}
                title="Send Location"
              >
                <MapPin size={20} />
              </button>

              {/* Message text input */}
              <input
                className="form-input"
                placeholder="Type your message here…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 18px',
                  fontSize: '0.9rem',
                  border: '1.5px solid var(--gray-300)'
                }}
              />

              <button
                type="submit"
                className="chat-send-btn"
                disabled={!inputText.trim()}
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                  border: 'none',
                  borderRadius: '50%',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: !inputText.trim() ? 0.6 : 1,
                  flexShrink: 0
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div className="chat-messages-pane empty-state-pane" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--gray-50)',
            padding: '48px',
            textAlign: 'center',
            height: '100%'
          }}>
            <MessageSquare size={64} className="empty-state-icon" style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>No conversation active</h3>
            <p className="text-muted" style={{ maxWidth: '320px', fontSize: '0.9rem', marginTop: '6px' }}>
              Select a conversation from the active threads list to begin messaging.
            </p>
          </div>
        )}

      </div>

      {/* Location sharing dialog modal */}
      {showLocationModal && (
        <div className="modal-backdrop" onClick={() => setShowLocationModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 'min(90vw, 420px)' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} className="text-primary" /> Share Location Pin
              </div>
              <button className="modal-close" onClick={() => setShowLocationModal(false)}>
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
              Select a Buea locality/landmark to send as your delivery/current location pin:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {BUEA_LANDMARKS.map((landmark) => (
                <button
                  key={landmark.name}
                  className="btn btn-secondary btn-block"
                  onClick={() => handleSendLocation(landmark)}
                  style={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderColor: 'var(--gray-200)',
                    fontWeight: 500,
                    fontSize: '0.85rem'
                  }}
                >
                  <MapPin size={16} style={{ color: 'var(--primary-500)', marginRight: '6px' }} />
                  {landmark.name}
                </button>
              ))}
            </div>

            <div className="modal-footer" style={{ marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowLocationModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile styling overrides */}
      <style>{`
        @media (max-width: 768px) {
          .chat-layout-grid {
            grid-template-columns: 1fr !important;
          }
          
          /* Hide sidebar when chat is active */
          .chat-sidebar-pane.has-active {
            display: none !important;
          }
          
          /* Show back button when chat is active */
          .mobile-back-btn {
            display: flex !important;
          }
          
          .chat-bubble {
            max-width: 85% !important;
          }
        }
      `}</style>
    </div>
  );
}
