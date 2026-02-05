import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { meetingId } = await request.json()

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // 会議データを取得
    const { data: meeting } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .single()

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // 各セクションのデータを取得
    const [agendas, salesMetrics, salesStatus, devProjects, announcement, freeTopics, debate] =
      await Promise.all([
        supabase.from('agendas').select('*').eq('meeting_id', meetingId).order('sort_order'),
        supabase.from('sales_metrics').select('*, sales_channels(*)').eq('meeting_id', meetingId),
        supabase.from('sales_status').select('*').eq('meeting_id', meetingId).order('sort_order'),
        supabase.from('dev_projects').select('*').eq('meeting_id', meetingId).order('sort_order'),
        supabase.from('announcements').select('*').eq('meeting_id', meetingId).single(),
        supabase.from('free_topics').select('*').eq('meeting_id', meetingId).order('sort_order'),
        supabase.from('debates').select('*').eq('meeting_id', meetingId).single(),
      ])

    // AIインサイトを生成（現在はルールベース、後でOpenAI APIに置き換え可能）
    const insights = generateInsights({
      agendas: agendas.data || [],
      salesMetrics: salesMetrics.data || [],
      salesStatus: salesStatus.data || [],
      devProjects: devProjects.data || [],
      announcement: announcement.data,
      freeTopics: freeTopics.data || [],
      debate: debate.data,
    })

    // インサイトをデータベースに保存
    const insertPromises = insights.map((insight) =>
      supabase.from('ai_insights').insert({
        meeting_id: meetingId,
        section_type: insight.section_type,
        section_id: insight.section_id,
        insight_type: insight.insight_type,
        title: insight.title,
        content: insight.content,
        priority: insight.priority,
      })
    )

    await Promise.all(insertPromises)

    return NextResponse.json({ success: true, insights })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

// ルールベースのインサイト生成（後でAI APIに置き換え可能）
function generateInsights(data: any) {
  const insights: any[] = []

  // Agenda分析
  if (data.agendas.length === 0) {
    insights.push({
      section_type: 'agenda',
      insight_type: 'warning',
      title: '議題未設定',
      content: '会議の議題が設定されていません。具体的な議題を追加することをお勧めします。',
      priority: 3,
    })
  } else {
    const emptyAgendas = data.agendas.filter(
      (a: any) => !a.content && !a.action_items
    )
    if (emptyAgendas.length > 0) {
      insights.push({
        section_type: 'agenda',
        insight_type: 'suggestion',
        title: '議題の詳細化',
        content: `${emptyAgendas.length}件の議題に内容またはアクションが未記入です。事前に詳細を記入すると、会議がスムーズに進行します。`,
        priority: 2,
      })
    }
  }

  // Sales分析
  if (data.salesMetrics.length > 0) {
    const totalLeads = data.salesMetrics.reduce(
      (sum: number, m: any) => sum + (m.leads_count || 0),
      0
    )
    const totalContracts = data.salesMetrics.reduce(
      (sum: number, m: any) => sum + (m.contracts_count || 0),
      0
    )

    if (totalLeads > 0) {
      const conversionRate = ((totalContracts / totalLeads) * 100).toFixed(1)
      insights.push({
        section_type: 'sales',
        insight_type: 'analysis',
        title: '営業成約率',
        content: `今月の成約率は${conversionRate}%です（リード数: ${totalLeads}件、成約: ${totalContracts}件）`,
        priority: 1,
      })
    }
  }

  // 案件ステータス分析
  if (data.salesStatus.length > 0) {
    const withoutNextAction = data.salesStatus.filter(
      (s: any) => !s.next_action || !s.next_action_date
    )
    if (withoutNextAction.length > 0) {
      insights.push({
        section_type: 'sales',
        insight_type: 'warning',
        title: '次回アクション未設定',
        content: `${withoutNextAction.length}件の案件に次回アクションまたは期日が設定されていません。`,
        priority: 2,
      })
    }
  }

  // Dev Projects分析
  if (data.devProjects.length > 0) {
    const incidents = data.devProjects.filter((p: any) => p.signal === 'インシデント')
    const needsAdjustment = data.devProjects.filter((p: any) => p.signal === '要調整')

    if (incidents.length > 0) {
      insights.push({
        section_type: 'dev',
        insight_type: 'warning',
        title: 'インシデント発生中',
        content: `${incidents.length}件のプロジェクトでインシデントが発生しています: ${incidents
          .map((p: any) => p.project_name)
          .join(', ')}`,
        priority: 3,
      })
    }

    if (needsAdjustment.length > 0) {
      insights.push({
        section_type: 'dev',
        insight_type: 'suggestion',
        title: '調整が必要なプロジェクト',
        content: `${needsAdjustment.length}件のプロジェクトが要調整状態です。会議で優先的に議論することをお勧めします。`,
        priority: 2,
      })
    }
  }

  // Debate分析
  if (data.debate && (!data.debate.theme || !data.debate.pro_side || !data.debate.con_side)) {
    insights.push({
      section_type: 'general',
      insight_type: 'tip',
      title: 'ディベート設定',
      content: 'ディベートのテーマや担当者を事前に設定すると、より活発な議論が期待できます。',
      priority: 1,
    })
  }

  // 全体的なアドバイス
  if (data.agendas.length > 0 && data.salesMetrics.length > 0 && data.devProjects.length > 0) {
    insights.push({
      section_type: 'general',
      insight_type: 'analysis',
      title: '会議準備完了',
      content: '事前入力が充実しています。効率的な会議が期待できます。',
      priority: 1,
    })
  }

  return insights
}
