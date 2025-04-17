import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, Send, User, Bot, 
  Menu, Plus, Settings, Trash2, X,
  LogOut, Loader2, AlertCircle, ChevronDown, ChevronUp,
  Edit, Copy, ThumbsUp, ThumbsDown, Share
} from 'lucide-react';
import { 
  auth, db, collection, addDoc, serverTimestamp,
  query, where, onSnapshot, orderBy, doc, deleteDoc,
  signOut, getDocs, writeBatch, updateDoc, limit
} from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

const ChatDashboard = () => {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState({
    messages: false,
    conversations: false,
    ai: false,
    general: false
  });
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [editingTitle, setEditingTitle] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [messageFeedback, setMessageFeedback] = useState({});

  // OpenAI API configuration
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

  // Get AI response from OpenAI API
  const getAIResponse = async (userMessage, contextMessages = []) => {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      };

      // Format the conversation history for the API
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Answer questions clearly and concisely.'
        },
        ...contextMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      const body = {
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      };

      const response = await fetch(OPENAI_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get AI response');
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`AI service error: ${error.message}`);
    }
  };

  // Debounced window resize handler
  const handleResize = useCallback(debounce(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) {
      setIsSidebarOpen(true);
    }
  }, 200), []);
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Load conversations with error handling
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        setLoading(prev => ({ ...prev, conversations: true }));
        setError(null);

        const q = query(
          collection(db, 'conversations'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const convos = snapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() 
            }));
            setConversations(convos);
            
            if (!activeConversation && convos.length > 0) {
              setActiveConversation(convos[0].id);
            } else if (convos.length === 0) {
              setActiveConversation(null);
            }
          },
          (err) => {
            setError("Failed to load conversations");
            console.error("Snapshot error:", err);
          }
        );

        return unsubscribe;
      } catch (err) {
        setError("Failed to load conversations");
        console.error("Error:", err);
      } finally {
        setLoading(prev => ({ ...prev, conversations: false }));
      }
    };

    loadConversations();
  }, [user, activeConversation]);

  // Load messages with error handling
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    
    const loadMessages = async () => {
      try {
        setLoading(prev => ({ ...prev, messages: true }));
        setError(null);

        const q = query(
          collection(db, 'messages'),
          where('conversationId', '==', activeConversation),
          orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate() 
            }));
            setMessages(msgs);
            if (msgs.length === 0) addWelcomeMessage();
          },
          (err) => {
            setError("Failed to load messages");
            console.error("Snapshot error:", err);
          }
        );

        return unsubscribe;
      } catch (err) {
        setError("Failed to load messages");
        console.error("Error:", err);
      } finally {
        setLoading(prev => ({ ...prev, messages: false }));
      }
    };

    loadMessages();
  }, [activeConversation]);

  const addWelcomeMessage = async () => {
    try {
      await addDoc(collection(db, 'messages'), {
        text: 'Hello! How can I help you today?',
        sender: 'bot',
        conversationId: activeConversation,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding welcome message:", error);
      setError("Failed to initialize chat");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeConversation || !user || loading.ai) return;
  
    const messageText = inputValue.trim();
    setInputValue('');
    setIsTyping(true);
  
    try {
      setLoading(prev => ({ ...prev, ai: true, general: true }));
      setError(null);
  
      // Add user message
      await addDoc(collection(db, 'messages'), {
        text: messageText,
        sender: 'user',
        userId: user.uid,
        conversationId: activeConversation,
        timestamp: serverTimestamp()
      });
  
      // Get recent messages for context
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', activeConversation),
        orderBy('timestamp', 'desc'),
        limit(6)
      );
      const snapshot = await getDocs(messagesQuery);
      const recentMessages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .reverse();
  
      // Prepare messages for API
      const apiMessages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Answer questions clearly and concisely.'
        },
        ...recentMessages.slice(0, -1).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        {
          role: 'user',
          content: messageText
        }
      ];
  
      // API Call to OpenRouter
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_APIKEY}`,
          "HTTP-Referer": window.location.href, // 🔁 Replace with your actual site URL
          "X-Title": "LexiAI Chat",                  // 🔁 Replace with your app/site name
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-chat-v3-0324:free",
          "messages": apiMessages,
          "temperature": 0.7
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Details:", errorData);
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      console.log("API Response:", data);
  
      const aiResponse = data.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error("No response content from AI");
      }
  
      // Add AI response
      await addDoc(collection(db, 'messages'), {
        text: aiResponse,
        sender: 'bot',
        conversationId: activeConversation,
        timestamp: serverTimestamp()
      });
  
      // Update conversation title if first message
      if (messages.length <= 1) {
        const conversationRef = doc(db, 'conversations', activeConversation);
        const title = messageText.length > 30
          ? `${messageText.substring(0, 30)}...`
          : messageText;
        await updateDoc(conversationRef, { title });
      }
  
    } catch (error) {
      console.error("Full Error:", error);
      setError(error.message || "Failed to send message");
  
      // Add error message to chat
      await addDoc(collection(db, 'messages'), {
        text: `Error: ${error.message}`,
        sender: 'bot',
        conversationId: activeConversation,
        timestamp: serverTimestamp(),
        isError: true
      });
    } finally {
      setLoading(prev => ({ ...prev, ai: false, general: false }));
      setIsTyping(false);
    }
  };
  

  const startNewConversation = async () => {
    if (!user) return;

    try {
      setLoading(prev => ({ ...prev, general: true }));
      setError(null);

      const newConversation = {
        title: 'New Conversation',
        userId: user.uid,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'conversations'), newConversation);
      setActiveConversation(docRef.id);
      
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      setError("Failed to create conversation");
      console.error("Error:", error);
    } finally {
      setLoading(prev => ({ ...prev, general: false }));
    }
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (!conversationId || !user) return;

    if (!window.confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) return;

    try {
      setLoading(prev => ({ ...prev, general: true }));
      setError(null);

      const batch = writeBatch(db);
      batch.delete(doc(db, 'conversations', conversationId));
      
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId)
      );
      const snapshot = await getDocs(messagesQuery);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      if (activeConversation === conversationId) {
        setActiveConversation(conversations[0]?.id || null);
      }
    } catch (error) {
      setError("Failed to delete conversation");
      console.error("Error:", error);
    } finally {
      setLoading(prev => ({ ...prev, general: false }));
    }
  };

  const updateConversationTitle = async (conversationId, newTitle) => {
    if (!conversationId || !newTitle.trim()) return;

    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, { 
        title: newTitle.trim() 
      });
      setEditingTitle(null);
    } catch (error) {
      setError("Failed to update title");
      console.error("Error:", error);
    }
  };

  const toggleMessageExpansion = (messageId) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      setError("Logout failed. Please try again.");
      console.error("Error:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const formatLongDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleFeedback = async (messageId, type) => {
    const newType = messageFeedback[messageId] === type ? null : type;
  
    setMessageFeedback(prev => ({
      ...prev,
      [messageId]: newType
    }));
  
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, { feedback: newType });
    } catch (err) {
      console.error("Failed to update feedback", err);
    }
  };

  return (
    <div className={`dashboard ${isMobile && !isSidebarOpen ? 'sidebar-closed' : ''}`}>
      {/* Sidebar */}
      <div className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`} style={{ backgroundColor: '#6E48AA' }}>
        <div className="sidebar-header">
          <button 
            className="new-chat-btn"
            onClick={startNewConversation}
            disabled={loading.general}
            aria-label="Start new conversation"
            style={{ color: 'white' }}
          >
            <Plus size={16} />
            <span>New chat</span>
          </button>
          <button 
            className="close-sidebar-btn"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
            style={{ color: 'white' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="conversation-list">
          {loading.conversations ? (
            <div className="loading-conversations" style={{ color: 'white' }}>
              <Loader2 className="animate-spin" size={18} />
              <span>Loading conversations...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="empty-conversations" style={{ color: 'white' }}>
              <span>No conversations yet</span>
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                className={`conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveConversation(conv.id);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                aria-label={`Conversation: ${conv.title}`}
                style={{ 
                  backgroundColor: activeConversation === conv.id ? 'purple' : 'purple',
                  color: 'black'
                }}
              >
                <MessageSquare size={16} />
                {editingTitle === conv.id ? (
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={() => updateConversationTitle(conv.id, newTitle)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateConversationTitle(conv.id, newTitle);
                      } else if (e.key === 'Escape') {
                        setEditingTitle(null);
                      }
                    }}
                    autoFocus
                    className="conversation-title-edit"
                    style={{ color: 'white', backgroundColor: 'transparent' }}
                  />
                ) : (
                  <span 
                    className="conversation-title" 
                    title={conv.title}
                    onDoubleClick={() => {
                      setEditingTitle(conv.id);
                      setNewTitle(conv.title);
                    }}
                    style={{ color: 'white' }}
                  >
                    {conv.title.length > 20 
                      ? `${conv.title.substring(0, 20)}...` 
                      : conv.title}
                  </span>
                )}
                <span className="conversation-date" style={{ color: '#b5bac1' }}>
                  {formatDate(conv.createdAt)}
                </span>
                <button 
                  className="delete-conversation"
                  onClick={(e) => deleteConversation(conv.id, e)}
                  disabled={loading.general}
                  aria-label="Delete conversation"
                  style={{ color: 'white' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer" style={{ backgroundColor: '#6E48AA' }}>
          <div className="user-info">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User profile" className="user-avatar" />
            ) : (
              <div className="user-avatar-default" style={{ color: 'white' }}>
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="user-email" title={user?.email} style={{ color: 'white' }}>
              {user?.email?.split('@')[0]}
            </span>
          </div>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            aria-label="Logout"
            style={{ color: 'white' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-container">
        {/* Mobile header */}
        {isMobile && (
          <div className="mobile-header" style={{ backgroundColor: '#2b2d31' }}>
            <button 
              className="menu-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle menu"
              style={{ color: 'white' }}
            >
              <Menu size={20} />
            </button>
            <h3 style={{ color: 'white' }}>LexiAI</h3>
            <div className="mobile-header-spacer"></div>
          </div>
        )}

        {/* Messages */}
        <div className="messages-container" style={{ backgroundColor: 'white' }}>
          {loading.messages ? (
            <div className="loading-messages" style={{ color: 'white' }}>
              <Loader2 className="animate-spin" size={24} />
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 && !activeConversation ? (
            <div className="empty-state">
              <div className="empty-state-content">
                <Bot size={48} className="empty-icon" style={{ color: 'white' }} />
                <h3 style={{ color: 'white' }}>Welcome to DeepSeek Chat</h3>
                <p style={{ color: 'white' }}>Start a new conversation to begin chatting with our AI assistant</p>
                <button 
                  className="empty-state-button"
                  onClick={startNewConversation}
                  disabled={loading.general}
                  style={{ color: 'white' }}
                >
                  <Plus size={16} />
                  <span>New Conversation</span>
                </button>
              </div>
            </div>
          ) : (
            messages.map(message => (
              <React.Fragment key={message.id}>
                <div 
                  className={`message ${message.sender}`}
                  style={{ 
                    backgroundColor: message.sender === 'user' ? 'white' : 'white',
                  }}
                >
                  <div className="message-icon">
                    {message.sender === 'user' ? 
                      <User size={18} color="white" /> : <Bot size={18} color="green" />}
                  </div>
                  <div className="message-content">
                    <div className="message-text" style={{ color: 'black' }}>
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {expandedMessages[message.id] 
                          ? message.text 
                          : message.text.length > 500 
                            ? `${message.text.substring(0, 500)}...` 
                            : message.text}
                      </Markdown>
                      {message.text.length > 500 && (
                        <button 
                          className="expand-message-btn"
                          onClick={() => toggleMessageExpansion(message.id)}
                          style={{ color: 'white' }}
                        >
                          {expandedMessages[message.id] ? (
                            <>
                              <ChevronUp size={14} />
                              <span>Show less</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown size={14} />
                              <span>Show more</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="message-footer">
                      <div className="message-time" style={{ color: 'white' }}>
                        {formatLongDate(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons outside the message card */}
                {message.sender === 'bot' && (
                  <div className="message-actions-container">
                    <button
                      className="message-action-btn"
                      onClick={() => copyToClipboard(message.text)}
                      title="Copy"
                      style={{ 
                        color: '#666',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Copy size={14} />
                      <span></span>
                    </button>
                    <button
                      className="message-action-btn"
                      onClick={() => handleFeedback(message.id, 'like')}
                      title="Like"
                      style={{ 
                        color: messageFeedback[message.id] === 'like' ? '#8a2be2' : '#666',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ThumbsUp size={14} />
                      <span></span>
                    </button>
                    <button
                      className="message-action-btn"
                      onClick={() => handleFeedback(message.id, 'dislike')}
                      title="Dislike"
                      style={{ 
                        color: messageFeedback[message.id] === 'dislike' ? '#8a2be2' : '#666',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ThumbsDown size={14} />
                      <span></span>
                    </button>
                  </div>
                )}
              </React.Fragment>
            ))
          )}
          
          {isTyping && (
            <div className="message bot message-typing">
              <div className="message-icon">
                <Bot size={18} color="#8a2be2" />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span className="dot">•</span>
                  <span className="dot">•</span>
                  <span className="dot">•</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error message */}
        {error && (
          <div className="error-message" style={{ backgroundColor: '#2b2d31', borderColor: '#8a2be2' }}>
            <AlertCircle size={16} color="#8a2be2" />
            <span style={{ color: 'white' }}>{error}</span>
            <button 
              className="error-close"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              style={{ color: 'white' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input Area */}
        <form className="input-area" onSubmit={handleSendMessage} style={{ backgroundColor: '#6E48AA' }}>
          <div className="input-wrapper">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message DeepSeek Chat..."
              disabled={loading.general || loading.ai}
              aria-label="Message input"
              rows={1}
              style={{ backgroundColor: 'white', color: 'black' }}
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim() || loading.general || loading.ai}
              aria-label="Send message"
              className="send-button"
              style={{ backgroundColor: loading.ai ? '#404249' : '#8a2be2', color: 'white' }}
            >
              {loading.ai ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#6c6cff]" size={18} />
                </div>
              ) : (
                <Send size={18} className="text-[#6c6cff]" />
              )}
            </button>
          </div>
          <div className="input-footer">
            <span className="disclaimer" style={{ color: 'white' }}>
              LexiAI can make mistakes. Consider checking important information.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatDashboard;