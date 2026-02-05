'use client'

import { useState, useEffect, useRef } from 'react'
import { useMeetingStore } from '@/stores/meetingStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { Agenda } from '@/types'

interface AgendaSectionProps {
  meetingId: string
}

export function AgendaSection({ meetingId }: AgendaSectionProps) {
  const { agendas, updateAgenda: updateAgendaInStore } = useMeetingStore()
  const supabase = createClient()
  const [newAgenda, setNewAgenda] = useState({ title: '', detail: '' })
  const [localAgendas, setLocalAgendas] = useState<Agenda[]>([])
  const updateTimers = useRef<{ [key: string]: NodeJS.Timeout }>({})

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
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] bg-clip-text text-transparent">
                Agenda{agenda.agenda_number}
              </span>
              <Input
                value={agenda.title}
                onChange={(e) => updateAgenda(agenda.id, 'title', e.target.value)}
                placeholder="議題タイトル"
                className="flex-1"
              />
            </div>
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
          </div>
        </Card>
      ))}

      {/* 新規議題追加 */}
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
    </div>
  )
}
