import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';

export default function ChatInterface({ messages, onSendMessage, loading }) {
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F19] min-h-0">
      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 w-full max-w-4xl mx-auto min-h-0">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-3xl px-5 py-3.5 rounded-xl text-sm leading-relaxed shadow-md ${
              msg.role === 'user' 
                ? 'bg-[#8B5CF6] text-white rounded-br-none font-medium' 
                : 'bg-[#161F30] text-gray-200 border border-gray-800 rounded-bl-none w-full p-6'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                /* High-fidelity Code Assist Markdown Output Panel */
                <div className="prose prose-invert max-w-none text-gray-300 text-sm
                  prose-p:mb-4 prose-p:leading-relaxed
                  prose-headings:text-white prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-2
                  prose-strong:text-white prose-strong:font-bold
                  prose-ul:list-disc prose-ul:pl-5 prose-li:my-1
                  prose-code:bg-[#0B0F19] prose-code:text-[#A78BFA] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono before:content-none after:content-none
                  prose-pre:bg-[#0B0F19] prose-pre:p-5 prose-pre:rounded-xl prose-pre:border prose-pre:border-gray-800 prose-pre:overflow-x-auto prose-pre:font-mono prose-pre:text-xs prose-pre:text-gray-300 prose-pre:leading-relaxed">
                  <Markdown>{msg.text}</Markdown>
                </div>
              )}
            </div>
            <span className="text-[9px] text-gray-500 font-medium mt-1.5 px-1 uppercase tracking-wider font-mono">
              {msg.role === 'user' ? '' : 'Code Assist'}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="bg-[#161F30] border border-gray-800 max-w-xs px-4 py-3 rounded-xl rounded-bl-none text-xs text-gray-400 flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
              Analyzing repository structure...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-gray-800 bg-[#111827]/40 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            placeholder="Ask a question about file logic, classes, or dependencies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-[#0B0F19] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#8B5CF6] transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#8B5CF6] hover:bg-[#7c4fe3] disabled:bg-gray-800 disabled:text-gray-500 font-semibold text-xs text-white px-5 rounded-xl cursor-pointer transition-all shrink-0"
          >
            Ask Assist
          </button>
        </form>
      </div>
    </div>
  );
}