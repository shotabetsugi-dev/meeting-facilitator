'use client'

import { useRouter } from 'next/navigation'
import { PresenceIndicator } from './PresenceIndicator'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { Meeting } from '@/types'

interface HeaderProps {
  meetingId?: string
  userName?: string
  meetingDate?: string
  meeting?: Meeting
  onMeetingStart?: () => void
  onMeetingComplete?: () => void
}

export function Header({ meetingId, userName, meetingDate, meeting, onMeetingStart, onMeetingComplete }: HeaderProps) {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const startMeeting = async () => {
    if (!meetingId) return

    console.log('Starting meeting...', meetingId)

    const now = new Date()
    const timeString = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const { data, error } = await supabase
      .from('meetings')
      .update({
        status: 'in_progress',
        pre_input_completed_at: now.toISOString(),
        start_time: timeString,
      })
      .eq('id', meetingId)
      .select()
      .single()

    if (error) {
      console.error('Failed to start meeting:', error)
      alert('会議の開始に失敗しました: ' + error.message)
      return
    }

    console.log('Meeting started successfully:', data)

    // Trigger AI insights generation
    if (onMeetingStart) {
      onMeetingStart()
    }
  }

  const completeMeeting = async () => {
    if (!meetingId) return

    const confirm = window.confirm('会議を完了しますか？完了後は編集できなくなります。')
    if (!confirm) return

    console.log('Completing meeting...', meetingId)

    const now = new Date()
    const timeString = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const { data, error } = await supabase
      .from('meetings')
      .update({
        status: 'completed',
        end_time: timeString,
      })
      .eq('id', meetingId)
      .select()
      .single()

    if (error) {
      console.error('Failed to complete meeting:', error)
      alert('会議の完了に失敗しました: ' + error.message)
      return
    }

    console.log('Meeting completed successfully:', data)

    // Trigger report generation
    if (onMeetingComplete) {
      onMeetingComplete()
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { label: '事前入力中', color: 'bg-[var(--foreground)]/10 text-[var(--foreground)]/60' },
      in_progress: { label: '会議中', color: 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' },
      completed: { label: '完了', color: 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]' },
    }
    const badge = badges[status as keyof typeof badges] || badges.draft
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <header className="border-b border-[var(--card-border)] px-6 py-4 bg-[var(--card-bg)]/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            <span className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-middle)] to-[var(--gradient-end)] bg-clip-text text-transparent">
              Lays-Lop
            </span>
            <span className="text-[var(--accent-blue)]"> Internal meeting</span>
          </h1>
          {meetingDate && (
            <p className="text-sm text-[var(--foreground)]/60 mt-1">{meetingDate}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {meeting && getStatusBadge(meeting.status)}
          {meeting && meeting.status === 'draft' && (
            <Button onClick={startMeeting} size="sm">
              🚀 会議を開始
            </Button>
          )}
          {meeting && meeting.status === 'in_progress' && (
            <Button onClick={completeMeeting} size="sm" variant="secondary">
              ✓ 会議を完了
            </Button>
          )}
          {meetingId && userName && (
            <PresenceIndicator meetingId={meetingId} userName={userName} />
          )}
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>
      </div>
    </header>
  )
}
