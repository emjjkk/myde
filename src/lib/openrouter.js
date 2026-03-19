// src/lib/openrouter.js

export async function streamCompletion({ apiKey, endpoint, model, messages, onChunk, onThinking, onDone, onError }) {
  const url = endpoint || 'https://openrouter.ai/api/v1/chat/completions'
  
  const body = {
    model,
    messages,
    stream: true,
    // For models that support thinking (e.g. claude-3-7-sonnet with thinking)
    // OpenRouter passes these through
  }

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin, // OpenRouter requires this
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    onError(`Network error: ${err.message}`)
    return
  }

  if (!response.ok) {
    const errText = await response.text()
    onError(`API error ${response.status}: ${errText}`)
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep incomplete line in buffer

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') { onDone(); return }

      try {
        const parsed = JSON.parse(data)
        const delta = parsed.choices?.[0]?.delta

        // Standard text content
        if (delta?.content) {
          onChunk(delta.content)
        }

        // Thinking content (Claude extended thinking via OpenRouter)
        // Arrives as delta.thinking or as a content block with type="thinking"
        if (delta?.thinking) {
          onThinking(delta.thinking)
        }

        // Some models send thinking as content_block_delta
        // Check for this format too
        if (parsed.type === 'content_block_delta') {
          if (parsed.delta?.type === 'thinking_delta') {
            onThinking(parsed.delta.thinking)
          }
          if (parsed.delta?.type === 'text_delta') {
            onChunk(parsed.delta.text)
          }
        }

      } catch { /* skip malformed lines */ }
    }
  }

  onDone()
}