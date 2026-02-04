import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { meetingId } = await request.json()

    // 会議データを全取得
    const [
      { data: meeting },
      { data: agendas },
      { data: salesMetrics },
      { data: salesStatus },
      { data: devProjects },
      { data: announcements },
      { data: freeTopics },
      { data: debate },
    ] = await Promise.all([
      supabase.from('meetings').select('*').eq('id', meetingId).single(),
      supabase
        .from('agendas')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('sort_order'),
      supabase
        .from('sales_metrics')
        .select('*, sales_channels(name)')
        .eq('meeting_id', meetingId),
      supabase.from('sales_status').select('*').eq('meeting_id', meetingId),
      supabase
        .from('dev_projects')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('sort_order'),
      supabase.from('announcements').select('*').eq('meeting_id', meetingId),
      supabase.from('free_topics').select('*').eq('meeting_id', meetingId),
      supabase.from('debates').select('*').eq('meeting_id', meetingId).single(),
    ])

    const prompt = `あなたは議事録作成のエキスパートです。以下の会議データから簡潔で読みやすい報告書を作成してください。

## 会議情報
- 日付: ${meeting?.meeting_date || ''}
- 参加者: ${meeting?.participants?.join(', ') || '未記入'}

## 議題
${agendas?.map((a: any) => `### Agenda${a.agenda_number} ${a.title}
${a.detail || ''}
内容: ${a.content || '記載なし'}
Action: ${a.action_items || 'なし'}`).join('\n\n') || 'なし'}

## Sales
${salesMetrics?.map((s: any) => `- ${s.sales_channels?.name}: 着手${s.leads_count} / アポ${s.appointments_count} / 成約${s.contracts_count}`).join('\n') || 'なし'}

## 営業状況
${salesStatus?.map((s: any) => `- ${s.company_name}: ${s.status_text || ''}`).join('\n') || 'なし'}

## Dev
### 受託
${devProjects?.filter((p: any) => p.project_type === 'client').map((p: any) => `- ${p.project_name} [${p.signal}]: ${p.status_text || ''}`).join('\n') || 'なし'}
### 内部
${devProjects?.filter((p: any) => p.project_type === 'internal').map((p: any) => `- ${p.project_name} [${p.signal}]: ${p.status_text || ''}`).join('\n') || 'なし'}

## アナウンス
${announcements?.[0]?.content || 'なし'}

## ディベート
テーマ: ${debate?.theme || '実施なし'}

---

以下の形式で報告書を作成:

# 会議報告書 ${meeting?.meeting_date || ''}

## サマリー
（3行程度）

## 決定事項・Action
（箇条書き）

## 営業ハイライト

## 開発状況

## 次回までのTODO
（担当者付き）`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const report =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // 報告書を保存
    await supabase.from('reports').upsert({
      meeting_id: meetingId,
      content: report,
      generated_at: new Date().toISOString(),
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
