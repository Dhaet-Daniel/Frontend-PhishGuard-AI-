import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('API_BASE_URL') || 'http://localhost:8000');

  const saveSettings = () => {
    localStorage.setItem('API_BASE_URL', apiUrl);
    toast.success('Configuration saved');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">System Configuration</h2>
      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-medium text-white mb-4">API Connection</h3>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Backend Base URL</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={apiUrl} onChange={(e) => setApiUrl(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button onClick={saveSettings} className="bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded-lg text-white font-medium transition">
              Save
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Default is http://localhost:8000. Ensure CORS is configured properly on the backend.</p>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-medium text-white mb-4">Feature Environment Indicators</h3>
        <p className="text-sm text-slate-400 mb-4">These features must be configured on the FastAPI server environment directly (.env).</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg">
            <div>
              <p className="text-white font-medium">spaCy NLP</p>
              <p className="text-xs text-slate-400">Text preprocessing and lemmatization</p>
            </div>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono">PHISHGUARD_ENABLE_SPACY</span>
          </div>
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg">
            <div>
              <p className="text-white font-medium">Transformer ML (BART)</p>
              <p className="text-xs text-slate-400">AI-powered zero-shot classification</p>
            </div>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono">PHISHGUARD_ENABLE_TRANSFORMERS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
