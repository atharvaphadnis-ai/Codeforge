import React, { useState } from "react";
import { Sparkles, Square, Send } from "lucide-react";

export default function PromptBar({ isGenerating, onGenerate, onCancel }) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2 bg-[#181825] border-b border-[#313244]">
      <Sparkles className="w-4 h-4 text-[#cba6f7] flex-shrink-0" />
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={isGenerating ? "Generating..." : "Describe the project you want to build..."}
        disabled={isGenerating}
        className="flex-1 bg-transparent text-sm text-[#cdd6f4] placeholder:text-[#585b70] focus:outline-none disabled:opacity-50"
      />
      {isGenerating ? (
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f38ba8]/20 text-[#f38ba8] text-xs font-medium rounded-lg hover:bg-[#f38ba8]/30 transition-colors"
        >
          <Square className="w-3 h-3" />
          Stop
        </button>
      ) : (
        <button
          type="submit"
          disabled={!prompt.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#89b4fa] text-[#1e1e2e] text-xs font-medium rounded-lg hover:bg-[#74c7ec] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-3 h-3" />
          Generate
        </button>
      )}
    </form>
  );
}