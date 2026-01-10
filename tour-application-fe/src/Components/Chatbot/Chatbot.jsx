import React, { useState, useRef, useEffect } from 'react';
import { chatbot } from '../../utils/api/TourApi';
import { getUserInfo } from "../../utils/api/tokenService";
import { Link } from "react-router-dom";
import { FiSend, FiMessageCircle, FiX } from 'react-icons/fi';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Xin chào! Tôi là trợ lý AI của bạn. Hãy hỏi tôi về các tour du lịch nhé! 🌍✨', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  const userInfo = getUserInfo();
  const userId = userInfo?.id || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const parseMessage = (text) => {
    const parts = [];
    let lastIndex = 0;
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0];
      const index = match.index;

      if (index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, index) });
      }

      if (url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
        parts.push({ type: 'image', url });
      } else if (url.includes('localhost:5173')) {
        const path = url.replace(/https?:\/\/localhost:5173/, '');
        parts.push({ type: 'internalLink', path, displayText: '👉 Xem chi tiết tour' });
      } else {
        parts.push({ type: 'externalLink', url });
      }

      lastIndex = index + url.length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return parts;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!userId) {
      const errorMessage = {
        id: Date.now() + 1,
        text: '🔒 Bạn cần đăng nhập để sử dụng chatbot.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await chatbot(input, parseInt(userId));
      const botMessage = {
        id: Date.now() + 1,
        text: res.data.response || 'Xin lỗi, tôi không hiểu câu hỏi của bạn.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: '⚠️ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center text-white z-50 group"
          aria-label="Open Chat"
        >
          <FiMessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isExpanded && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-lg border-2 border-white/30">
                <FiMessageCircle size={22} />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight">Trợ Lý AI Du Lịch</h2>
                <div className="flex items-center gap-1.5 text-xs opacity-90 mt-0.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Đang hoạt động</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200 backdrop-blur-lg"
              aria-label="Close Chat"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-fadeIn ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <FiMessageCircle size={16} className="text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-br-sm shadow-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'
                  }`}
                >
                  {message.sender === 'bot' ? (
                    <div className="space-y-2">
                      {parseMessage(message.text).map((part, index) => {
                        if (part.type === 'text') {
                          return <span key={index} className="whitespace-pre-wrap">{part.content}</span>;
                        }
                        if (part.type === 'image') {
                          return (
                            <img
                              key={index}
                              src={part.url}
                              alt="Tour"
                              className="rounded-xl shadow-md hover:scale-[1.02] transition-transform duration-200 max-w-full"
                            />
                          );
                        }
                        if (part.type === 'internalLink') {
                          return (
                            <Link
                              key={index}
                              to={part.path}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-colors duration-200"
                            >
                              {part.displayText}
                            </Link>
                          );
                        }
                        if (part.type === 'externalLink') {
                          return (
                            <a
                              key={index}
                              href={part.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors duration-200"
                            >
                              🔗 Xem thêm
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{message.text}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 animate-fadeIn">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <FiMessageCircle size={16} className="text-white" />
                </div>
                <div className="bg-gray-100 px-6 py-4 rounded-2xl rounded-bl-sm border border-gray-200 flex gap-2">
                  <span className="w-2.5 h-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2.5 h-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2.5 h-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-5 bg-white border-t border-gray-200 flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn của bạn..."
              disabled={isLoading}
              className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-full text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </>
  );
}