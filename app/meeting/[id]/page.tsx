'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import type { Meeting } from '@/types'

export default function MeetingPage() {
  const params = useParams()
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
    // ユーザー名をプロンプトで取得（実際の実装では認証システムから取得）
    const name = prompt('あなたの名前を入力してください') || 'ユーザー'
    setUserName(name)
  }, [meetingId])

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

  const handleMeetingStart = () => {
    // AI insights generation will be triggered here in the future
    console.log('Meeting started, generating AI insights...')
  }

  return (
    <div className="min-h-screen">
      <Header
        meetingId={meetingId}
        userName={userName}
        meetingDate={formatDate(currentMeeting.meeting_date)}
        meeting={currentMeeting}
        onMeetingStart={handleMeetingStart}
      />

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-7xl mx-auto py-8 px-6">
        {activeTab === 'agenda' && <AgendaSection meetingId={meetingId} meeting={currentMeeting} />}
        {activeTab === 'sales' && <SalesSection meetingId={meetingId} meeting={currentMeeting} />}
        {activeTab === 'dev' && <DevSection meetingId={meetingId} meeting={currentMeeting} />}
        {activeTab === 'announce' && <AnnounceSection meetingId={meetingId} meeting={currentMeeting} />}
        {activeTab === 'free' && <FreeSection meetingId={meetingId} meeting={currentMeeting} />}
        {activeTab === 'debate' && <DebateSection meetingId={meetingId} meeting={currentMeeting} />}
      </div>
    </div>
  )
}
