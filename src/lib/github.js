// src/lib/github.js

async function ghFetch(token, path, method = 'GET', body = null) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || `GitHub error ${res.status}`)
  }
  return res.status === 204 ? null : res.json()
}

export async function exportToGitHub({ token, repoName, projectName, files }) {
  const username = (await ghFetch(token, '/user')).login

  // 1. Create repo (or use existing)
  let repo
  try {
    repo = await ghFetch(token, `/repos/${username}/${repoName}`)
  } catch {
    repo = await ghFetch(token, '/user/repos', 'POST', {
      name: repoName,
      description: `Built with AI Site Builder — ${projectName}`,
      auto_init: true, // creates initial commit with README
      private: false,
    })
    // Wait for GitHub to initialize
    await new Promise(r => setTimeout(r, 1500))
  }

  // 2. Get the latest commit SHA
  const ref = await ghFetch(token, `/repos/${username}/${repoName}/git/ref/heads/main`)
  const latestCommitSha = ref.object.sha
  const baseTree = (await ghFetch(token, `/repos/${username}/${repoName}/git/commits/${latestCommitSha}`)).tree.sha

  // 3. Create blobs for each file
  const encoder = content => btoa(unescape(encodeURIComponent(content)))
  
  const blobs = await Promise.all([
    ghFetch(token, `/repos/${username}/${repoName}/git/blobs`, 'POST', { content: encoder(files.html), encoding: 'base64' }),
    ghFetch(token, `/repos/${username}/${repoName}/git/blobs`, 'POST', { content: encoder(files.css),  encoding: 'base64' }),
    ghFetch(token, `/repos/${username}/${repoName}/git/blobs`, 'POST', { content: encoder(files.js),   encoding: 'base64' }),
  ])

  // 4. Create a tree
  const tree = await ghFetch(token, `/repos/${username}/${repoName}/git/trees`, 'POST', {
    base_tree: baseTree,
    tree: [
      { path: 'index.html', mode: '100644', type: 'blob', sha: blobs[0].sha },
      { path: 'common.css', mode: '100644', type: 'blob', sha: blobs[1].sha },
      { path: 'scripts.js', mode: '100644', type: 'blob', sha: blobs[2].sha },
    ],
  })

  // 5. Create commit
  const commit = await ghFetch(token, `/repos/${username}/${repoName}/git/commits`, 'POST', {
    message: `Update via AI Site Builder`,
    tree: tree.sha,
    parents: [latestCommitSha],
  })

  // 6. Update branch reference
  await ghFetch(token, `/repos/${username}/${repoName}/git/refs/heads/main`, 'PATCH', {
    sha: commit.sha,
  })

  return `https://github.com/${username}/${repoName}`
}