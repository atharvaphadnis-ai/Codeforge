import React, { useRef, useEffect } from "react";
import { File, Loader2 } from "lucide-react";

function getLanguage(path) {
  if (!path) return "";
  if (path.endsWith(".js") || path.endsWith(".jsx")) return "javascript";
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
  if (path.endsWith(".css") || path.endsWith(".scss")) return "css";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith(".py")) return "python";
  return "text";
}

export default function CodeEditor({ activeFile, files, currentStreamingFile }) {
  const editorRef = useRef(null);
  const file = activeFile ? files[activeFile] : null;
  const isStreaming = currentStreamingFile === activeFile;

  useEffect(() => {
    if (isStreaming && editorRef.current) {
      const el = editorRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [file?.content, isStreaming]);

  if (!activeFile || !file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#585b70]">
        <File className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Select a file to view</p>
        <p className="text-xs mt-1 opacity-60">or generate a project</p>
      </div>
    );
  }

  const lines = (file.content || "").split("\n");
  const lang = getLanguage(activeFile);

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-2 py-1 bg-[#181825] border-b border-[#313244] min-h-[32px]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1e1e2e] rounded text-xs text-[#cdd6f4] border border-[#313244]">
          {isStreaming ? (
            <Loader2 className="w-3 h-3 text-[#89b4fa] animate-spin" />
          ) : (
            <File className="w-3 h-3 text-[#6c7086]" />
          )}
          <span className="truncate max-w-[200px]">{activeFile.split("/").pop()}</span>
        </div>
        {isStreaming && (
          <span className="text-[10px] text-[#89b4fa] ml-2 font-mono animate-pulse">
            ● streaming
          </span>
        )}
        <span className="ml-auto text-[10px] text-[#585b70] font-mono">{lang}</span>
      </div>

      {/* Code area */}
      <div ref={editorRef} className="flex-1 overflow-auto font-mono text-[13px] leading-[20px]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-[#313244]/30">
                <td className="text-right pr-4 pl-2 select-none text-[#585b70] text-xs w-[50px] align-top">
                  {i + 1}
                </td>
                <td className="pr-4 text-[#cdd6f4] whitespace-pre-wrap break-all">
                  {line || " "}
                  {isStreaming && i === lines.length - 1 && (
                    <span className="inline-block w-[2px] h-[14px] bg-[#89b4fa] animate-pulse ml-[1px] align-middle" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#181825] border-t border-[#313244] text-[10px] text-[#585b70]">
        <span>{activeFile}</span>
        <div className="flex items-center gap-3">
          <span>{lines.length} lines</span>
          <span>{file.complete ? "✓ Complete" : "Streaming..."}</span>
        </div>
      </div>
    </div>
  );
}