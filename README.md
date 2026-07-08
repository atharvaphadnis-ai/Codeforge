# AI IDE

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
   ```
   npm install
   ```

2. Run the dev server:
   ```
   npm run dev
   ```

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
