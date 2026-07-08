// Direct browser-to-AI-provider streaming (no backend, no credits)
import { createStreamParser } from "@/lib/streamParser";
import { ideStore } from "@/lib/ideStore";
import { saveFilesToDirectory } from "@/lib/fileSystemAccess";

const SYSTEM_PROMPT = `You are a senior full-stack engineer. When the user asks you to generate a project or code, respond ONLY with files in this exact format:

<FILE_START> path=relative/path/to/file.ext
file content here
<FILE_END>

<FILE_START> path=another/file.ext
file content here
<FILE_END>

Rules:
- Use the exact <FILE_START> path=... and <FILE_END> markers
- Every file must have both markers
- Path should be relative (e.g. src/index.js, README.md)
- Generate complete, working, production-quality code
- Include all necessary files (config, source, README, etc.)
- Do NOT include any text outside of file blocks
- Do NOT use markdown code fences inside file content`;

function getApiUrl(provider) {
  if (provider === "groq") return "https://api.groq.com/openai/v1/chat/completions";
  return "https://openrouter.ai/api/v1/chat/completions";
}

export async function generateProject(prompt) {
  const state = ideStore.getState();
  const { provider, apiKey, model } = state.settings;

  if (!apiKey) throw new Error("API key is required. Open settings to configure.");
  if (!model) throw new Error("Model name is required. Open settings to configure.");

  const abortController = new AbortController();
  ideStore.setState({
    isGenerating: true,
    abortController,
    files: {},
    activeFile: null,
    currentStreamingFile: null,
    logs: [{ time: new Date(), text: "🚀 Starting generation..." }],
  });

  const addLog = (text) => {
    ideStore.setState((s) => ({
      ...s,
      logs: [...s.logs, { time: new Date(), text }],
    }));
  };

  const parser = createStreamParser(
    // onFileStart
    (path) => {
      ideStore.setState((s) => ({
        ...s,
        currentStreamingFile: path,
        activeFile: path,
        files: { ...s.files, [path]: { content: "", complete: false } },
      }));
    },
    // onFileChunk
    (path, chunk) => {
      ideStore.setState((s) => {
        const existing = s.files[path];
        if (!existing) return s;
        return {
          ...s,
          files: {
            ...s.files,
            [path]: { ...existing, content: existing.content + chunk },
          },
        };
      });
    },
    // onFileEnd
    (path) => {
      ideStore.setState((s) => {
        const existing = s.files[path];
        if (!existing) return s;
        return {
          ...s,
          currentStreamingFile: s.currentStreamingFile === path ? null : s.currentStreamingFile,
          files: {
            ...s.files,
            [path]: { ...existing, complete: true },
          },
        };
      });
    },
    // onLog
    addLog
  );

  try {
    addLog(`📡 Connecting to ${provider} (${model})...`);

    const response = await fetch(getApiUrl(provider), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(provider === "openrouter" ? { "HTTP-Referer": window.location.origin } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        stream: true,
        max_tokens: 16000,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error (${response.status}): ${err}`);
    }

    addLog("✅ Connected. Streaming response...");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            parser.feed(content);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    parser.flush();
    addLog("🎉 Generation complete!");

    const { directoryHandle, folderName, files: genFiles } = ideStore.getState();
    if (directoryHandle) {
      try {
        addLog(`💾 Saving files to "${folderName}"...`);
        const count = await saveFilesToDirectory(directoryHandle, genFiles, (saved, path) => {
          addLog(`  ✓ saved ${path}`);
        });
        addLog(`💾 Saved ${count} files to "${folderName}".`);
      } catch (e) {
        addLog(`⚠️ Folder save failed: ${e.message}`);
      }
    }
  } catch (err) {
    if (err.name === "AbortError") {
      addLog("⛔ Generation cancelled.");
    } else {
      addLog(`❌ Error: ${err.message}`);
      throw err;
    }
  } finally {
    parser.flush();
    ideStore.setState((s) => ({
      ...s,
      isGenerating: false,
      abortController: null,
      currentStreamingFile: null,
    }));
  }
}

export function cancelGeneration() {
  const { abortController } = ideStore.getState();
  if (abortController) abortController.abort();
}