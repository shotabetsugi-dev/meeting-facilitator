'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import type { Report, Meeting } from '@/types'
import ReactMarkdown from 'react-markdown'

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params.id as string
  const supabase = createClient()
  const [report, setReport] = useState<Report | null>(null)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [meetingId])

  const fetchData = async () => {
    setLoading(true)

    // 会議情報を取得
    const { data: meetingData } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .single()

    if (meetingData) {
      setMeeting(meetingData)
    }

    // レポートを取得
    const { data: reportData } = await supabase
      .from('reports')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single()

    if (reportData) {
      setReport(reportData)
    }

    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleBack = () => {
    router.push(`/meeting/${meetingId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="text-center py-8">
            <p className="text-xl text-[var(--foreground)]/60 mb-4">
              レポートが見つかりません
            </p>
            <Button onClick={handleBack}>会議に戻る</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ヘッダー（印刷時は非表示） */}
      <div className="print:hidden border-b border-[var(--card-border)] px-6 py-4 bg-[var(--card-bg)]/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              <span className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-middle)] to-[var(--gradient-end)] bg-clip-text text-transparent">
                会議レポート
              </span>
            </h1>
            {meeting && (
              <p className="text-sm text-[var(--foreground)]/60 mt-1">
                {formatDate(meeting.meeting_date)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleBack}>
              会議に戻る
            </Button>
            <Button onClick={handlePrint}>
              印刷 / PDF
            </Button>
          </div>
        </div>
      </div>

      {/* レポート本文 */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        <Card>
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown>{report.content}</ReactMarkdown>
          </div>
        </Card>

        {/* フッター（印刷時は非表示） */}
        <div className="print:hidden mt-6 text-center text-sm text-[var(--foreground)]/40">
          生成日時: {new Date(report.generated_at).toLocaleString('ja-JP')}
        </div>
      </div>

      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .prose {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
