// src/components/ProjectManager.jsx
import { useState } from 'react'
import { getAllProjects, createProject, deleteProject } from '../storage'

const NAME_PREFIXES = [
  'ugly', 'brisk', 'noodle', 'drift', 'echo', 'fable', 'golden', 'harbor',
  'ivy', 'jade', 'kindle', 'lunar', '67', 'creepy', 'skibidi', 'pixel',
  'quartz', 'ripple', 'solar', 'obnoxious',
]

const NAME_SUFFIXES = [
  'canvas', 'forge', 'garden', 'harbor', 'lab', 'meadow', 'nest', 'orbit',
  'studio', 'toilet', 'field', 'monkee', 'yard', 'sprint', 'beacon',
  'vista', 'pulse', 'dock', 'hub', 'wave',
]

function generateProjectName() {
  const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)]
  const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)]
  return `${prefix} ${suffix}`
}

export default function ProjectManager({ onOpen }) {
  const [projects, setProjects] = useState(getAllProjects)

  const handleCreate = () => {
    const name = generateProjectName()
    const project = createProject(name)
    setProjects(getAllProjects())
    onOpen(project)  // go straight into the editor
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this project? This cannot be undone.')) return
    deleteProject(id)
    setProjects(getAllProjects())
  }

  return (
    <div className="project-manager">
      {/* Left Sidebar */}
      <div className="pm-sidebar">
        <div className="pm-sidebar-content">
          <h1 className="pm-logo">MyDE</h1>
          
          <div className="pm-description">
            <p>A simple IDE with LLM Support. Design, code, and preview your websites with the help of AI in one place without leaving your browser. Everything (code, API keys) are locally on your device and never sent to any servers.</p>
          </div>

          <div className="pm-credits">
            <p>Built with Vite + React</p>
            <p className="pm-creator">
              Built and maintained by{' '}
              <a href="https://emjjkk.tech" target="_blank" rel="noopener noreferrer">
                Emmanuel A.
              </a>
            </p>
            <p className="pm-creator">
              Github repository {' '}
              <a href="https://github.com/emjjkk/myde" target="_blank" rel="noopener noreferrer">
                emjjkk/myde
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="pm-main">
        <div className="pm-content">
          <h2>Your Projects</h2>
          
          <div className="create-bar">
            <button onClick={handleCreate} className="new-project-btn">+ New Project</button>
          </div>

          <div className="project-list">
            {projects.map(p => (
              <div key={p.id} className="project-card" onClick={() => onOpen(p)}>
                <div className="project-info">
                  <span className="project-name">{p.name}</span>
                  <span className="project-date">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => handleDelete(p.id, e)}
                >
                  Delete
                </button>
              </div>
            ))}
            {projects.length === 0 && (<>
              <p className="empty-state">No projects yet. Create your first one with + New Project.</p>
            </>)}
          </div>
        </div>
      </div>
    </div>
  )
}