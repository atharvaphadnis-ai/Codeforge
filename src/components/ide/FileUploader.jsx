import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { ideStore } from "@/lib/ideStore";

export default function FileUploader() {
  const inputRef = useRef(null);

  const handleFiles = (e) => {
    const fileList = e.target.files;
    if (!fileList) return;

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        ideStore.setState((s) => ({
          ...s,
          files: {
            ...s.files,
            [file.name]: { content, complete: true },
          },
          activeFile: file.name,
          logs: [...s.logs, { time: new Date(), text: `📎 Uploaded: ${file.name}` }],
        }));
      };
      reader.readAsText(file);
    });
    e.target.value = "";
  };

  return (
    <>
      <input ref={inputRef} type="file" multiple onChange={handleFiles} className="hidden" accept=".js,.jsx,.ts,.tsx,.css,.html,.json,.md,.py,.txt,.yaml,.yml,.toml,.env,.sh,.sql" />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/50 rounded transition-colors"
        title="Upload files"
      >
        <Upload className="w-3 h-3" />
        Upload
      </button>
    </>
  );
}