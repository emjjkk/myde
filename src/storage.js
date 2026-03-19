import { v4 as uuidv4 } from 'uuid'

const PROJECTS_KEY = 'vibe_projects'
const PREFIX = 'vibe'

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to MyDE</title>
  <link rel="stylesheet" href="common.css" />
</head>
<body>
  <main class="hero">
    <h1>Build with MyDE</h1>
    <p>
      MyDE lets you write code, preview instantly, and use AI help in one simple workspace. Everything is stored locally and never leaves your device.
    </p>
  </main>

  <script src="scripts.js"></script>
</body>
</html>`

const DEFAULT_CSS = `/* common.css */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Inter", "Segoe UI", sans-serif;
  background: #f7f7f8;
  color: #1f2937;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 0.75rem;
}

.hero {
  max-width: 500px;
  text-align: center;
}

h1 {
  font-size: clamp(1.45rem, 3vw, 2.05rem);
  line-height: 1.2;
  margin-bottom: 0.55rem;
}

p {
  font-size: 0.9rem;
  line-height: 1.55;
  color: #4b5563;
  margin-bottom: 0.7rem;
}

.cta-text {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #111827;
  margin-bottom: 0;
}`

const DEFAULT_JS = `// scripts.js
console.log('Welcome to MyDE. Start editing to customize this page.')`

// --- Projects ---

export function getAllProjects() {
  const ids = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]')
  return ids
    .map(id => JSON.parse(localStorage.getItem(`${PREFIX}_project_${id}`) || 'null'))
    .filter(Boolean)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function createProject(name = 'Untitled Site') {
  const id = uuidv4()
  const project = { id, name, createdAt: Date.now(), updatedAt: Date.now() }
  
  const ids = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]')
  localStorage.setItem(PROJECTS_KEY, JSON.stringify([...ids, id]))
  localStorage.setItem(`${PREFIX}_project_${id}`, JSON.stringify(project))
  
  // seed default files
  localStorage.setItem(`${PREFIX}_file_${id}_html`, DEFAULT_HTML)
  localStorage.setItem(`${PREFIX}_file_${id}_css`, DEFAULT_CSS)
  localStorage.setItem(`${PREFIX}_file_${id}_js`, DEFAULT_JS)
  
  return project
}

export function deleteProject(id) {
  const ids = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]')
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(ids.filter(i => i !== id)))
  localStorage.removeItem(`${PREFIX}_project_${id}`)
  localStorage.removeItem(`${PREFIX}_file_${id}_html`)
  localStorage.removeItem(`${PREFIX}_file_${id}_css`)
  localStorage.removeItem(`${PREFIX}_file_${id}_js`)
}

export function updateProjectMeta(id, patch) {
  const project = JSON.parse(localStorage.getItem(`${PREFIX}_project_${id}`))
  const updated = { ...project, ...patch, updatedAt: Date.now() }
  localStorage.setItem(`${PREFIX}_project_${id}`, JSON.stringify(updated))
  return updated
}

// --- Files ---

export function getFile(projectId, fileKey) {
  // fileKey: 'html' | 'css' | 'js'
  return localStorage.getItem(`${PREFIX}_file_${projectId}_${fileKey}`) || ''
}

export function saveFile(projectId, fileKey, content) {
  localStorage.setItem(`${PREFIX}_file_${projectId}_${fileKey}`, content)
  updateProjectMeta(projectId, {}) // bumps updatedAt
}

// --- Settings ---

export function getSettings() {
  return JSON.parse(localStorage.getItem(`${PREFIX}_settings`) || '{}')
}

export function saveSettings(settings) {
  localStorage.setItem(`${PREFIX}_settings`, JSON.stringify(settings))
}