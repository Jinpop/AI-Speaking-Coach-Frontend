import { apiRequest } from './client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const getUserId = () => localStorage.getItem('userId') ?? '2'

export type ChatHistoryItem = {
  role: 'user' | 'assistant'
  content: string
}

export type ChatTurnResponse = {
  userText: string
  aiText: string
  aiAudioBase64?: string | null
}

export async function postChatTurn(audio: Blob, history: ChatHistoryItem[]) {
  const formData = new FormData()
  formData.append('audio', audio, 'recording.webm')
  if (history.length) {
    formData.append('history', JSON.stringify(history))
  }

  return apiRequest<ChatTurnResponse>({
    method: 'POST',
    url: '/api/chat/turn',
    data: formData,
  })
}

export async function postChatSTT(audio: Blob) {
  const formData = new FormData()
  formData.append('audio', audio, 'recording.webm')
  return apiRequest<{ userText: string }>({
    method: 'POST',
    url: '/api/chat/stt',
    data: formData,
  })
}

export async function streamChatLLM(text: string, history: ChatHistoryItem[]) {
  const response = await fetch(`${API_BASE_URL}/api/chat/llm/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-USER-ID': getUserId(),
    },
    body: JSON.stringify({
      text,
      history: JSON.stringify(history),
    }),
  })

  if (!response.ok || !response.body) {
    const message = await response.text().catch(() => 'LLM 요청에 실패했습니다.')
    throw new Error(message)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')

  const stream = new ReadableStream<string>({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        controller.enqueue(chunk)
      }
      controller.close()
      reader.releaseLock()
    },
  })

  return stream
}

export async function postChatTTS(text: string) {
  return apiRequest<{ aiAudioBase64: string }>({
    method: 'POST',
    url: '/api/chat/tts',
    data: { text },
  })
}
