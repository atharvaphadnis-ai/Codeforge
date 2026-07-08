import React, { useRef, useEffect } from "react";
import { Terminal, Trash2 } from "lucide-react";

export default function ConsolePanel({ logs, onClear }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181825] border-b border-[#313244] min-h-[30px]">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-[#a6e3a1]" />
          <span className="text-xs text-[#a6adc8] font-medium">Console</span>
        </div>
        {logs.length > 0 && (
          <button onClick={onClear} className="text-[#585b70] hover:text-[#a6adc8] transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs space-y-0.5">
        {logs.length === 0 ? (
          <span className="text-[#585b70]">Ready.</span>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-2 text-[#a6adc8]">
              <span className="text-[#585b70] flex-shrink-0 text-[10px] leading-[18px]">
                {log.time.toLocaleTimeString()}
              </span>
              <span className="break-all">{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}