import React from 'react';

export default function Sidebar({ 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onUploadClick,
  serverStatus 
}) {
  return (
    <aside className="w-full bg-[#111827] border-r border-gray-800 flex flex-col justify-between h-full select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Code<span className="text-[#8B5CF6]">Explain</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${serverStatus.includes('Online') ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs text-gray-400 font-medium">Server Connection</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4">
          <button 
            onClick={onUploadClick}
            className="w-full bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-medium text-xs py-2.5 px-4 rounded-lg transition-all shadow-md shadow-[#8B5CF6]/10 cursor-pointer text-center"
          >
            + Connect Repository
          </button>
        </div>

        {/* Project Navigation Links */}
        <nav className="px-2 py-2 flex-1 overflow-y-auto">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 block mb-2">
            Active Codebases
          </span>
          
          {sessions.length === 0 ? (
            <span className="text-xs text-gray-600 px-3 italic block mt-1">No repositories added yet</span>
          ) : (
            <ul className="flex flex-col gap-1">
              {sessions.map((session) => (
                <li key={session.id}>
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                      activeSessionId === session.id 
                        ? 'bg-[#1F2937] text-white border-l-2 border-[#8B5CF6]' 
                        : 'text-gray-400 hover:bg-[#1F2937]/50 hover:text-gray-200'
                    }`}
                  >
                    <span className="truncate max-w-[140px]">{session.title}</span>
                    <span className="font-mono text-[9px] opacity-40 bg-black/40 px-1 rounded">
                      active
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>

      {/* Footer Meta */}
      <div className="p-4 border-t border-gray-800 bg-[#0B0F19]/40 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-pink-600 flex items-center justify-center text-xs font-bold text-white">
          U
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-200">Developer Workspace</h4>
          <span className="text-[10px] text-gray-500 font-mono">Status: Connected</span>
        </div>
      </div>
    </aside>
  );
}