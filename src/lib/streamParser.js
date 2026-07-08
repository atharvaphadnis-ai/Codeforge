// Parses streaming AI output for file markers
// Format: <FILE_START> path=some/path.js ... <FILE_END>

export function createStreamParser(onFileStart, onFileChunk, onFileEnd, onLog) {
  let buffer = "";
  let currentFile = null;
  let fileContent = "";

  const processBuffer = () => {
    while (true) {
      if (!currentFile) {
        const startMatch = buffer.match(/<FILE_START>\s*path=([^\n\r]+)/);
        if (startMatch) {
          const idx = buffer.indexOf(startMatch[0]);
          const afterMatch = idx + startMatch[0].length;
          // skip the newline right after the path
          const nextNewline = buffer.indexOf("\n", afterMatch);
          if (nextNewline === -1) break; // wait for more data
          currentFile = startMatch[1].trim();
          fileContent = "";
          onFileStart(currentFile);
          onLog(`📄 Creating: ${currentFile}`);
          buffer = buffer.slice(nextNewline + 1);
        } else {
          // No file start found - check if we might have a partial marker
          const partialIdx = buffer.lastIndexOf("<FILE_START");
          if (partialIdx > 0) {
            buffer = buffer.slice(partialIdx);
          } else if (buffer.length > 200) {
            buffer = buffer.slice(-100);
          }
          break;
        }
      } else {
        const endIdx = buffer.indexOf("<FILE_END>");
        if (endIdx !== -1) {
          const chunk = buffer.slice(0, endIdx);
          if (chunk) {
            fileContent += chunk;
            onFileChunk(currentFile, chunk);
          }
          onFileEnd(currentFile, fileContent);
          onLog(`✅ Completed: ${currentFile}`);
          buffer = buffer.slice(endIdx + "<FILE_END>".length);
          currentFile = null;
          fileContent = "";
        } else {
          // Stream content but keep last 20 chars in case <FILE_END> is split
          if (buffer.length > 20) {
            const safe = buffer.slice(0, -20);
            fileContent += safe;
            onFileChunk(currentFile, safe);
            buffer = buffer.slice(-20);
          }
          break;
        }
      }
    }
  };

  return {
    feed(text) {
      buffer += text;
      processBuffer();
    },
    flush() {
      if (currentFile && buffer.trim()) {
        fileContent += buffer;
        onFileChunk(currentFile, buffer);
        onFileEnd(currentFile, fileContent);
        onLog(`⚠️ Force-closed: ${currentFile}`);
      }
      buffer = "";
      currentFile = null;
      fileContent = "";
    },
  };
}