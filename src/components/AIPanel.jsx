// src/components/AIPanel.jsx
import { useState, useRef } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import { streamCompletion } from '../lib/openrouter'
import { ToastContainer } from './Toast'

const MIN_PROMPT_HEIGHT = 40
const MAX_PROMPT_HEIGHT = 150

const SYSTEM_PROMPT = `You are an expert web developer. The user will describe changes they want to make to their website. You have access to three files: index.html, common.css, and scripts.js.

Always respond with the COMPLETE updated file contents (not diffs) wrapped in XML tags like this:

<html>
<!DOCTYPE html>
...full file...
</html>

<css>
/* full file */
</css>

<js>
// full file
</js>

Only include files you are changing. If a file doesn't need changes, omit its tags entirely.
Do not explain what you did. Only output the XML-tagged file contents.`

function buildUserMessage(prompt, files) {
  return `Current files:

<html>
${files.html}
</html>

<css>
${files.css}
</css>

<js>
${files.js}
</js>

User request: ${prompt}`
}

function parseAIResponse(text) {
  const updates = {}
  const htmlMatch = text.match(/<html>([\s\S]*?)<\/html>/)
  const cssMatch  = text.match(/<css>([\s\S]*?)<\/css>/)
  const jsMatch   = text.match(/<js>([\s\S]*?)<\/js>/)
  if (htmlMatch) updates.html = htmlMatch[1].trim()
  if (cssMatch)  updates.css  = cssMatch[1].trim()
  if (jsMatch)   updates.js   = jsMatch[1].trim()
  return updates
}

export default function AIPanel({ files, onUpdate }) {
  const { settings } = useSettings()
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'thinking' | 'generating' | 'error'
  const [thinkingText, setThinkingText] = useState('')
  const [responseText, setResponseText] = useState('')
  const [showThinking, setShowThinking] = useState(false)
  const [toasts, setToasts] = useState([])
  const [isPromptExpanded, setIsPromptExpanded] = useState(false)
  const responseRef = useRef('')
  const thinkingRef = useRef('')
  const toastIdRef = useRef(0)
  const textareaRef = useRef(null)

  const syncPromptHeight = (value) => {
    const el = textareaRef.current
    if (!el) return

    el.style.height = `${MIN_PROMPT_HEIGHT}px`
    const nextHeight = Math.min(el.scrollHeight, MAX_PROMPT_HEIGHT)
    el.style.height = `${Math.max(nextHeight, MIN_PROMPT_HEIGHT)}px`
    setIsPromptExpanded(el.scrollHeight > MIN_PROMPT_HEIGHT + 2 || value.includes('\n'))
  }

  const addToast = (message, type = 'error', autoClose = 5000) => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message, type, autoClose }])
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const handleSubmit = async () => {
    if (!prompt.trim() || status !== 'idle') return
    if (!settings.apiKey) {
      addToast('Please add your OpenRouter API key in Settings first.', 'error')
      return
    }

    responseRef.current = ''
    thinkingRef.current = ''
    setResponseText('')
    setThinkingText('')
    setStatus('generating')

    await streamCompletion({
      apiKey: settings.apiKey,
      endpoint: settings.endpoint,
      model: settings.model || 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(prompt, files) },
      ],

      onThinking: (chunk) => {
        thinkingRef.current += chunk
        setThinkingText(thinkingRef.current)
        setStatus('thinking')
        setShowThinking(true)
      },

      onChunk: (chunk) => {
        responseRef.current += chunk
        setResponseText(responseRef.current)
        setStatus('generating')
      },

      onDone: () => {
        const updates = parseAIResponse(responseRef.current)
        if (Object.keys(updates).length > 0) {
          onUpdate(updates)
        }
        setStatus('idle')
        setPrompt('')
        requestAnimationFrame(() => syncPromptHeight(''))
      },

      onError: (msg) => {
        console.error(msg)
        addToast(msg, 'error')
        setStatus('idle')
      },
    })
  }

  return (
    <div className={`ai-panel ${isPromptExpanded ? 'ai-panel--expanded' : ''}`}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {!settings.apiKey && (
        <div className="ai-setup-notice">
          Looks like you haven't added an API key yet. You'll need it to use AI in your project. Open Settings in the top-right corner to configure your API key and model settings.<br/><br/>
          API Keys can be obtained from providers like <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter</a>, <a href="https://platform.claude.com" target="_blank" rel="noopener noreferrer">Claude</a>, <a href="https://ai.google.dev/gemini" target="_blank" rel="noopener noreferrer">Google Gemini</a>, and more.
        </div>
      )}

      {showThinking && thinkingText && (
        <details className="thinking-block">
          <summary>Thinking...</summary>
          <pre>{thinkingText}</pre>
        </details>
      )}

      {status === 'generating' && (
        <div className="generating-indicator">Generating...</div>
      )}

      <div className="ai-input-row">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => {
            setPrompt(e.target.value)
            syncPromptHeight(e.target.value)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="Describe what you want to build or change... (Enter to send, Shift+Enter for newline)"
          disabled={status !== 'idle' && status !== 'thinking'}
          rows={1}
        />
        <button onClick={handleSubmit} className='ai-send-btn' disabled={status !== 'idle' && status !== 'thinking'}>
          {status === 'idle' ? 'Send' : '...'}
        </button>
      </div>
    </div>
  )
}