import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { buildZip } from "@/lib/zipBuilder";

export default function DownloadButton({ files }) {
  const [busy, setBusy] = useState(false);
  const fileEntries = Object.entries(files);

  const handleDownload = async () => {
    if (fileEntries.length === 0) return;
    setBusy(true);
    try {
      const zipBlob = buildZip(
        fileEntries.map(([path, f]) => ({ path, content: f.content }))
      );
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "generated-project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  if (fileEntries.length === 0) return null;

  return (
    <button
      onClick={handleDownload}
      disabled={busy}
      className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/50 rounded transition-colors disabled:opacity-40"
      title="Download entire project as ZIP"
    >
      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
      ZIP
    </button>
  );
}