// src/components/PreviewPane.jsx
import { useMemo } from 'react'

function buildDocument(files) {
  // Inject CSS and JS directly into the HTML to avoid cross-origin issues
  // We replace the <link> and <script src> with inline equivalents
  let html = files.html

  // Replace <link rel="stylesheet" href="common.css"> with inline <style>
  html = html.replace(
    /<link[^>]+href=["']common\.css["'][^>]*\/?>/gi,
    `<style>\n${files.css}\n</style>`
  )

  // Replace <script src="scripts.js"></script> with inline <script>
  html = html.replace(
    /<script[^>]+src=["']scripts\.js["'][^>]*><\/script>/gi,
    `<script>\n${files.js}\n</script>`
  )

  return html
}

export default function PreviewPane({ files }) {
  const srcDoc = useMemo(() => buildDocument(files), [files])

  return (
    <div className="preview-pane">
      <div className="preview-toolbar">
        <span>Preview</span>
      </div>
      <iframe
        className="preview-frame"
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        title="Site Preview"
      />
    </div>
  )
}