'use client'

import { useMeetingStore } from '@/stores/meetingStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'

interface AnnounceSectionProps {
  meetingId: string
}

export function AnnounceSection({ meetingId }: AnnounceSectionProps) {
  const { announcement } = useMeetingStore()
  const supabase = createClient()

  const updateAnnouncement = async (content: string) => {
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
  }

  return (
    <Card title="アナウンス">
      <Textarea
        value={announcement?.content || ''}
        onChange={(e) => updateAnnouncement(e.target.value)}
        placeholder="全体アナウンスを記入..."
        rows={10}
      />
    </Card>
  )
}
