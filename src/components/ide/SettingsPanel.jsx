import React, { useState, useEffect } from "react";
import { Settings, X, Eye, EyeOff, Save } from "lucide-react";
import { ideStore } from "@/lib/ideStore";

export default function SettingsPanel({ open, onClose }) {
  const [provider, setProvider] = useState("openrouter");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("openai/gpt-4o-mini");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [githubToken, setGithubToken] = useState("");

  useEffect(() => {
    const s = ideStore.getState().settings;
    setProvider(s.provider);
    setApiKey(s.apiKey);
    setModel(s.model);
    setGithubToken(ideStore.getState().github?.token || "");
  }, [open]);

  const handleSave = () => {
    ideStore.setState((s) => ({
      ...s,
      settings: { ...s.settings, provider, apiKey, model },
      github: { token: githubToken },
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#313244]">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#89b4fa]" />
            <span className="text-sm font-medium text-[#cdd6f4]">Settings</span>
          </div>
          <button onClick={onClose} className="text-[#6c7086] hover:text-[#cdd6f4] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#a6adc8] mb-1.5">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-[#181825] border border-[#313244] rounded-lg px-3 py-2 text-sm text-[#cdd6f4] focus:outline-none focus:border-[#89b4fa] transition-colors"
            >
              <option value="openrouter">OpenRouter</option>
              <option value="groq">Groq</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a6adc8] mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-[#181825] border border-[#313244] rounded-lg px-3 py-2 pr-10 text-sm text-[#cdd6f4] placeholder:text-[#45475a] focus:outline-none focus:border-[#89b4fa] transition-colors font-mono"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6c7086] hover:text-[#cdd6f4]"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a6adc8] mb-1.5">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={provider === "groq" ? "llama-3.1-70b-versatile" : "openai/gpt-4o-mini"}
              className="w-full bg-[#181825] border border-[#313244] rounded-lg px-3 py-2 text-sm text-[#cdd6f4] placeholder:text-[#45475a] focus:outline-none focus:border-[#89b4fa] transition-colors font-mono"
            />
            <p className="mt-1 text-[10px] text-[#585b70]">
              {provider === "openrouter" ? "e.g. openai/gpt-4o-mini, anthropic/claude-3.5-sonnet" : "e.g. llama-3.1-70b-versatile, mixtral-8x7b-32768"}
            </p>
          </div>

          <div className="pt-3 border-t border-[#313244]">
            <label className="block text-xs font-medium text-[#a6adc8] mb-1.5">GitHub Token (optional)</label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full bg-[#181825] border border-[#313244] rounded-lg px-3 py-2 text-sm text-[#cdd6f4] placeholder:text-[#45475a] focus:outline-none focus:border-[#a6e3a1] transition-colors font-mono"
            />
            <p className="mt-1 text-[10px] text-[#585b70]">
              Used to push generated files to GitHub. Create one at github.com/settings/tokens (needs "repo" scope).
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-[#89b4fa] hover:bg-[#74c7ec] text-[#1e1e2e] font-medium text-sm py-2.5 rounded-lg transition-all duration-200"
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}