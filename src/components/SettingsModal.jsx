// src/components/SettingsModal.jsx
import { useState } from 'react'
import { useSettings } from '../contexts/SettingsContext'

const POPULAR_MODELS = [
  'anthropic/claude-sonnet-4-5',
  'anthropic/claude-3.7-sonnet:thinking',
  'openai/gpt-4o',
  'google/gemini-2.0-flash-001',
  'meta-llama/llama-3.3-70b-instruct',
]

export default function SettingsModal({ onClose }) {
  const { settings, updateSettings } = useSettings()
  const initialModel = settings.model || 'anthropic/claude-sonnet-4-5'

  const [form, setForm] = useState({
    apiKey:   settings.apiKey   || '',
    endpoint: settings.endpoint || '',
    model:    initialModel,
  })

  const handleSave = () => {
    const resolvedModel = form.model.trim()
    if (!resolvedModel) return

    updateSettings({ ...form, model: resolvedModel })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Settings</h2>

        <label>API Key</label>
        <input
          type="password"
          value={form.apiKey}
          onChange={e => setForm(p => ({ ...p, apiKey: e.target.value }))}
          placeholder="sk-or-..."
        />
        <small>Your API key is stored locally and is never sent to any servers except your configured LLM provider endpoint.</small>

        <label>API Endpoint (optional, defaults to OpenRouter)</label>
        <input
          value={form.endpoint}
          onChange={e => setForm(p => ({ ...p, endpoint: e.target.value }))}
          placeholder="https://openrouter.ai/api/v1/chat/completions"
        />

        <label>Model</label>
        <input
          value={form.model}
          onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
          placeholder="Choose or type a model"
          list="popular-models"
        />
        <datalist id="popular-models">
          {POPULAR_MODELS.map(m => <option key={m} value={m} />)}
        </datalist>

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSave}
            className="primary"
            disabled={!form.model.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}