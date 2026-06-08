import React, { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [logs, setLogs] = useState<any[]>([]);
  const [contextInput, setContextInput] = useState('');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { pluginMessage } = event.data;
      if (pluginMessage && pluginMessage.type === 'document-changes') {
        setLogs((prevLogs) => [...prevLogs, ...pluginMessage.changes]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSendContext = () => {
    if (!contextInput.trim()) return;
    
    // In a real app, you would send this context back to Figma main thread
    // to attach to the current State/Action pair, or directly to Supabase.
    parent.postMessage({ pluginMessage: { type: 'send-context', content: contextInput } }, '*');
    
    setContextInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans p-4">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">Data Collector Sandbox</h1>
        <p className="text-sm text-gray-500">Listening to Figma actions...</p>
      </header>

      {/* Action Logs Area */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3 overflow-y-auto mb-4 shadow-sm">
        <h2 className="text-sm font-medium mb-2 sticky top-0 bg-white/90 backdrop-blur pb-1">Action Logs</h2>
        {logs.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No actions recorded yet. Move something on the canvas!</p>
        ) : (
          <ul className="space-y-2">
            {logs.slice(-50).map((log, index) => (
              <li key={index} className="text-xs bg-gray-50 p-2 rounded border border-gray-100">
                <span className="font-semibold text-blue-600">[{log.type}]</span> 
                {log.nodeData ? ` ${log.nodeData.type} (${log.nodeData.name})` : ` ID: ${log.id}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Context Input Area */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <h2 className="text-sm font-medium mb-2">Context / Chat (FlyBook Sync)</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
            placeholder="E.g., Make the button red"
            value={contextInput}
            onChange={(e) => setContextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendContext()}
          />
          <button 
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
            onClick={handleSendContext}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
