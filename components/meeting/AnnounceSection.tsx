'use client'

import { useMeetingStore } from '@/stores/meetingStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { useState, useEffect, useRef } from 'react'
import type { Meeting } from '@/types'

interface AnnounceSectionProps {
  meetingId: string
  meeting?: Meeting
}

export function AnnounceSection({ meetingId, meeting }: AnnounceSectionProps) {
  const { announcement } = useMeetingStore()
  const supabase = createClient()
  const [localContent, setLocalContent] = useState('')
  const updateTimer = useRef<NodeJS.Timeout | undefined>(undefined)

  const isDraftMode = !meeting || meeting.status === 'draft'

  useEffect(() => {
    setLocalContent(announcement?.content || '')
  }, [announcement])

  const updateAnnouncement = (content: string) => {
    // Optimistic update
    setLocalContent(content)

    // Clear existing timer
    if (updateTimer.current) {
      clearTimeout(updateTimer.current)
    }

    // Debounced Supabase update
    updateTimer.current = setTimeout(async () => {
      if (announcement) {
        await supabase
          .from('announcements')
          .update({ content })
          .eq('id', announcement.id)
      } else {
        await supabase
          .from('announcements')
          .insert({ meeting_id: meetingId, content })
      }
    }, 500)
  }

  return (
    <Card title="アナウンス">
      {isDraftMode ? (
        <Textarea
          value={localContent}
          onChange={(e) => updateAnnouncement(e.target.value)}
          placeholder="全体アナウンスを記入..."
          rows={10}
        />
      ) : (
        <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)]">
          <p className="text-sm text-[var(--foreground)]/80 whitespace-pre-wrap">
            {localContent || '未設定'}
          </p>
        </div>
      )}
    </Card>
  )
}
