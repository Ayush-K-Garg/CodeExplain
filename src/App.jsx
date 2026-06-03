import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ChatInterface from './components/ChatInterface';

function App() {
  const [serverStatus, setServerStatus] = useState('Checking connection...');
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showIngestModal, setShowIngestModal] = useState(true);
  const [viewMode, setViewMode] = useState('dashboard');

  // Input states
  const [uploadMethod, setUploadMethod] = useState('link'); // 'link' or 'zip'
  const [repoUrl, setRepoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [modalFeedback, setModalFeedback] = useState('');

  useEffect(() => {
    async function verifyBackendNode() {
      try {
        const health = await apiService.checkHealth();
        setServerStatus(`Online: ${health.app}`);
      } catch (err) {
        setServerStatus('Offline: Disconnected');
      }
    }
    verifyBackendNode();
  }, []);

  // Handler 1: Git Remote URL Submission
  const handleIngestSubmit = async (e) => {
    e.preventDefault();
    if (!repoUrl || loading) return;

    setLoading(true);
    setModalFeedback('Fetching repository files and generating your project overview...');

    try {
      const data = await apiService.uploadRepository(repoUrl);
      const repoName = repoUrl.split('/').pop().replace('.git', '') || 'Project Workspace';
      const generatedSessionId = `session_${Math.random().toString(36).substr(2, 9)}`;

      const newSession = {
        id: generatedSessionId,
        title: repoName,
        repoId: data.repo_id,
        overview: data.codebase_dashboard,
        messages: []
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(generatedSessionId);
      setViewMode('dashboard');
      setShowIngestModal(false);
      setRepoUrl('');
      setModalFeedback('');
    } catch (err) {
      setModalFeedback('Error: Unable to load this repository. Please make sure the URL is correct and public.');
    } finally {
      setLoading(false);
    }
  };

  // Handler 2: Local ZIP Multipart Archive Submission
  const handleZipSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || loading) return;

    setLoading(true);
    setModalFeedback('Reading project files and creating your code breakdown...');

    try {
      const data = await apiService.uploadZipRepository(selectedFile);
      const repoName = selectedFile.name.replace('.zip', '') || 'ZIP Archive';
      const generatedSessionId = `session_${Math.random().toString(36).substr(2, 9)}`;

      const newSession = {
        id: generatedSessionId,
        title: repoName,
        repoId: data.repo_id,
        overview: data.codebase_dashboard,
        messages: []
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(generatedSessionId);
      setViewMode('dashboard');
      setShowIngestModal(false);
      setSelectedFile(null);
      setModalFeedback('');
    } catch (err) {
      setModalFeedback('Error: Unable to process the uploaded ZIP file. Please make sure it is a valid project archive.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (userQuestion) => {
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession || loading) return;

    const updatedUserMessages = [...activeSession.messages, { role: 'user', text: userQuestion }];
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: updatedUserMessages } : s));
    setLoading(true);

    try {
      const data = await apiService.chatWithRepository(activeSession.repoId, userQuestion, activeSession.id);
      const updatedAiMessages = [...updatedUserMessages, { role: 'model', text: data.answer }];
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: updatedAiMessages } : s));
    } catch (err) {
      const errorMessages = [...updatedUserMessages, { role: 'model', text: 'Error: The server took too long to respond. Please try again.' }];
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: errorMessages } : s));
    } finally {
      setLoading(false);
    }
  };

  const currentSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="w-screen h-screen bg-[#0B0F19] text-gray-200 antialiased flex overflow-hidden fixed inset-0">
      
      {/* Left Sidebar Panel */}
      <div className="w-64 h-full flex-shrink-0 flex flex-col z-20">
        <Sidebar 
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => { setActiveSessionId(id); setViewMode('dashboard'); }}
          onUploadClick={() => setShowIngestModal(true)}
          serverStatus={serverStatus}
        />
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 h-full flex flex-col min-w-0 bg-[#0B0F19] relative z-10">
        {currentSession ? (
          <>
            {/* Nav Headers */}
            <div className="bg-[#111827]/40 border-b border-gray-800/60 px-6 py-3 flex gap-4 flex-shrink-0 select-none">
              <button 
                onClick={() => setViewMode('dashboard')}
                className={`text-xs font-semibold py-1.5 px-3 rounded-md transition-all cursor-pointer ${viewMode === 'dashboard' ? 'bg-[#1F2937] text-[#8B5CF6] shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Project Overview
              </button>
              <button 
                onClick={() => setViewMode('chat')}
                className={`text-xs font-semibold py-1.5 px-3 rounded-md transition-all cursor-pointer ${viewMode === 'chat' ? 'bg-[#1F2937] text-[#8B5CF6] shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Code Assistant ({currentSession.messages.length})
              </button>
            </div>

            {/* Content View Routing Layout */}
            <div className="flex-1 min-h-0 w-full flex flex-col">
              {viewMode === 'dashboard' ? (
                <DashboardView 
                  overviewText={currentSession.overview} 
                  repoId={currentSession.repoId}
                  onStartChat={() => setViewMode('chat')}
                />
              ) : (
                <ChatInterface 
                  messages={currentSession.messages}
                  onSendMessage={handleSendMessage}
                  loading={loading}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
            <h3 className="text-sm font-semibold text-gray-300">No Project Active</h3>
            <p className="text-xs text-gray-500 max-w-xs mt-1">Please connect a repository link or upload a local ZIP archive to get started.</p>
          </div>
        )}
      </div>

      {/* Modal Popup Wrapper Sheets */}
      {showIngestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161F30] border border-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative mx-auto my-auto">
            {sessions.length > 0 && (
              <button 
                onClick={() => { if(!loading) setShowIngestModal(false); }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            )}
            <h3 className="text-base font-bold text-white tracking-tight">Connect a Project</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">Select how you want to add your source files for analysis.</p>
            
            {/* Method Tabs */}
            <div className="flex bg-[#0B0F19] p-1 rounded-lg border border-gray-800 mb-6 select-none">
              <button
                type="button"
                onClick={() => !loading && setUploadMethod('link')}
                className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${uploadMethod === 'link' ? 'bg-[#1F2937] text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Git Link
              </button>
              <button
                type="button"
                onClick={() => !loading && setUploadMethod('zip')}
                className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${uploadMethod === 'zip' ? 'bg-[#1F2937] text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
              >
                ZIP Archive
              </button>
            </div>

            {/* Condition 1: Link Upload Form */}
            {uploadMethod === 'link' ? (
              <form onSubmit={handleIngestSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">GitHub URL</label>
                  <input
                    type="text"
                    placeholder="https://github.com/username/project"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                    required
                  />
                </div>

                {modalFeedback && (
                  <div className="text-[11px] font-medium text-gray-400 bg-[#0B0F19] border border-gray-800 px-3 py-2 rounded-lg leading-relaxed">
                    {modalFeedback}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#8B5CF6] hover:bg-[#7c4fe3] disabled:bg-gray-800 disabled:text-gray-500 font-semibold text-xs text-white px-5 py-2.5 rounded-lg cursor-pointer transition-all w-full text-center shadow-lg"
                  >
                    {loading ? 'Analyzing codebase...' : 'Analyze Repository'}
                  </button>
                </div>
              </form>
            ) : (
              /* Condition 2: ZIP File Upload Form */
              <form onSubmit={handleZipSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Upload Project Files</label>
                  <div className="border-2 border-dashed border-gray-800 rounded-xl p-6 bg-[#0B0F19] flex flex-col items-center justify-center text-center hover:border-[#8B5CF6]/50 transition-colors relative">
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      disabled={loading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      required={!selectedFile}
                    />
                    <p className="text-xs text-gray-300 font-medium truncate max-w-[280px]">
                      {selectedFile ? selectedFile.name : 'Click to select a local file'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">Supports standard compressed compressed .zip folders</p>
                  </div>
                </div>

                {modalFeedback && (
                  <div className="text-[11px] font-medium text-gray-400 bg-[#0B0F19] border border-gray-800 px-3 py-2 rounded-lg leading-relaxed">
                    {modalFeedback}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading || !selectedFile}
                    className="bg-[#8B5CF6] hover:bg-[#7c4fe3] disabled:bg-gray-800 disabled:text-gray-500 font-semibold text-xs text-white px-5 py-2.5 rounded-lg cursor-pointer transition-all w-full text-center shadow-lg"
                  >
                    {loading ? 'Reading archive...' : 'Upload and Analyze ZIP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;