// File System Access API helpers for saving files to a user-chosen folder.
// Requires Chrome/Edge. Gracefully errors elsewhere.

export async function isSupported() {
  return typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";
}

export async function pickDirectory() {
  if (!(await isSupported())) {
    throw new Error("Folder selection needs Chrome/Edge. Use the ZIP download instead.");
  }
  return await window.showDirectoryPicker();
}

async function getDeepFileHandle(dirHandle, fullPath) {
  const parts = fullPath.split("/").filter(Boolean);
  let current = dirHandle;
  for (let i = 0; i < parts.length - 1; i++) {
    current = await current.getDirectoryHandle(parts[i], { create: true });
  }
  return await current.getFileHandle(parts[parts.length - 1], { create: true });
}

export async function saveFilesToDirectory(dirHandle, files, onProgress) {
  const entries = Object.entries(files);
  let saved = 0;
  for (const [path, file] of entries) {
    const handle = await getDeepFileHandle(dirHandle, path);
    const writable = await handle.createWritable();
    await writable.write(file.content || "");
    await writable.close();
    saved++;
    onProgress?.(saved, path);
  }
  return saved;
}