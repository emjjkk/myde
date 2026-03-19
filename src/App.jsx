// src/App.jsx
import { useState } from 'react'
import { SettingsProvider } from './contexts/SettingsContext'
import ProjectManager from './components/ProjectManager'
import Editor from './components/Editor'

export default function App() {
  const [activeProject, setActiveProject] = useState(null)

  return (
    <SettingsProvider>
      {activeProject
        ? <Editor
            project={activeProject}
            onClose={() => setActiveProject(null)}
          />
        : <ProjectManager onOpen={setActiveProject} />
      }
    </SettingsProvider>
  )
}