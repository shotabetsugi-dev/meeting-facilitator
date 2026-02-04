'use client'

import { useEffect, useState } from 'react'
import { useMeetingStore } from '@/stores/meetingStore'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { SalesChannel, SalesStatus } from '@/types'

interface SalesSectionProps {
  meetingId: string
}

export function SalesSection({ meetingId }: SalesSectionProps) {
  const { salesMetrics, salesStatus } = useMeetingStore()
  const supabase = createClient()
  const [channels, setChannels] = useState<SalesChannel[]>([])
  const [newCompany, setNewCompany] = useState('')

  useEffect(() => {
    fetchChannels()
  }, [])

  const fetchChannels = async () => {
    const { data } = await supabase
      .from('sales_channels')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (data) setChannels(data)
  }

  const updateMetric = async (
    channelId: string,
    field: 'leads_count' | 'appointments_count' | 'contracts_count',
    value: number
  ) => {
    const metric = salesMetrics.find((m) => m.channel_id === channelId)
    if (metric) {
      await supabase
        .from('sales_metrics')
        .update({ [field]: value })
        .eq('id', metric.id)
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

  const updateSalesStatus = async (
    id: string,
    field: keyof SalesStatus,
    value: string
  ) => {
    await supabase
      .from('sales_status')
      .update({ [field]: value })
      .eq('id', id)
  }

  return (
    <div className="space-y-6">
      {/* 営業数値 */}
      <Card title="営業数値">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">媒体</th>
                <th className="text-center py-2 px-4">着手</th>
                <th className="text-center py-2 px-4">アポ</th>
                <th className="text-center py-2 px-4">成約</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel) => {
                const metric = salesMetrics.find((m) => m.channel_id === channel.id)
                return (
                  <tr key={channel.id} className="border-b">
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: channel.color }}
                        />
                        {channel.name}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <Input
                        type="number"
                        value={metric?.leads_count || 0}
                        onChange={(e) =>
                          updateMetric(
                            channel.id,
                            'leads_count',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="text-center"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <Input
                        type="number"
                        value={metric?.appointments_count || 0}
                        onChange={(e) =>
                          updateMetric(
                            channel.id,
                            'appointments_count',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="text-center"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <Input
                        type="number"
                        value={metric?.contracts_count || 0}
                        onChange={(e) =>
                          updateMetric(
                            channel.id,
                            'contracts_count',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="text-center"
                      />
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
          {salesStatus.map((status) => (
            <div key={status.id} className="border-b pb-4">
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
