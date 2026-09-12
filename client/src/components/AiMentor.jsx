import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  Cpu, 
  Bot, 
  Lightbulb, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export default function AiMentor({ currentUser, onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mentorContext, setMentorContext] = useState(null);
  const messagesEndRef = useRef(null);

  // Load chat history for current user
  useEffect(() => {
    if (!currentUser?.id) return;

    fetch(`/api/mentor/history/${currentUser.id}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
        } else {
          // Welcome greeting
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: `Namaste ${currentUser.name}! I am your AI Competency Mentor. I have real-time visibility into your Competency Twin, diagnostic assessments, and regional benchmark goals. How can I guide your learning trajectory today?`,
              created_at: new Date().toISOString()
            }
          ]);
        }
      })
      .catch(err => console.error('Error fetching mentor messages:', err));
  }, [currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    fetch('/api/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser?.id || 'user-ananya',
        message: text
      })
    })
      .then(r => r.json())
      .then(data => {
        setIsSending(false);
        setMentorContext(data.context);
        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
      })
      .catch(err => {
        console.error('Mentor chat error:', err);
        setIsSending(false);
      });
  };

  const quickPrompts = [
    "What should I learn next based on my gaps?",
    "Explain my SQL & Databases gap and recommend exercises.",
    "How can I accelerate readiness for Data Scientist?",
    "What are the best practices for Data Quality governance?",
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24, height: 'calc(100vh - 120px)' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(139, 92, 246, 0.15))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(37, 99, 235, 0.4)'
          }}>
            <Bot size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                AI Competency Mentor
              </h1>
              <span className="badge badge-purple">Context-Aware</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Integrated with {currentUser?.name}'s Digital Twin telemetry and assessment records.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('competency')}
          className="btn-secondary"
          style={{ fontSize: 12 }}
        >
          <Cpu size={14} /> View Twin Metrics
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="card" style={{
        flex: 1,
        overflowY: 'auto',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || idx}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                gap: 12
              }}
            >
              {!isUser && (
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={16} color="#fff" />
                </div>
              )}

              <div style={{
                maxWidth: '78%',
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                background: isUser ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'var(--bg-surface-elevated)',
                border: isUser ? 'none' : '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: 13.5,
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                boxShadow: isUser ? '0 4px 12px var(--brand-blue-glow)' : 'none'
              }}>
                {msg.content}
              </div>

              {isUser && (
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={16} color="#94a3b8" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={16} color="#fff" />
            </div>
            <div style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface-elevated)',
              fontSize: 13,
              color: 'var(--text-secondary)'
            }}>
              Consulting your Competency Twin & formulating response...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, flexShrink: 0 }}>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: 11,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '8px 12px',
        flexShrink: 0
      }}>
        <input
          type="text"
          placeholder="Ask AI Mentor anything about your skill gaps, career trajectories, or exercises..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 13.5,
            color: '#fff',
            padding: '8px 6px'
          }}
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isSending}
          className="btn-primary"
          style={{ padding: '8px 16px', opacity: !inputText.trim() || isSending ? 0.5 : 1 }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
