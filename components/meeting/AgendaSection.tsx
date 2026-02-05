'use client'

import { useState, useEffect, useRef } from 'react'
import { useMeetingStore } from '@/stores/meetingStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { Agenda, Meeting } from '@/types'

interface AgendaSectionProps {
  meetingId: string
  meeting?: Meeting
}

export function AgendaSection({ meetingId, meeting }: AgendaSectionProps) {
  const { agendas, updateAgenda: updateAgendaInStore } = useMeetingStore()
  const supabase = createClient()
  const [newAgenda, setNewAgenda] = useState({ title: '', detail: '' })
  const [localAgendas, setLocalAgendas] = useState<Agenda[]>([])
  const updateTimers = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const isDraftMode = !meeting || meeting.status === 'draft'
  const isMeetingMode = meeting?.status === 'in_progress'

  // Sync agendas from store to local state
  useEffect(() => {
    setLocalAgendas(agendas)
  }, [agendas])

  const addAgenda = async () => {
    if (!newAgenda.title) return

    const { data, error } = await supabase
      .from('agendas')
      .insert({
        meeting_id: meetingId,
        agenda_number: agendas.length + 1,
        title: newAgenda.title,
        detail: newAgenda.detail,
        sort_order: agendas.length,
      })
      .select()
      .single()

    if (!error) {
      setNewAgenda({ title: '', detail: '' })
    }
  }

  const updateAgenda = (id: string, field: keyof Agenda, value: string) => {
    // Optimistic update - update local state immediately
    setLocalAgendas(prev =>
      prev.map(agenda =>
        agenda.id === id ? { ...agenda, [field]: value } : agenda
      )
    )

    // Clear existing timer for this field
    const timerKey = `${id}-${field}`
    if (updateTimers.current[timerKey]) {
      clearTimeout(updateTimers.current[timerKey])
    }

    // Debounced Supabase update (500ms after user stops typing)
    updateTimers.current[timerKey] = setTimeout(async () => {
      await supabase
        .from('agendas')
        .update({ [field]: value })
        .eq('id', id)

      delete updateTimers.current[timerKey]
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* 既存議題 */}
      {localAgendas.map((agenda) => (
        <Card key={agenda.id}>
          <div className="space-y-4">
            {/* Agenda Header */}
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] bg-clip-text text-transparent">
                Agenda{agenda.agenda_number}
              </span>
              {isDraftMode ? (
                <Input
                  value={agenda.title}
                  onChange={(e) => updateAgenda(agenda.id, 'title', e.target.value)}
                  placeholder="議題タイトル"
                  className="flex-1"
                />
              ) : (
                <h3 className="text-lg font-semibold text-[var(--foreground)] flex-1">
                  {agenda.title}
                </h3>
              )}
            </div>

            {/* 事前入力セクション */}
            {isDraftMode ? (
              <>
                <Textarea
                  value={agenda.detail || ''}
                  onChange={(e) => updateAgenda(agenda.id, 'detail', e.target.value)}
                  placeholder="詳細"
                  rows={2}
                />
                <Textarea
                  value={agenda.content || ''}
                  onChange={(e) => updateAgenda(agenda.id, 'content', e.target.value)}
                  placeholder="内容"
                  rows={4}
                />
                <Textarea
                  value={agenda.action_items || ''}
                  onChange={(e) => updateAgenda(agenda.id, 'action_items', e.target.value)}
                  placeholder="Action"
                  rows={3}
                />
              </>
            ) : (
              <div className="space-y-3 p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)]">
                <div>
                  <h4 className="text-xs font-semibold text-[var(--accent-purple)] mb-1">詳細</h4>
                  <p className="text-sm text-[var(--foreground)]/80">{agenda.detail || '未設定'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--accent-purple)] mb-1">内容</h4>
                  <p className="text-sm text-[var(--foreground)]/80 whitespace-pre-wrap">
                    {agenda.content || '未設定'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--accent-purple)] mb-1">事前Action</h4>
                  <p className="text-sm text-[var(--foreground)]/80 whitespace-pre-wrap">
                    {agenda.action_items || '未設定'}
                  </p>
                </div>
              </div>
            )}

            {/* 会議モード: ディスカッションセクション */}
            {isMeetingMode && (
              <div className="mt-6 pt-6 border-t-2 border-[var(--accent-blue)]/30 space-y-4">
                <h4 className="text-sm font-bold text-[var(--accent-blue)]">💬 会議ディスカッション</h4>
                <Textarea
                  value={agenda.discussion_notes || ''}
                  onChange={(e) => updateAgenda(agenda.id, 'discussion_notes', e.target.value)}
                  placeholder="議論メモ・意見・質問など..."
                  rows={4}
                />
                <Textarea
                  value={agenda.conclusion || ''}
                  onChange={(e) => updateAgenda(agenda.id, 'conclusion', e.target.value)}
                  placeholder="結論・決定事項"
                  rows={3}
                />
              </div>
            )}
          </div>
        </Card>
      ))}

      {/* 新規議題追加（事前入力モードのみ） */}
      {isDraftMode && (
        <Card title="新規議題を追加">
          <div className="space-y-4">
            <Input
              value={newAgenda.title}
              onChange={(e) => setNewAgenda({ ...newAgenda, title: e.target.value })}
              placeholder="議題タイトル"
            />
            <Textarea
              value={newAgenda.detail}
              onChange={(e) => setNewAgenda({ ...newAgenda, detail: e.target.value })}
              placeholder="詳細"
              rows={2}
            />
            <Button onClick={addAgenda} disabled={!newAgenda.title}>
              議題を追加
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
