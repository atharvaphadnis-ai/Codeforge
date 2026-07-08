// GitHub REST API client — pushes files to a repo using the user's own token.
// Uses the Contents API (create/update per file). No Base44 credits used.

function toBase64(str) {
  // UTF-8 safe base64
  return btoa(unescape(encodeURIComponent(str || "")));
}

async function ghFetch(url, token, options = {}) {
  return await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
}

export async function validateAndGetUser(token) {
  const res = await ghFetch("https://api.github.com/user", token);
  if (!res.ok) throw new Error("Invalid GitHub token. Check the token in Settings.");
  const data = await res.json();
  return data.login;
}

async function createRepo(token, name, isPrivate) {
  const res = await ghFetch("https://api.github.com/user/repos", token, {
    method: "POST",
    body: JSON.stringify({ name, private: isPrivate, auto_init: true }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create repo: ${err}`);
  }
  return await res.json();
}

async function getRepo(token, owner, name) {
  const res = await ghFetch(`https://api.github.com/repos/${owner}/${name}`, token);
  if (!res.ok) throw new Error(`Repo "${owner}/${name}" not found. Create it first or check the name.`);
  return await res.json();
}

async function getFileSha(token, owner, repo, path, branch) {
  const res = await ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    token
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to check existing file ${path}`);
  const data = await res.json();
  return data.sha;
}

async function putFile({ token, owner, repo, path, content, message, branch, sha }) {
  const res = await ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: toBase64(content),
        branch,
        ...(sha ? { sha } : {}),
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to push ${path}: ${err}`);
  }
}

export async function pushToGitHub({ token, repo, files, commitMessage, createNew, isPrivate, onProgress }) {
  const owner = await validateAndGetUser(token);
  onProgress?.(`Authenticated as @${owner}`);

  let repoInfo;
  if (createNew) {
    onProgress?.(`Creating repository "${repo}"...`);
    repoInfo = await createRepo(token, repo, isPrivate);
    await new Promise((r) => setTimeout(r, 1500)); // let repo initialize
  } else {
    onProgress?.(`Opening repository "${owner}/${repo}"...`);
    repoInfo = await getRepo(token, owner, repo);
  }

  const branch = repoInfo.default_branch || "main";
  const entries = Object.entries(files);
  let pushed = 0;

  for (const [path, file] of entries) {
    onProgress?.(`Pushing ${path}...`);
    const sha = await getFileSha(token, owner, repo, path, branch);
    await putFile({ token, owner, repo, path, content: file.content, message: commitMessage, branch, sha });
    pushed++;
    onProgress?.(`✓ ${path} (${pushed}/${entries.length})`);
  }

  return { owner, repo, branch, pushed };
}