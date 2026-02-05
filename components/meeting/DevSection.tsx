'use client'

import { useMeetingStore } from '@/stores/meetingStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { DevProject, Meeting } from '@/types'
import { useState, useEffect, useRef } from 'react'

interface DevSectionProps {
  meetingId: string
  meeting?: Meeting
}

export function DevSection({ meetingId, meeting }: DevSectionProps) {
  const { devProjects } = useMeetingStore()
  const supabase = createClient()
  const [newProject, setNewProject] = useState({ name: '', type: 'client' as 'client' | 'internal' })
  const [localProjects, setLocalProjects] = useState<DevProject[]>([])
  const updateTimers = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const isDraftMode = !meeting || meeting.status === 'draft'

  useEffect(() => {
    setLocalProjects(devProjects)
  }, [devProjects])

  const clientProjects = localProjects.filter((p) => p.project_type === 'client')
  const internalProjects = localProjects.filter((p) => p.project_type === 'internal')

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

  const updateProject = (
    id: string,
    field: keyof DevProject,
    value: string
  ) => {
    // Optimistic update
    setLocalProjects(prev =>
      prev.map(project =>
        project.id === id ? { ...project, [field]: value } : project
      )
    )

    // Clear existing timer
    const timerKey = `${id}-${field}`
    if (updateTimers.current[timerKey]) {
      clearTimeout(updateTimers.current[timerKey])
    }

    // Debounced Supabase update
    updateTimers.current[timerKey] = setTimeout(async () => {
      await supabase
        .from('dev_projects')
        .update({ [field]: value })
        .eq('id', id)

      delete updateTimers.current[timerKey]
    }, 500)
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
                {isDraftMode ? (
                  <Input
                    value={project.project_name}
                    onChange={(e) =>
                      updateProject(project.id, 'project_name', e.target.value)
                    }
                  />
                ) : (
                  <div className="text-[var(--foreground)] font-semibold">
                    {project.project_name}
                  </div>
                )}
              </td>
              <td className="py-2 px-4">
                {isDraftMode ? (
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
                ) : (
                  <div className="text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.signal === 'インシデント'
                        ? 'bg-red-500/20 text-red-400'
                        : project.signal === '要調整'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {project.signal}
                    </span>
                  </div>
                )}
              </td>
              <td className="py-2 px-4">
                {isDraftMode ? (
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
                ) : (
                  <div className="text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.temperature === '良好'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {project.temperature}
                    </span>
                  </div>
                )}
              </td>
              <td className="py-2 px-4">
                {isDraftMode ? (
                  <Input
                    value={project.status_text || ''}
                    onChange={(e) =>
                      updateProject(project.id, 'status_text', e.target.value)
                    }
                    placeholder="状況"
                  />
                ) : (
                  <div className="text-[var(--foreground)]/80">
                    {project.status_text || '未設定'}
                  </div>
                )}
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

      {/* 新規案件追加（事前入力モードのみ） */}
      {isDraftMode && (
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
      )}
    </div>
  )
}
