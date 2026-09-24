import React, { useState, useEffect, useRef } from 'react';
import { getChatHistory, saveChatHistory, clearChatHistory } from '../../utils/fileStorage';
import { askAssistant } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const AssistantView = ({ fileId, pdfBlob }) => {
  const [history, setHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showConfirm, showAlert } = useUI();
  const chatEndRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (fileId) {
        const savedHistory = await getChatHistory(fileId);
        setHistory(savedHistory || []);
      }
    };
    loadHistory();
  }, [fileId]);

  useEffect(() => {
    // Scroll to bottom when history changes
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = async () => {
    if (!inputValue.trim() || !pdfBlob) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);
    setIsLoading(true);

    const newHistory = [...history, { role: 'user', text: userMessage }];
    setHistory(newHistory);

    try {
      // Pass the *previous* history to the assistant so it knows the context,
      // but without the new userMessage attached yet, since askAssistant appends it.
      // Wait, askAssistant appends the question itself. Let's look at askAssistant.
      // `askAssistant(pdfBlob, chatHistory, question)`
      
      const answer = await askAssistant(pdfBlob, history, userMessage);
      
      const updatedHistory = [...newHistory, { role: 'model', text: answer }];
      setHistory(updatedHistory);
      await saveChatHistory(fileId, updatedHistory);
    } catch (err) {
      setError(err.message);
      // Remove the optimistic user message if we fail? No, just let them see they sent it.
      // But actually, better to keep it and let them retry, or just show error below it.
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    showConfirm("Clear Conversation", "Are you sure you want to clear this conversation?", async () => {
      await clearChatHistory(fileId);
      setHistory([]);
      setError(null);
      showAlert("Conversation cleared.", "info");
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (example) => {
    setInputValue(example);
  };

  const examples = [
    "Explain this topic in simple words.",
    "What is the difference between these two concepts?",
    "Explain the diagram on page 5.",
    "Give me an example.",
    "What formula is used here?"
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
      
      {/* Chat Area */}
      <div style={{ flex: 1, marginBottom: '20px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {history.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#95a5a6' }}>
            <h2 style={{ color: '#ecf0f1', marginBottom: '10px' }}>Ask anything about this PDF</h2>
            <p style={{ marginBottom: '30px' }}>I am your AI study assistant. How can I help you today?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
              {examples.map((ex, i) => (
                <button 
                  key={i} 
                  onClick={() => handleExampleClick(ex)}
                  style={{
                    padding: '12px 15px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#bdc3c7',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#333'; e.currentTarget.style.borderColor = '#444'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#2a2a2a'; e.currentTarget.style.borderColor = '#333'; }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          history.map((msg, index) => (
            <div 
              key={index} 
              className={msg.role === 'model' || msg.role === 'ai' ? 'ai-markdown' : ''}
              style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? '#3498db' : '#2a2a2a',
                color: msg.role === 'user' ? '#fff' : '#ecf0f1',
                padding: '12px 16px',
                borderRadius: '12px',
                maxWidth: '80%',
                lineHeight: '1.5',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                borderBottomLeftRadius: msg.role === 'model' || msg.role === 'ai' ? '4px' : '12px',
                whiteSpace: msg.role === 'user' ? 'pre-wrap' : 'normal',
                overflowWrap: 'break-word',
                border: msg.role === 'user' ? 'none' : '1px solid #333'
              }}
            >
              {msg.role === 'user' ? (
                msg.text
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {msg.text}
                </ReactMarkdown>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', backgroundColor: '#2a2a2a', color: '#95a5a6', padding: '12px 16px', borderRadius: '12px', borderBottomLeftRadius: '4px', border: '1px solid #333' }}>
            Thinking...
          </div>
        )}
        
        {error && (
          <div style={{ alignSelf: 'center', color: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.1)', padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(231, 76, 60, 0.3)' }}>
            {error}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ position: 'sticky', bottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-end', backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 -10px 20px rgba(30,30,30,0.8)' }}>
        {history.length > 0 && (
          <button 
            onClick={handleClear}
            disabled={isLoading}
            style={{ 
              padding: '12px', 
              backgroundColor: 'transparent', 
              border: 'none', 
              color: '#95a5a6', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              borderRadius: '8px'
            }}
            title="Clear Chat"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        )}
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about this PDF..."
          disabled={isLoading}
          style={{ 
            flex: 1, 
            backgroundColor: '#141414', 
            color: '#fff', 
            border: '1px solid #333', 
            borderRadius: '8px', 
            padding: '12px 15px', 
            minHeight: '24px',
            maxHeight: '120px',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: '15px',
            outline: 'none'
          }}
          rows={1}
        />
        <button 
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          className="btn-primary"
          style={{ 
            padding: '12px 20px', 
            opacity: (!inputValue.trim() || isLoading) ? 0.5 : 1,
            cursor: (!inputValue.trim() || isLoading) ? 'not-allowed' : 'pointer',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AssistantView;


