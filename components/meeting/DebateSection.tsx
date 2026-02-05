'use client'

import { useEffect, useState, useRef } from 'react'
import { useMeetingStore } from '@/stores/meetingStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { DebateTimer } from '@/components/debate/DebateTimer'
import type { Debate } from '@/types'

interface DebateSectionProps {
  meetingId: string
}

export function DebateSection({ meetingId }: DebateSectionProps) {
  const { debate } = useMeetingStore()
  const supabase = createClient()
  const [localDebate, setLocalDebate] = useState<Debate | null>(null)
  const updateTimers = useRef<{ [key: string]: NodeJS.Timeout }>({})

  useEffect(() => {
    // ディベートデータがない場合は作成
    if (!debate) {
      createDebate()
    } else {
      setLocalDebate(debate)
    }
  }, [debate])

  const createDebate = async () => {
    await supabase.from('debates').insert({
      meeting_id: meetingId,
      duration_minutes: 5,
    })
  }

  const updateDebate = (field: string, value: string) => {
    if (!localDebate) return

    // Optimistic update
    setLocalDebate({ ...localDebate, [field]: value })

    // Clear existing timer
    const timerKey = field
    if (updateTimers.current[timerKey]) {
      clearTimeout(updateTimers.current[timerKey])
    }

    // Debounced Supabase update
    updateTimers.current[timerKey] = setTimeout(async () => {
      await supabase
        .from('debates')
        .update({ [field]: value })
        .eq('id', localDebate.id)

      delete updateTimers.current[timerKey]
    }, 500)
  }

  if (!localDebate) {
    return <div className="text-[var(--foreground)]/60">Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左側: ディベート設定 */}
      <div className="space-y-6">
        <Card title="ディベートテーマ">
          <div className="space-y-4">
            <Input
              value={localDebate.theme || ''}
              onChange={(e) => updateDebate('theme', e.target.value)}
              placeholder="テーマを入力..."
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={localDebate.pro_side || ''}
                onChange={(e) => updateDebate('pro_side', e.target.value)}
                placeholder="賛成派"
              />
              <Input
                value={localDebate.con_side || ''}
                onChange={(e) => updateDebate('con_side', e.target.value)}
                placeholder="反対派"
              />
            </div>
            <Textarea
              value={localDebate.memo || ''}
              onChange={(e) => updateDebate('memo', e.target.value)}
              placeholder="メモ"
              rows={4}
            />
          </div>
        </Card>
      </div>

      {/* 右側: タイマー */}
      <div>
        <DebateTimer meetingId={meetingId} debateId={localDebate.id} />
      </div>
    </div>
  )
}
