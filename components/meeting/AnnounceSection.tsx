'use client'

import { useMeetingStore } from '@/stores/meetingStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { useState, useEffect, useRef } from 'react'

interface AnnounceSectionProps {
  meetingId: string
}

export function AnnounceSection({ meetingId }: AnnounceSectionProps) {
  const { announcement } = useMeetingStore()
  const supabase = createClient()
  const [localContent, setLocalContent] = useState('')
  const updateTimer = useRef<NodeJS.Timeout>()

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
      <Textarea
        value={localContent}
        onChange={(e) => updateAnnouncement(e.target.value)}
        placeholder="全体アナウンスを記入..."
        rows={10}
      />
    </Card>
  )
}
