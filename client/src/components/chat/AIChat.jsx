import React, { useState } from 'react';
import axios from 'axios';
import { PrimaryButton } from '../buttons/Button';

export default function AIChat({ onClose }) {
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hello! I am your AI Health Assistant. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/chat', { message: userMessage.text });
      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply, disclaimer: data.disclaimer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 flex justify-between items-center">
        <h3 className="font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          AI Assistant
        </h3>
        <button onClick={onClose} className="hover:bg-primary-700 p-1 rounded-full">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 p-4 overflow-y-auto max-h-96 min-h-80 bg-neutral-50 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[85%] ${msg.sender === 'user' ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm shadow-sm'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
            {msg.disclaimer && <span className="text-[10px] text-neutral-400 mt-1 max-w-[85%] leading-tight">{msg.disclaimer}</span>}
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
             <div className="p-3 bg-white border border-neutral-200 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-neutral-200 bg-white flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a health question..." 
          className="flex-1 p-2 bg-neutral-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button type="submit" disabled={!input.trim() || loading} className="bg-primary-600 text-white p-2 rounded-lg disabled:opacity-50 hover:bg-primary-700 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  );
}
