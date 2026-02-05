'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { ChatMessage } from '@/types'

interface ChatPanelProps {
  meetingId: string
  userName: string
  userColor?: string
}

export function ChatPanel({ meetingId, userName, userColor = '#667eea' }: ChatPanelProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()

    // リアルタイム購読
    const channel = supabase
      .channel('chat-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage])
          scrollToBottom()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [meetingId])

  const fetchMessages = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
      setTimeout(scrollToBottom, 100)
    }
    setLoading(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { error } = await supabase.from('chat_messages').insert({
      meeting_id: meetingId,
      user_name: userName,
      user_color: userColor,
      message: newMessage.trim(),
    })

    if (!error) {
      setNewMessage('')
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card title="💬 チャット">
      <div className="flex flex-col h-[500px]">
        {/* メッセージリスト */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {loading ? (
            <div className="text-center py-4 text-[var(--foreground)]/60">
              読み込み中...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-4 text-[var(--foreground)]/60">
              まだメッセージがありません
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.user_name === userName ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: msg.user_color }}
                  />
                  <span className="text-xs text-[var(--foreground)]/60">
                    {msg.user_name}
                  </span>
                  <span className="text-xs text-[var(--foreground)]/40">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg max-w-[80%] ${
                    msg.user_name === userName
                      ? 'bg-[var(--accent-blue)]/20 text-[var(--foreground)]'
                      : 'bg-[var(--card-border)] text-[var(--foreground)]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* メッセージ入力 */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            送信
          </Button>
        </form>
      </div>
    </Card>
  )
}
