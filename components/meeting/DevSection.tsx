'use client'

import { useMeetingStore } from '@/stores/meetingStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { DevProject } from '@/types'
import { useState } from 'react'

interface DevSectionProps {
  meetingId: string
}

export function DevSection({ meetingId }: DevSectionProps) {
  const { devProjects } = useMeetingStore()
  const supabase = createClient()
  const [newProject, setNewProject] = useState({ name: '', type: 'client' as 'client' | 'internal' })

  const clientProjects = devProjects.filter((p) => p.project_type === 'client')
  const internalProjects = devProjects.filter((p) => p.project_type === 'internal')

  const addProject = async () => {
    if (!newProject.name) return

    await supabase.from('dev_projects').insert({
      meeting_id: meetingId,
      project_name: newProject.name,
      project_type: newProject.type,
      signal: '順調',
      temperature: '良好',
      sort_order: devProjects.length,
    })

    setNewProject({ name: '', type: 'client' })
  }

  const updateProject = async (
    id: string,
    field: keyof DevProject,
    value: string
  ) => {
    await supabase
      .from('dev_projects')
      .update({ [field]: value })
      .eq('id', id)
  }

  const renderProjectTable = (projects: DevProject[]) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--card-border)]">
            <th className="text-left py-2 px-4 text-[var(--foreground)]">案件名</th>
            <th className="text-center py-2 px-4 text-[var(--foreground)]">シグナル</th>
            <th className="text-center py-2 px-4 text-[var(--foreground)]">温度</th>
            <th className="text-left py-2 px-4 text-[var(--foreground)]">状況</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b border-[var(--card-border)]">
              <td className="py-2 px-4">
                <Input
                  value={project.project_name}
                  onChange={(e) =>
                    updateProject(project.id, 'project_name', e.target.value)
                  }
                />
              </td>
              <td className="py-2 px-4">
                <select
                  value={project.signal}
                  onChange={(e) =>
                    updateProject(project.id, 'signal', e.target.value)
                  }
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                >
                  <option value="順調">順調</option>
                  <option value="要調整">要調整</option>
                  <option value="インシデント">インシデント</option>
                </select>
              </td>
              <td className="py-2 px-4">
                <select
                  value={project.temperature}
                  onChange={(e) =>
                    updateProject(project.id, 'temperature', e.target.value)
                  }
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                >
                  <option value="良好">良好</option>
                  <option value="普通">普通</option>
                </select>
              </td>
              <td className="py-2 px-4">
                <Input
                  value={project.status_text || ''}
                  onChange={(e) =>
                    updateProject(project.id, 'status_text', e.target.value)
                  }
                  placeholder="状況"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 受託開発 */}
      <Card title="受託開発">{renderProjectTable(clientProjects)}</Card>

      {/* 内部開発 */}
      <Card title="内部開発">{renderProjectTable(internalProjects)}</Card>

      {/* 新規案件追加 */}
      <Card title="案件を追加">
        <div className="space-y-4">
          <Input
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="案件名"
          />
          <select
            value={newProject.type}
            onChange={(e) =>
              setNewProject({
                ...newProject,
                type: e.target.value as 'client' | 'internal',
              })
            }
            className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
          >
            <option value="client">受託開発</option>
            <option value="internal">内部開発</option>
          </select>
          <Button onClick={addProject} disabled={!newProject.name}>
            案件を追加
          </Button>
        </div>
      </Card>
    </div>
  )
}
