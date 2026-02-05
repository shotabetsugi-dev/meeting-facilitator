'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils'
import type { Meeting } from '@/types'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newMeetingDate, setNewMeetingDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetchMeetings()
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー'
      setUserName(name)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const fetchMeetings = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('meetings')
      .select('*')
      .order('meeting_date', { ascending: false })
      .limit(20)

    if (data) {
      setMeetings(data)
    }
    setLoading(false)
  }

  const createMeeting = async () => {
    const { data, error } = await supabase
      .from('meetings')
      .insert({
        meeting_date: newMeetingDate,
        status: 'draft',
      })
      .select()
      .single()

    if (!error && data) {
      setIsModalOpen(false)
      router.push(`/meeting/${data.id}`)
    }
  }

  const goToMeeting = (id: string) => {
    router.push(`/meeting/${id}`)
  }

  const goToReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // カードのクリックイベントを止める
    router.push(`/meeting/${id}/report`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[var(--foreground)]/60">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-middle)] to-[var(--gradient-end)] bg-clip-text text-transparent">
                Lays-Lop
              </span>
              <span className="text-[var(--accent-blue)]"> Internal meeting</span>
            </h1>
            <p className="text-[var(--foreground)]/60">
              会議を選択するか、新しい会議を作成してください
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[var(--foreground)]/80">👤 {userName}</span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        </div>

        {/* 新規会議作成ボタン */}
        <div className="mb-8">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full"
            size="lg"
          >
            新しい会議を作成
          </Button>
        </div>

        {/* 新規会議作成モーダル */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="新規会議を作成"
          position="right"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                会議日
              </label>
              <Input
                type="date"
                value={newMeetingDate}
                onChange={(e) => setNewMeetingDate(e.target.value)}
              />
            </div>
            <Button onClick={createMeeting} className="w-full" size="lg">
              会議を作成
            </Button>
          </div>
        </Modal>

        {/* 会議一覧 */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">最近の会議</h2>
          {meetings.length === 0 ? (
            <Card>
              <p className="text-center text-[var(--foreground)]/50 py-8">
                まだ会議がありません。新しい会議を作成してください。
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => goToMeeting(meeting.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[var(--foreground)]">
                        {formatDate(meeting.meeting_date)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          meeting.status === 'completed'
                            ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]'
                            : meeting.status === 'in_progress'
                            ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]'
                            : 'bg-[var(--foreground)]/10 text-[var(--foreground)]/60'
                        }`}
                      >
                        {meeting.status === 'completed'
                          ? '完了'
                          : meeting.status === 'in_progress'
                          ? '進行中'
                          : '下書き'}
                      </span>
                    </div>
                    {meeting.participants && meeting.participants.length > 0 && (
                      <p className="text-sm text-[var(--foreground)]/60">
                        参加者: {meeting.participants.join(', ')}
                      </p>
                    )}
                    {meeting.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full mt-2"
                        onClick={(e) => goToReport(meeting.id, e)}
                      >
                        📄 レポートを表示
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
