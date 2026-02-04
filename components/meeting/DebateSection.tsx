'use client'

import { useEffect } from 'react'
import { useMeetingStore } from '@/stores/meetingStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { DebateTimer } from '@/components/debate/DebateTimer'

interface DebateSectionProps {
  meetingId: string
}

export function DebateSection({ meetingId }: DebateSectionProps) {
  const { debate } = useMeetingStore()
  const supabase = createClient()

  useEffect(() => {
    // ディベートデータがない場合は作成
    if (!debate) {
      createDebate()
    }
  }, [])

  const createDebate = async () => {
    await supabase.from('debates').insert({
      meeting_id: meetingId,
      duration_minutes: 5,
    })
  }

  const updateDebate = async (field: string, value: string) => {
    if (!debate) return

    await supabase
      .from('debates')
      .update({ [field]: value })
      .eq('id', debate.id)
  }

  if (!debate) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左側: ディベート設定 */}
      <div className="space-y-6">
        <Card title="ディベートテーマ">
          <div className="space-y-4">
            <Input
              value={debate.theme || ''}
              onChange={(e) => updateDebate('theme', e.target.value)}
              placeholder="テーマを入力..."
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={debate.pro_side || ''}
                onChange={(e) => updateDebate('pro_side', e.target.value)}
                placeholder="賛成派"
              />
              <Input
                value={debate.con_side || ''}
                onChange={(e) => updateDebate('con_side', e.target.value)}
                placeholder="反対派"
              />
            </div>
            <Textarea
              value={debate.memo || ''}
              onChange={(e) => updateDebate('memo', e.target.value)}
              placeholder="メモ"
              rows={4}
            />
          </div>
        </Card>
      </div>

      {/* 右側: タイマー */}
      <div>
        <DebateTimer meetingId={meetingId} debateId={debate.id} />
      </div>
    </div>
  )
}
