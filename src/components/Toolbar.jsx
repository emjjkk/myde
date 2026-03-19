// src/components/Toolbar.jsx
import {LuGithub, LuSettings, LuDownload, LuArrowLeft} from 'react-icons/lu'
import { useState } from 'react'
import { updateProjectMeta } from '../storage'
import { downloadProject } from '../lib/download'
import { exportToGitHub } from '../lib/github'
import GitHubModal from './GitHubModal'
import { useSettings } from '../contexts/SettingsContext'
import SettingsModal from './SettingsModal'


export default function Toolbar({ project, viewMode, onViewChange, onBack, files }) {
  const { settings } = useSettings()
  const [name, setName] = useState(project.name)
  const [editing, setEditing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showGitHub, setShowGitHub] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleRename = () => {
    const trimmed = name.trim()
    if (!trimmed) { setName(project.name); setEditing(false); return }
    updateProjectMeta(project.id, { name: trimmed })
    project.name = trimmed // mutate local ref so download uses new name
    setEditing(false)
  }

  const handleDownload = () => {
    downloadProject(project.name, files)
  }

  const handleGitHubExport = async ({ token, repoName }) => {
    setExporting(true)
    try {
      const url = await exportToGitHub({
        token,
        repoName,
        projectName: project.name,
        files,
      })
      window.open(url, '_blank')
      setShowGitHub(false)
    } catch (err) {
      alert(`GitHub export failed: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="toolbar">
        {/* Left: back + project name */}
        <div className="toolbar-left">
          <button className="toolbar-btn icon-btn" onClick={onBack} title="Back to projects">
            <LuArrowLeft />
          </button>

          {editing ? (
            <input
              className="project-name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') { setName(project.name); setEditing(false) }
              }}
              autoFocus
            />
          ) : (
            <span
              className="project-name"
              onClick={() => setEditing(true)}
              title="Click to rename"
            >
              {name}
            </span>
          )}
        </div>

        {/* Center: view mode toggle */}
        <div className="toolbar-center">
          <div className="view-toggle">
            {[
              { key: 'code',    label: 'Code' },
              { key: 'split',   label: 'Split' },
              { key: 'preview', label: 'Preview' },
            ].map(v => (
              <button
                key={v.key}
                className={`view-btn ${viewMode === v.key ? 'view-btn--active' : ''}`}
                onClick={() => onViewChange(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: actions */}
        <div className="toolbar-right">
          <button className="toolbar-btn" onClick={handleDownload} title="Download as ZIP">
            <LuDownload /> Download
          </button>
          <button
            className="toolbar-btn"
            onClick={() => setShowGitHub(true)}
            title="Export to GitHub"
            disabled={exporting}
          >
            <LuGithub /> GitHub
          </button>
          <button
            className="toolbar-btn icon-btn"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            <LuSettings />
          </button>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showGitHub && (
        <GitHubModal
          onClose={() => setShowGitHub(false)}
          onExport={handleGitHubExport}
          exporting={exporting}
          projectName={project.name}
        />
      )}
    </>
  )
}