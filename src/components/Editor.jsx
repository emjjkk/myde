// src/components/Editor.jsx
import { useState, useCallback } from 'react'
import Toolbar from './Toolbar'
import CodeView from './CodeView'
import PreviewPane from './PreviewPane'
import AIPanel from './AIPanel'
import { getFile, saveFile } from '../storage'

const FILES = [
  { key: 'html', label: 'index.html', language: 'html' },
  { key: 'css',  label: 'common.css', language: 'css' },
  { key: 'js',   label: 'scripts.js', language: 'javascript' },
]

export default function Editor({ project, onClose }) {
  const [viewMode, setViewMode] = useState('split') // 'code' | 'preview' | 'split'
  const [activeFile, setActiveFile] = useState('html')
  const [files, setFiles] = useState({
    html: getFile(project.id, 'html'),
    css:  getFile(project.id, 'css'),
    js:   getFile(project.id, 'js'),
  })

  // This is the key function — it updates state AND persists immediately
  const handleFileChange = useCallback((fileKey, content) => {
    setFiles(prev => ({ ...prev, [fileKey]: content }))
    saveFile(project.id, fileKey, content)
  }, [project.id])

  // Called by AI panel when it finishes generating — can update multiple files
  const handleAIUpdate = useCallback((updates) => {
    // updates: { html?: string, css?: string, js?: string }
    setFiles(prev => {
      const next = { ...prev, ...updates }
      Object.entries(updates).forEach(([key, content]) => {
        saveFile(project.id, key, content)
      })
      return next
    })
  }, [project.id])

  return (
    <div className={`editor editor--${viewMode}`}>
      <Toolbar
        project={project}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onBack={onClose}
        files={files}
      />
      
      <div className="editor-body">
        {(viewMode === 'code' || viewMode === 'split') && (
          <div className="code-pane">
            <CodeView
              files={FILES}
              activeFile={activeFile}
              onTabChange={setActiveFile}
              content={files[activeFile]}
              language={FILES.find(f => f.key === activeFile).language}
              onChange={(content) => handleFileChange(activeFile, content)}
            />

            <AIPanel
              projectId={project.id}
              files={files}
              onUpdate={handleAIUpdate}
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <PreviewPane files={files} />
        )}
      </div>
    </div>
  )
}