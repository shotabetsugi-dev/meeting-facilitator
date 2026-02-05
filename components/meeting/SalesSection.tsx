'use client'

import { useEffect, useState, useRef } from 'react'
import { useMeetingStore } from '@/stores/meetingStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { SalesChannel, SalesStatus, SalesMetric, Meeting } from '@/types'

interface SalesSectionProps {
  meetingId: string
  meeting?: Meeting
}

export function SalesSection({ meetingId, meeting }: SalesSectionProps) {
  const { salesMetrics, salesStatus } = useMeetingStore()
  const supabase = createClient()
  const [channels, setChannels] = useState<SalesChannel[]>([])
  const [newCompany, setNewCompany] = useState('')
  const [localMetrics, setLocalMetrics] = useState<SalesMetric[]>([])
  const [localStatus, setLocalStatus] = useState<SalesStatus[]>([])
  const updateTimers = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const isDraftMode = !meeting || meeting.status === 'draft'

  useEffect(() => {
    fetchChannels()
  }, [])

  useEffect(() => {
    setLocalMetrics(salesMetrics)
  }, [salesMetrics])

  useEffect(() => {
    setLocalStatus(salesStatus)
  }, [salesStatus])

  const fetchChannels = async () => {
    const { data } = await supabase
      .from('sales_channels')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (data) setChannels(data)
  }

  const updateMetric = (
    channelId: string,
    field: 'leads_count' | 'appointments_count' | 'contracts_count',
    value: string
  ) => {
    // Allow empty string during editing
    const numValue = value === '' ? 0 : parseInt(value, 10)

    // Only update if it's a valid number or empty
    if (value === '' || !isNaN(numValue)) {
      // Optimistic update
      setLocalMetrics(prev =>
        prev.map(metric =>
          metric.channel_id === channelId ? { ...metric, [field]: numValue } : metric
        )
      )

      const metric = salesMetrics.find((m) => m.channel_id === channelId)
      if (!metric) return

      // Clear existing timer
      const timerKey = `${metric.id}-${field}`
      if (updateTimers.current[timerKey]) {
        clearTimeout(updateTimers.current[timerKey])
      }

      // Debounced Supabase update
      updateTimers.current[timerKey] = setTimeout(async () => {
        await supabase
          .from('sales_metrics')
          .update({ [field]: numValue })
          .eq('id', metric.id)

        delete updateTimers.current[timerKey]
      }, 500)
    }
  }

  const addSalesStatus = async () => {
    if (!newCompany) return

    await supabase.from('sales_status').insert({
      meeting_id: meetingId,
      company_name: newCompany,
      sort_order: salesStatus.length,
    })

    setNewCompany('')
  }

  const updateSalesStatus = (
    id: string,
    field: keyof SalesStatus,
    value: string
  ) => {
    // Optimistic update
    setLocalStatus(prev =>
      prev.map(status =>
        status.id === id ? { ...status, [field]: value } : status
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
        .from('sales_status')
        .update({ [field]: value })
        .eq('id', id)

      delete updateTimers.current[timerKey]
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* 営業数値 */}
      <Card title="営業数値">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-2 px-4 text-[var(--foreground)]">媒体</th>
                <th className="text-center py-2 px-4 text-[var(--foreground)]">着手</th>
                <th className="text-center py-2 px-4 text-[var(--foreground)]">アポ</th>
                <th className="text-center py-2 px-4 text-[var(--foreground)]">成約</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel) => {
                const metric = localMetrics.find((m) => m.channel_id === channel.id)
                return (
                  <tr key={channel.id} className="border-b border-[var(--card-border)]">
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: channel.color }}
                        />
                        <span className="text-[var(--foreground)]">{channel.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {isDraftMode ? (
                        <Input
                          type="number"
                          value={metric?.leads_count ?? ''}
                          onChange={(e) =>
                            updateMetric(
                              channel.id,
                              'leads_count',
                              e.target.value
                            )
                          }
                          className="text-center"
                          min="0"
                        />
                      ) : (
                        <div className="text-center text-[var(--foreground)] font-semibold">
                          {metric?.leads_count || 0}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {isDraftMode ? (
                        <Input
                          type="number"
                          value={metric?.appointments_count ?? ''}
                          onChange={(e) =>
                            updateMetric(
                              channel.id,
                              'appointments_count',
                              e.target.value
                            )
                          }
                          className="text-center"
                          min="0"
                        />
                      ) : (
                        <div className="text-center text-[var(--foreground)] font-semibold">
                          {metric?.appointments_count || 0}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {isDraftMode ? (
                        <Input
                          type="number"
                          value={metric?.contracts_count ?? ''}
                          onChange={(e) =>
                            updateMetric(
                              channel.id,
                              'contracts_count',
                              e.target.value
                            )
                          }
                          className="text-center"
                          min="0"
                        />
                      ) : (
                        <div className="text-center text-[var(--foreground)] font-semibold">
                          {metric?.contracts_count || 0}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 営業状況 */}
      <Card title="営業状況">
        <div className="space-y-4">
          {localStatus.map((status) => (
            <div key={status.id} className="border-b border-[var(--card-border)] pb-4">
              <Input
                value={status.company_name}
                onChange={(e) =>
                  updateSalesStatus(status.id, 'company_name', e.target.value)
                }
                placeholder="会社名"
                className="mb-2"
              />
              <Input
                value={status.status_text || ''}
                onChange={(e) =>
                  updateSalesStatus(status.id, 'status_text', e.target.value)
                }
                placeholder="状況"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              placeholder="新しい会社名"
              className="flex-1"
            />
            <Button onClick={addSalesStatus} disabled={!newCompany}>
              追加
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
