// src/lib/download.js
import * as fflate from 'fflate'

export function downloadProject(projectName, files) {
  const encoder = new TextEncoder()

  const zipData = {
    'index.html': encoder.encode(files.html),
    'common.css': encoder.encode(files.css),
    'scripts.js': encoder.encode(files.js),
  }

  fflate.zip(zipData, (err, zipped) => {
    if (err) { console.error(err); return }
    
    const blob = new Blob([zipped], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.zip`
    a.click()
    URL.revokeObjectURL(url)
  })
}