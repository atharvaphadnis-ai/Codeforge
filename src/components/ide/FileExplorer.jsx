import React, { useState, useMemo } from "react";
import { File, Folder, FolderOpen, Loader2 } from "lucide-react";

// Build a tree structure from flat file paths
function buildTree(files) {
  const root = {};
  Object.keys(files).sort().forEach((path) => {
    const parts = path.split("/");
    let current = root;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        current[part] = { __file: true, path, complete: files[path].complete };
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    });
  });
  return root;
}

function getFileIcon(name) {
  if (name.endsWith(".js") || name.endsWith(".jsx")) return "text-[#f9e2af]";
  if (name.endsWith(".ts") || name.endsWith(".tsx")) return "text-[#89b4fa]";
  if (name.endsWith(".css") || name.endsWith(".scss")) return "text-[#cba6f7]";
  if (name.endsWith(".html")) return "text-[#fab387]";
  if (name.endsWith(".json")) return "text-[#a6e3a1]";
  if (name.endsWith(".md")) return "text-[#74c7ec]";
  if (name.endsWith(".py")) return "text-[#a6e3a1]";
  return "text-[#6c7086]";
}

function TreeNode({ name, node, activeFile, onSelect, depth = 0, currentStreamingFile }) {
  const [expanded, setExpanded] = React.useState(true);

  if (node.__file) {
    const isActive = activeFile === node.path;
    const isStreaming = currentStreamingFile === node.path;
    return (
      <button
        onClick={() => onSelect(node.path)}
        className={`w-full flex items-center gap-1.5 px-2 py-[3px] text-left text-xs transition-colors rounded-sm group
          ${isActive ? "bg-[#313244] text-[#cdd6f4]" : "text-[#a6adc8] hover:bg-[#313244]/50 hover:text-[#cdd6f4]"}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isStreaming ? (
          <Loader2 className="w-3.5 h-3.5 text-[#89b4fa] animate-spin flex-shrink-0" />
        ) : (
          <File className={`w-3.5 h-3.5 flex-shrink-0 ${getFileIcon(name)}`} />
        )}
        <span className="truncate">{name}</span>
        {isStreaming && (
          <span className="ml-auto text-[10px] text-[#89b4fa] font-mono">streaming</span>
        )}
      </button>
    );
  }

  const entries = Object.entries(node).sort(([, a], [, b]) => {
    const aIsFile = a.__file;
    const bIsFile = b.__file;
    if (aIsFile && !bIsFile) return 1;
    if (!aIsFile && bIsFile) return -1;
    return 0;
  });

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-1.5 px-2 py-[3px] text-left text-xs text-[#a6adc8] hover:bg-[#313244]/50 hover:text-[#cdd6f4] transition-colors rounded-sm"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {expanded ? (
          <FolderOpen className="w-3.5 h-3.5 text-[#89b4fa] flex-shrink-0" />
        ) : (
          <Folder className="w-3.5 h-3.5 text-[#89b4fa] flex-shrink-0" />
        )}
        <span className="truncate">{name}</span>
      </button>
      {expanded && entries.map(([key, val]) => (
        <TreeNode
          key={key}
          name={key}
          node={val}
          activeFile={activeFile}
          onSelect={onSelect}
          depth={depth + 1}
          currentStreamingFile={currentStreamingFile}
        />
      ))}
    </div>
  );
}

export default function FileExplorer({ files, activeFile, onSelect, currentStreamingFile }) {
  const tree = useMemo(() => buildTree(files), [files]);
  const entries = Object.entries(tree);

  if (entries.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#585b70] px-4">
        <Folder className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-xs text-center">No files yet.<br />Generate a project to get started.</p>
      </div>
    );
  }

  return (
    <div className="py-1 overflow-y-auto h-full">
      {entries.map(([key, val]) => (
        <TreeNode
          key={key}
          name={key}
          node={val}
          activeFile={activeFile}
          onSelect={onSelect}
          currentStreamingFile={currentStreamingFile}
        />
      ))}
    </div>
  );
}