'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMeetingStore } from '@/stores/meetingStore'
import { useRealtime } from '@/hooks/useRealtime'
import { Header } from '@/components/layout/Header'
import { TabNavigation } from '@/components/meeting/TabNavigation'
import { AgendaSection } from '@/components/meeting/AgendaSection'
import { SalesSection } from '@/components/meeting/SalesSection'
import { DevSection } from '@/components/meeting/DevSection'
import { AnnounceSection } from '@/components/meeting/AnnounceSection'
import { FreeSection } from '@/components/meeting/FreeSection'
import { DebateSection } from '@/components/meeting/DebateSection'
import { AIInsightsPanel } from '@/components/ai/AIInsightsPanel'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import type { Meeting } from '@/types'

export default function MeetingPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params.id as string
  const supabase = createClient()
  const { setCurrentMeeting, currentMeeting } = useMeetingStore()
  const [activeTab, setActiveTab] = useState('agenda')
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('ユーザー')

  // リアルタイム同期を有効化
  useRealtime(meetingId)

  useEffect(() => {
    fetchMeeting()
    fetchUser()

    // meetingsテーブルのリアルタイム購読
    const meetingChannel = supabase
      .channel(`meeting-${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meetings',
          filter: `id=eq.${meetingId}`,
        },
        (payload) => {
          console.log('Meeting updated:', payload)
          if (payload.new) {
            setCurrentMeeting(payload.new as Meeting)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(meetingChannel)
    }
  }, [meetingId])

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Get name from user metadata
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー'
      setUserName(name)
    }
  }

  const fetchMeeting = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .single()

    if (data) {
      setCurrentMeeting(data as Meeting)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentMeeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[var(--foreground)]/60">会議が見つかりません</div>
      </div>
    )
  }

  const handleMeetingStart = async () => {
    console.log('Meeting started, generating AI insights...')

    try {
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingId }),
      })

      if (response.ok) {
        console.log('AI insights generated successfully')
      } else {
        console.error('Failed to generate AI insights')
      }
    } catch (error) {
      console.error('Error calling AI insights API:', error)
    }
  }

  const handleMeetingComplete = async () => {
    console.log('Meeting completed, generating report...')

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingId }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Report generated successfully:', data.report)
        // レポートページに遷移
        router.push(`/meeting/${meetingId}/report`)
      } else {
        console.error('Failed to generate report')
      }
    } catch (error) {
      console.error('Error calling report generation API:', error)
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        meetingId={meetingId}
        userName={userName}
        meetingDate={formatDate(currentMeeting.meeting_date)}
        meeting={currentMeeting}
        onMeetingStart={handleMeetingStart}
        onMeetingComplete={handleMeetingComplete}
      />

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {activeTab === 'agenda' && <AgendaSection meetingId={meetingId} meeting={currentMeeting} />}
            {activeTab === 'sales' && <SalesSection meetingId={meetingId} meeting={currentMeeting} />}
            {activeTab === 'dev' && <DevSection meetingId={meetingId} meeting={currentMeeting} />}
            {activeTab === 'announce' && <AnnounceSection meetingId={meetingId} meeting={currentMeeting} />}
            {activeTab === 'free' && <FreeSection meetingId={meetingId} meeting={currentMeeting} />}
            {activeTab === 'debate' && <DebateSection meetingId={meetingId} meeting={currentMeeting} />}
          </div>

          {/* AIインサイト & チャットサイドバー */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <AIInsightsPanel meetingId={meetingId} />
              <ChatPanel meetingId={meetingId} userName={userName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
