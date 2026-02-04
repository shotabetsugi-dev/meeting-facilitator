'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import type { Meeting } from '@/types'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewMeeting, setShowNewMeeting] = useState(false)
  const [newMeetingDate, setNewMeetingDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    fetchMeetings()
  }, [])

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
      router.push(`/meeting/${data.id}`)
    }
  }

  const goToMeeting = (id: string) => {
    router.push(`/meeting/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            社内定例会議 AIファシリテーター
          </h1>
          <p className="text-gray-600">
            会議を選択するか、新しい会議を作成してください
          </p>
        </div>

        {/* 新規会議作成 */}
        <Card className="mb-8">
          {!showNewMeeting ? (
            <Button
              onClick={() => setShowNewMeeting(true)}
              className="w-full"
              size="lg"
            >
              新しい会議を作成
            </Button>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">新規会議を作成</h2>
              <Input
                type="date"
                value={newMeetingDate}
                onChange={(e) => setNewMeetingDate(e.target.value)}
                label="会議日"
              />
              <div className="flex gap-2">
                <Button onClick={createMeeting} className="flex-1">
                  作成
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowNewMeeting(false)}
                  className="flex-1"
                >
                  キャンセル
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* 会議一覧 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">最近の会議</h2>
          {meetings.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-8">
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
                      <span className="text-lg font-bold">
                        {formatDate(meeting.meeting_date)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          meeting.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : meeting.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
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
                      <p className="text-sm text-gray-600">
                        参加者: {meeting.participants.join(', ')}
                      </p>
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
