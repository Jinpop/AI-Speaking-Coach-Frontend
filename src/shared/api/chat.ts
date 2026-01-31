import { apiRequest } from './client'

export type ChatHistoryItem = {
  role: 'user' | 'ai'
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
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
