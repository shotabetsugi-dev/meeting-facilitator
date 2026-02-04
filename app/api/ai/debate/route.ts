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
    const { category } = await request.json()

    // 過去のテーマを取得
    const { data: history } = await supabase
      .from('debate_themes_history')
      .select('theme')
      .order('used_at', { ascending: false })
      .limit(20)

    const pastThemes = history?.map((h) => h.theme).join('\n') || ''

    const prompt = `あなたはビジネス研修のファシリテーターです。
ソフトウェア開発会社の社内ディベート用テーマを1つ生成してください。

カテゴリ: ${category || 'ビジネス'}

条件:
- 賛成派と反対派で議論できる
- 正解がなく、どちらも論じられる
- 5分程度で議論できる規模
- 「〜すべきか」形式

${pastThemes ? '過去使用テーマ（重複避ける）:\n' + pastThemes : ''}

テーマのみ1行で出力。説明不要。`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    })

    const theme =
      message.content[0].type === 'text'
        ? message.content[0].text.trim().replace(/^「|」$/g, '')
        : ''

    // テーマを履歴に保存
    if (theme) {
      await supabase
        .from('debate_themes_history')
        .insert({ theme, category: category || 'general' })
    }

    return NextResponse.json({ theme })
  } catch (error) {
    console.error('Debate theme error:', error)
    return NextResponse.json(
      { error: 'Failed to generate theme' },
      { status: 500 }
    )
  }
}
