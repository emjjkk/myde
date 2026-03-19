// src/components/GitHubModal.jsx
import { useState } from 'react'
import { useSettings } from '../contexts/SettingsContext'

export default function GitHubModal({ onClose, onExport, exporting, projectName }) {
  const { settings, updateSettings } = useSettings()
  const [token, setToken] = useState(settings.githubToken || '')
  const [repoName, setRepoName] = useState(
    projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  )

  const handleExport = () => {
    if (!token.trim()) { alert('GitHub token is required.'); return }
    if (!repoName.trim()) { alert('Repo name is required.'); return }
    // Save token for next time
    updateSettings({ githubToken: token })
    onExport({ token, repoName })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Export to GitHub</h2>

        <label>GitHub Personal Access Token</label>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="ghp_..."
        />
        <small>
          Needs <code>repo</code> scope.{' '}
          <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer">
            Create one here ↗
          </a>
        </small>

        <label>Repository Name</label>
        <input
          value={repoName}
          onChange={e => setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="my-site"
        />
        <small>Will create a new repo or push to an existing one with this name.</small>

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleExport} disabled={exporting} className="primary">
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  )
}