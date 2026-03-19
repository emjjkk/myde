// src/components/CodeView.jsx
import Editor from '@monaco-editor/react'


export default function CodeView({ files, activeFile, onTabChange, content, language, onChange }) {
  return (
    <div className="code-view">
      <div className="tab-bar">
        {files.map(f => (
          <button
            key={f.key}
            className={`tab ${activeFile === f.key ? 'tab--active' : ''}`}
            onClick={() => onTabChange(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="editor-container">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={onChange}  // fires on every change, parent saves immediately
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true, // crucial for split view resize
          }}
        />
      </div>
    </div>
  )
}