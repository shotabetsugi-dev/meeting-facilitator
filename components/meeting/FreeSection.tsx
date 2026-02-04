'use client'

import { useState } from 'react'
import { useMeetingStore } from '@/stores/meetingStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

interface FreeSectionProps {
  meetingId: string
}

export function FreeSection({ meetingId }: FreeSectionProps) {
  const { freeTopics } = useMeetingStore()
  const supabase = createClient()
  const [newTopic, setNewTopic] = useState('')

  const addTopic = async () => {
    if (!newTopic) return

    await supabase.from('free_topics').insert({
      meeting_id: meetingId,
      content: newTopic,
      sort_order: freeTopics.length,
    })

    setNewTopic('')
  }

  const updateTopic = async (id: string, content: string) => {
    await supabase
      .from('free_topics')
      .update({ content })
      .eq('id', id)
  }

  const deleteTopic = async (id: string) => {
    await supabase
      .from('free_topics')
      .delete()
      .eq('id', id)
  }

  return (
    <div className="space-y-6">
      {freeTopics.map((topic, index) => (
        <Card key={topic.id}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] bg-clip-text text-transparent">
                議題 {index + 1}
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteTopic(topic.id)}
              >
                削除
              </Button>
            </div>
            <Textarea
              value={topic.content || ''}
              onChange={(e) => updateTopic(topic.id, e.target.value)}
              placeholder="議題内容"
              rows={4}
            />
          </div>
        </Card>
      ))}

      <Card title="新規議題を追加">
        <div className="space-y-4">
          <Textarea
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="議題内容を入力..."
            rows={4}
          />
          <Button onClick={addTopic} disabled={!newTopic}>
            議題を追加
          </Button>
        </div>
      </Card>
    </div>
  )
}
