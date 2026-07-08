import React, { useState } from "react";
import { FileArchive, Loader2 } from "lucide-react";
import { buildZip } from "@/lib/zipBuilder";

// Import all app source files as raw strings (Vite ?raw) so the
// downloaded source always matches what's actually running.
import appJsx from "@/App.jsx?raw";
import homePage from "@/pages/Home.jsx?raw";
import settingsPanel from "@/components/ide/SettingsPanel.jsx?raw";
import fileExplorer from "@/components/ide/FileExplorer.jsx?raw";
import codeEditor from "@/components/ide/CodeEditor.jsx?raw";
import consolePanel from "@/components/ide/ConsolePanel.jsx?raw";
import promptBar from "@/components/ide/PromptBar.jsx?raw";
import fileUploader from "@/components/ide/FileUploader.jsx?raw";
import downloadButton from "@/components/ide/DownloadButton.jsx?raw";
import saveFolderButton from "@/components/ide/SaveFolderButton.jsx?raw";
import gitHubPushButton from "@/components/ide/GitHubPushButton.jsx?raw";
import downloadAppFilesButton from "@/components/ide/DownloadAppFilesButton.jsx?raw";
import ideStore from "@/lib/ideStore.js?raw";
import streamParser from "@/lib/streamParser.js?raw";
import aiService from "@/lib/aiService.js?raw";
import zipBuilder from "@/lib/zipBuilder.js?raw";
import fileSystemAccess from "@/lib/fileSystemAccess.js?raw";
import githubService from "@/lib/githubService.js?raw";
import indexCss from "@/index.css?raw";
import tailwindConfig from "../../../tailwind.config.js?raw";
import indexHtml from "../../../index.html?raw";
import packageJson from "../../../package.json?raw";

const README = `# AI IDE

A web-based AI IDE with real-time streaming code generation across multiple files and folders.

## Features

- **Streaming code generation** — Files appear and code streams in live as the AI writes it
- **Multiple providers** — OpenRouter and Groq support
- **Bring your own API key** — Configured in Settings, never stored server-side
- **Live file explorer** — Tree view that updates as files are created
- **Code editor** — Typewriter effect with line numbers
- **Console** — Real-time logs of generation progress
- **ZIP download** — Export the generated project as a .zip
- **Save to folder** — Pick a local folder and save files directly to disk
- **Push to GitHub** — Connect with a personal access token and push files to a repo

## Setup

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Run the dev server:
   \`\`\`
   npm run dev
   \`\`\`

3. Open the app, click **Settings**, and enter:
   - Your provider (OpenRouter or Groq)
   - Your API key
   - The model name

4. (Optional) Add a GitHub token to enable the Push-to-GitHub feature.

## Usage

1. Type a prompt describing the project you want
2. Click **Generate**
3. Watch files stream in live in the explorer and editor
4. Download as ZIP, save to a folder, or push to GitHub

## Tech Stack

- React + Vite
- Tailwind CSS
- File System Access API (folder saving)
- GitHub REST API (push)
- OpenRouter / Groq chat completions (streaming via SSE)

Made by Atharva Phadnis
`;

const APP_FILES = [
  { path: "src/App.jsx", content: appJsx },
  { path: "src/index.css", content: indexCss },
  { path: "tailwind.config.js", content: tailwindConfig },
  { path: "index.html", content: indexHtml },
  { path: "package.json", content: packageJson },
  { path: "src/pages/Home.jsx", content: homePage },
  { path: "src/components/ide/SettingsPanel.jsx", content: settingsPanel },
  { path: "src/components/ide/FileExplorer.jsx", content: fileExplorer },
  { path: "src/components/ide/CodeEditor.jsx", content: codeEditor },
  { path: "src/components/ide/ConsolePanel.jsx", content: consolePanel },
  { path: "src/components/ide/PromptBar.jsx", content: promptBar },
  { path: "src/components/ide/FileUploader.jsx", content: fileUploader },
  { path: "src/components/ide/DownloadButton.jsx", content: downloadButton },
  { path: "src/components/ide/SaveFolderButton.jsx", content: saveFolderButton },
  { path: "src/components/ide/GitHubPushButton.jsx", content: gitHubPushButton },
  { path: "src/components/ide/DownloadAppFilesButton.jsx", content: downloadAppFilesButton },
  { path: "src/lib/ideStore.js", content: ideStore },
  { path: "src/lib/streamParser.js", content: streamParser },
  { path: "src/lib/aiService.js", content: aiService },
  { path: "src/lib/zipBuilder.js", content: zipBuilder },
  { path: "src/lib/fileSystemAccess.js", content: fileSystemAccess },
  { path: "src/lib/githubService.js", content: githubService },
  { path: "README.md", content: README },
];

export default function DownloadAppFilesButton() {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    try {
      const zipBlob = buildZip(APP_FILES);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ai-ide-source.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={busy}
      className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/50 rounded transition-colors disabled:opacity-40"
      title="Download this app's source code as a ZIP"
    >
      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileArchive className="w-3 h-3" />}
      Download App Files
    </button>
  );
}