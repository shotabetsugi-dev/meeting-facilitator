import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    let prompt = ''

    switch (type) {
      case 'agenda':
        prompt = `あなたは会議のファシリテーターです。以下の議題情報を簡潔に分析し、議論のポイントと提案を出してください。

議題: ${data.title}
詳細: ${data.detail || 'なし'}
内容: ${data.content || 'まだ記載なし'}
Action: ${data.action_items || 'まだ記載なし'}

JSON形式で回答:
{
  "summary": "要約（50文字以内）",
  "keyPoints": ["ポイント1", "ポイント2"],
  "suggestions": ["提案1", "提案2"]
}`
        break

      case 'sales':
        prompt = `あなたは営業コンサルタントです。以下の営業データを分析してください。

【媒体別数値】
${data.metrics?.map((m: any) => `${m.sales_channels?.name || m.channel_name}: 着手${m.leads_count}件 → アポ${m.appointments_count}件 → 成約${m.contracts_count}件`).join('\n') || 'なし'}

【営業状況】
${data.status?.map((s: any) => `${s.company_name}: ${s.status_text || ''}`).join('\n') || 'なし'}

JSON形式で回答:
{
  "highlights": ["ハイライト1", "ハイライト2"],
  "concerns": ["懸念点"],
  "recommendations": ["推奨アクション"]
}`
        break

      case 'dev':
        prompt = `あなたはプロジェクトマネージャーです。以下の開発案件を分析してください。

【受託開発】
${data.client?.map((p: any) => `${p.project_name}: ${p.signal} / ${p.temperature} - ${p.status_text || ''}`).join('\n') || 'なし'}

【内部開発】
${data.internal?.map((p: any) => `${p.project_name}: ${p.signal} - ${p.status_text || ''}`).join('\n') || 'なし'}

JSON形式で回答:
{
  "alerts": ["要注意案件と理由"],
  "healthy": "順調な案件数とコメント",
  "recommendations": ["推奨アクション"]
}`
        break

      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // JSONを抽出
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return NextResponse.json(JSON.parse(jsonMatch[0]))
    }

    return NextResponse.json({ raw: responseText })
  } catch (error) {
    console.error('AI Insight error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    )
  }
}
