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

    // レポートコンテンツを生成
    const reportContent = generateReportContent({
      meeting,
      agendas: agendas.data || [],
      salesMetrics: salesMetrics.data || [],
      salesStatus: salesStatus.data || [],
      devProjects: devProjects.data || [],
      announcement: announcement.data,
      freeTopics: freeTopics.data || [],
      debate: debate.data,
    })

    // レポートをデータベースに保存
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        meeting_id: meetingId,
        content: reportContent,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to save report:', error)
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
    }

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

function generateReportContent(data: any): string {
  const { meeting, agendas, salesMetrics, salesStatus, devProjects, announcement, freeTopics, debate } = data

  let content = `# 会議議事録\n\n`
  content += `**会議日**: ${meeting.meeting_date}\n`
  content += `**開始時刻**: ${meeting.start_time ? new Date(meeting.start_time).toLocaleTimeString('ja-JP') : '未記録'}\n`
  content += `**終了時刻**: ${meeting.end_time ? new Date(meeting.end_time).toLocaleTimeString('ja-JP') : '未記録'}\n\n`
  content += `---\n\n`

  // Agendas
  if (agendas.length > 0) {
    content += `## 📋 議題\n\n`
    agendas.forEach((agenda: any) => {
      content += `### Agenda${agenda.agenda_number}: ${agenda.title}\n\n`
      if (agenda.detail) content += `**詳細**: ${agenda.detail}\n\n`
      if (agenda.content) content += `**内容**: ${agenda.content}\n\n`
      if (agenda.discussion_notes) content += `**議論メモ**: ${agenda.discussion_notes}\n\n`
      if (agenda.conclusion) content += `**結論**: ${agenda.conclusion}\n\n`
      if (agenda.action_items) content += `**Action**: ${agenda.action_items}\n\n`
      content += `---\n\n`
    })
  }

  // Sales Metrics
  if (salesMetrics.length > 0) {
    content += `## 📊 営業数値\n\n`
    const totalLeads = salesMetrics.reduce((sum: number, m: any) => sum + (m.leads_count || 0), 0)
    const totalAppointments = salesMetrics.reduce((sum: number, m: any) => sum + (m.appointments_count || 0), 0)
    const totalContracts = salesMetrics.reduce((sum: number, m: any) => sum + (m.contracts_count || 0), 0)

    content += `| チャネル | リード | 商談 | 成約 |\n`
    content += `|---------|--------|------|------|\n`
    salesMetrics.forEach((metric: any) => {
      const channelName = metric.sales_channels?.name || '不明'
      content += `| ${channelName} | ${metric.leads_count} | ${metric.appointments_count} | ${metric.contracts_count} |\n`
    })
    content += `| **合計** | **${totalLeads}** | **${totalAppointments}** | **${totalContracts}** |\n\n`

    if (totalLeads > 0) {
      const conversionRate = ((totalContracts / totalLeads) * 100).toFixed(1)
      content += `**成約率**: ${conversionRate}%\n\n`
    }
    content += `---\n\n`
  }

  // Sales Status
  if (salesStatus.length > 0) {
    content += `## 💼 案件状況\n\n`
    salesStatus.forEach((status: any) => {
      content += `### ${status.company_name}\n`
      if (status.status_text) content += `- **状況**: ${status.status_text}\n`
      if (status.next_action) content += `- **次回アクション**: ${status.next_action}\n`
      if (status.next_action_date) content += `- **期日**: ${status.next_action_date}\n`
      content += `\n`
    })
    content += `---\n\n`
  }

  // Dev Projects
  if (devProjects.length > 0) {
    content += `## 💻 開発状況\n\n`
    const clientProjects = devProjects.filter((p: any) => p.project_type === 'client')
    const internalProjects = devProjects.filter((p: any) => p.project_type === 'internal')

    if (clientProjects.length > 0) {
      content += `### 受託開発\n\n`
      clientProjects.forEach((project: any) => {
        content += `- **${project.project_name}**\n`
        content += `  - シグナル: ${project.signal}\n`
        content += `  - 温度: ${project.temperature}\n`
        if (project.status_text) content += `  - 状況: ${project.status_text}\n`
        content += `\n`
      })
    }

    if (internalProjects.length > 0) {
      content += `### 内部開発\n\n`
      internalProjects.forEach((project: any) => {
        content += `- **${project.project_name}**\n`
        content += `  - シグナル: ${project.signal}\n`
        content += `  - 温度: ${project.temperature}\n`
        if (project.status_text) content += `  - 状況: ${project.status_text}\n`
        content += `\n`
      })
    }
    content += `---\n\n`
  }

  // Announcement
  if (announcement && announcement.content) {
    content += `## 📢 アナウンス\n\n`
    content += `${announcement.content}\n\n`
    content += `---\n\n`
  }

  // Free Topics
  if (freeTopics.length > 0) {
    content += `## 💭 フリー議題\n\n`
    freeTopics.forEach((topic: any, index: number) => {
      content += `### 議題 ${index + 1}\n\n`
      content += `${topic.content || '未記入'}\n\n`
    })
    content += `---\n\n`
  }

  // Debate
  if (debate && debate.theme) {
    content += `## 🎯 ディベート\n\n`
    content += `**テーマ**: ${debate.theme}\n\n`
    content += `- 賛成派: ${debate.pro_side || '未設定'}\n`
    content += `- 反対派: ${debate.con_side || '未設定'}\n\n`
    if (debate.memo) {
      content += `**メモ**:\n${debate.memo}\n\n`
    }
  }

  return content
}
