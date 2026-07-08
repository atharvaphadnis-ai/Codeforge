import React, { useState } from "react";
import { FolderOpen, Save, RefreshCw } from "lucide-react";
import { ideStore, useIdeStore } from "@/lib/ideStore";
import { pickDirectory, saveFilesToDirectory } from "@/lib/fileSystemAccess";

export default function SaveFolderButton({ files }) {
  const state = useIdeStore();
  const [busy, setBusy] = useState(false);
  const { directoryHandle, folderName } = state;
  const fileCount = Object.keys(files).length;

  const addLog = (text) => {
    ideStore.setState((s) => ({ ...s, logs: [...s.logs, { time: new Date(), text }] }));
  };

  const handlePick = async () => {
    try {
      const handle = await pickDirectory();
      ideStore.setState((s) => ({
        ...s,
        directoryHandle: handle,
        folderName: handle.name,
        logs: [...s.logs, { time: new Date(), text: `📁 Save folder set to "${handle.name}"` }],
      }));
    } catch (e) {
      if (e.name !== "AbortError") addLog(`⚠️ ${e.message}`);
    }
  };

  const handleSave = async () => {
    if (!directoryHandle || fileCount === 0) return;
    setBusy(true);
    try {
      addLog(`💾 Saving files to "${folderName}"...`);
      const count = await saveFilesToDirectory(directoryHandle, files, (saved, path) => {
        addLog(`  ✓ ${path}`);
      });
      addLog(`💾 Saved ${count} files to "${folderName}".`);
    } catch (e) {
      addLog(`⚠️ Save failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  if (!directoryHandle) {
    return (
      <button
        onClick={handlePick}
        className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/50 rounded transition-colors"
        title="Choose where files are saved on your computer"
      >
        <FolderOpen className="w-3 h-3" />
        Set Folder
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleSave}
        disabled={busy || fileCount === 0}
        className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#a6e3a1] hover:bg-[#313244]/50 rounded transition-colors disabled:opacity-30"
        title={`Save all files to ${folderName}`}
      >
        {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
        Save
      </button>
      <button
        onClick={handlePick}
        className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/50 rounded transition-colors max-w-[110px]"
        title="Change save folder"
      >
        <FolderOpen className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{folderName}</span>
      </button>
    </>
  );
}