import React, { useState } from "react";
import { Github, X, Loader2, Upload } from "lucide-react";
import { ideStore, useIdeStore } from "@/lib/ideStore";
import { pushToGitHub } from "@/lib/githubService";

export default function GitHubPushButton({ files }) {
  const state = useIdeStore();
  const [open, setOpen] = useState(false);
  const [repo, setRepo] = useState("");
  const [commitMessage, setCommitMessage] = useState("Initial commit from AI IDE");
  const [createNew, setCreateNew] = useState(true);
  const [isPrivate, setIsPrivate] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const hasToken = !!state.github?.token;
  const fileCount = Object.keys(files).length;

  const addLog = (text) => {
    ideStore.setState((s) => ({ ...s, logs: [...s.logs, { time: new Date(), text }] }));
  };

  const handlePush = async () => {
    if (!repo.trim() || !commitMessage.trim()) return;
    setBusy(true);
    setError(null);
    try {
      addLog("🔗 Pushing to GitHub...");
      const result = await pushToGitHub({
        token: state.github.token,
        repo: repo.trim(),
        files,
        commitMessage: commitMessage.trim(),
        createNew,
        isPrivate,
        onProgress: addLog,
      });
      addLog(`🎉 Pushed ${result.pushed} files to ${result.owner}/${result.repo} (${result.branch})`);
      setOpen(false);
    } catch (e) {
      setError(e.message);
      addLog(`❌ GitHub push failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const canPush = hasToken && fileCount > 0 && repo.trim() && commitMessage.trim() && !busy;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-colors ${
          hasToken ? "text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/50" : "text-[#f38ba8] hover:bg-[#f38ba8]/10"
        }`}
        title="Push files to GitHub"
      >
        <Github className="w-3 h-3" />
        Push
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#313244]">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-[#a6e3a1]" />
                <span className="text-sm font-medium text-[#cdd6f4]">Push to GitHub</span>
              </div>
              <button
                onClick={() => !busy && setOpen(false)}
                disabled={busy}
                className="text-[#6c7086] hover:text-[#cdd6f4] disabled:opacity-30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {!hasToken && (
                <div className="text-xs text-[#f38ba8] bg-[#f38ba8]/10 rounded-lg p-2">
                  No GitHub token set. Add a personal access token in Settings first.
                </div>
              )}
              {fileCount === 0 && (
                <div className="text-xs text-[#f9e2af] bg-[#f9e2af]/10 rounded-lg p-2">
                  No files to push. Generate a project first.
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#a6adc8] mb-1.5">Repository name</label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="my-awesome-project"
                  disabled={busy}
                  className="w-full bg-[#181825] border border-[#313244] rounded-lg px-3 py-2 text-sm text-[#cdd6f4] placeholder:text-[#45475a] focus:outline-none focus:border-[#89b4fa] transition-colors font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a6adc8] mb-1.5">Commit message</label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  disabled={busy}
                  className="w-full bg-[#181825] border border-[#313244] rounded-lg px-3 py-2 text-sm text-[#cdd6f4] placeholder:text-[#45475a] focus:outline-none focus:border-[#89b4fa] transition-colors disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-[#a6adc8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createNew}
                    onChange={(e) => setCreateNew(e.target.checked)}
                    disabled={busy}
                    className="accent-[#89b4fa]"
                  />
                  Create new repository
                </label>
                {createNew && (
                  <label className="flex items-center gap-2 text-xs text-[#a6adc8] cursor-pointer ml-6">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      disabled={busy}
                      className="accent-[#89b4fa]"
                    />
                    Private repository
                  </label>
                )}
              </div>

              {error && (
                <div className="text-xs text-[#f38ba8] bg-[#f38ba8]/10 rounded-lg p-2 break-all">{error}</div>
              )}

              <button
                onClick={handlePush}
                disabled={!canPush}
                className="w-full flex items-center justify-center gap-2 bg-[#a6e3a1] hover:bg-[#94d89a] text-[#1e1e2e] font-medium text-sm py-2.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {busy ? "Pushing..." : `Push ${fileCount} file${fileCount !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}