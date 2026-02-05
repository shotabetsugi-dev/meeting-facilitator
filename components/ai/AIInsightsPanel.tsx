'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import type { AIInsightDB } from '@/types'

interface AIInsightsPanelProps {
  meetingId: string
}

export function AIInsightsPanel({ meetingId }: AIInsightsPanelProps) {
  const supabase = createClient()
  const [insights, setInsights] = useState<AIInsightDB[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()

    // リアルタイム購読
    const channel = supabase
      .channel('ai-insights-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_insights',
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => {
          fetchInsights()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [meetingId])

  const fetchInsights = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) {
      setInsights(data)
    }
    setLoading(false)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'suggestion':
        return '💡'
      case 'analysis':
        return '📊'
      case 'tip':
        return '✨'
      default:
        return 'ℹ️'
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-red-500 bg-red-500/5'
      case 'suggestion':
        return 'border-l-blue-500 bg-blue-500/5'
      case 'analysis':
        return 'border-l-purple-500 bg-purple-500/5'
      case 'tip':
        return 'border-l-green-500 bg-green-500/5'
      default:
        return 'border-l-gray-500 bg-gray-500/5'
    }
  }

  if (loading) {
    return (
      <Card title="🤖 AI インサイト">
        <div className="text-center py-4 text-[var(--foreground)]/60">
          読み込み中...
        </div>
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card title="🤖 AI インサイト">
        <div className="text-center py-4 text-[var(--foreground)]/60">
          会議を開始すると、AIが分析結果を表示します
        </div>
      </Card>
    )
  }

  return (
    <Card title="🤖 AI インサイト">
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.insight_type)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getInsightIcon(insight.insight_type)}</span>
              <div className="flex-1">
                {insight.title && (
                  <h4 className="font-semibold text-[var(--foreground)] mb-1">
                    {insight.title}
                  </h4>
                )}
                <p className="text-sm text-[var(--foreground)]/80">{insight.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
