import React, { useState, useEffect, useCallback } from "react";
import { Settings, Code2, Zap } from "lucide-react";
import { ideStore } from "@/lib/ideStore";
import { generateProject, cancelGeneration } from "@/lib/aiService";
import FileExplorer from "@/components/ide/FileExplorer";
import CodeEditor from "@/components/ide/CodeEditor";
import ConsolePanel from "@/components/ide/ConsolePanel";
import PromptBar from "@/components/ide/PromptBar";
import SettingsPanel from "@/components/ide/SettingsPanel";
import FileUploader from "@/components/ide/FileUploader";
import DownloadButton from "@/components/ide/DownloadButton";
import SaveFolderButton from "@/components/ide/SaveFolderButton";
import GitHubPushButton from "@/components/ide/GitHubPushButton";
import DownloadAppFilesButton from "@/components/ide/DownloadAppFilesButton";

export default function Home() {
  const [state, setState] = useState(ideStore.getState());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => ideStore.subscribe(setState), []);

  const { files, activeFile, isGenerating, currentStreamingFile, logs } = state;

  const handleGenerate = useCallback(async (prompt) => {
    setError(null);
    try {
      await generateProject(prompt);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const handleSelectFile = useCallback((path) => {
    ideStore.setState((s) => ({ ...s, activeFile: path }));
  }, []);

  const handleClearLogs = useCallback(() => {
    ideStore.setState((s) => ({ ...s, logs: [] }));
  }, []);

  const hasApiKey = !!state.settings.apiKey;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e2e] text-[#cdd6f4] overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#11111b] border-b border-[#313244] min-h-[36px]">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#89b4fa]" />
          <span className="text-xs font-semibold tracking-wide text-[#cdd6f4]">AI IDE</span>
          <span className="text-[10px] text-[#585b70] ml-1">v1.0</span>
        </div>
        <div className="flex items-center gap-1">
          {isGenerating && (
            <div className="flex items-center gap-1.5 mr-2">
              <Zap className="w-3 h-3 text-[#f9e2af] animate-pulse" />
              <span className="text-[10px] text-[#f9e2af]">Generating...</span>
            </div>
          )}
          <DownloadButton files={files} />
          <SaveFolderButton files={files} />
          <GitHubPushButton files={files} />
          <FileUploader />
          <DownloadAppFilesButton />
          <button
            onClick={() => setSettingsOpen(true)}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-colors ${
              hasApiKey
                ? "text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/50"
                : "text-[#f38ba8] hover:bg-[#f38ba8]/10"
            }`}
          >
            <Settings className="w-3 h-3" />
            Settings
          </button>
        </div>
      </div>

      {/* Prompt bar */}
      <PromptBar isGenerating={isGenerating} onGenerate={handleGenerate} onCancel={cancelGeneration} />

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-[#f38ba8]/10 border-b border-[#f38ba8]/20 text-xs text-[#f38ba8] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-[#f38ba8] hover:text-white ml-2 text-xs">✕</button>
        </div>
      )}

      {/* No API key notice */}
      {!hasApiKey && !isGenerating && Object.keys(files).length === 0 && (
        <div className="px-4 py-3 bg-[#89b4fa]/5 border-b border-[#313244]">
          <p className="text-xs text-[#a6adc8]">
            👋 Welcome! Open <button onClick={() => setSettingsOpen(true)} className="text-[#89b4fa] underline underline-offset-2">Settings</button> to configure your API key, then describe a project to generate.
          </p>
        </div>
      )}

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-56 flex-shrink-0 bg-[#181825] border-r border-[#313244] flex flex-col">
          <div className="px-3 py-2 border-b border-[#313244]">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#585b70]">Explorer</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FileExplorer
              files={files}
              activeFile={activeFile}
              onSelect={handleSelectFile}
              currentStreamingFile={currentStreamingFile}
            />
          </div>
          <div className="px-3 py-1.5 border-t border-[#313244] text-[10px] text-[#585b70]">
            {Object.keys(files).length} file{Object.keys(files).length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Editor + Console */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Code Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor activeFile={activeFile} files={files} currentStreamingFile={currentStreamingFile} />
          </div>

          {/* Console */}
          <div className="h-40 flex-shrink-0 border-t border-[#313244]">
            <ConsolePanel logs={logs} onClear={handleClearLogs} />
          </div>
        </div>
      </div>

      {/* Settings modal */}
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}