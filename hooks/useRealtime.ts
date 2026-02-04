'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMeetingStore } from '@/stores/meetingStore'
import type { Agenda, SalesMetric, SalesStatus, DevProject, Debate, Announcement, FreeTopic } from '@/types'

export function useRealtime(meetingId: string) {
  const supabase = createClient()
  const {
    setAgendas,
    setSalesMetrics,
    setSalesStatus,
    setDevProjects,
    setDebate,
    setAnnouncement,
    setFreeTopics,
  } = useMeetingStore()

  useEffect(() => {
    if (!meetingId) return

    // Initial data fetch
    fetchAllData()

    // Agendas のリアルタイム購読
    const agendasChannel = supabase
      .channel('agendas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendas',
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => {
          fetchAgendas()
        }
      )
      .subscribe()

    // Sales metrics のリアルタイム購読
    const salesMetricsChannel = supabase
      .channel('sales-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales_metrics',
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => {
          fetchSalesMetrics()
        }
      )
      .subscribe()

    // Sales status のリアルタイム購読
    const salesStatusChannel = supabase
      .channel('sales-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales_status',
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => {
          fetchSalesStatus()
        }
      )
      .subscribe()

    // Dev projects のリアルタイム購読
    const devChannel = supabase
      .channel('dev-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dev_projects',
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => {
          fetchDevProjects()
        }
      )
      .subscribe()

    // Debate のリアルタイム購読
    const debateChannel = supabase
      .channel('debate-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debates',
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          if (payload.new) {
            setDebate(payload.new as Debate)
          }
        }
      )
      .subscribe()

    // Announcements のリアルタイム購読
    const announcementsChannel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => {
          fetchAnnouncement()
        }
      )
      .subscribe()

    // Free topics のリアルタイム購読
    const freeTopicsChannel = supabase
      .channel('free-topics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'free_topics',
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => {
          fetchFreeTopics()
        }
      )
      .subscribe()

    // クリーンアップ
    return () => {
      supabase.removeChannel(agendasChannel)
      supabase.removeChannel(salesMetricsChannel)
      supabase.removeChannel(salesStatusChannel)
      supabase.removeChannel(devChannel)
      supabase.removeChannel(debateChannel)
      supabase.removeChannel(announcementsChannel)
      supabase.removeChannel(freeTopicsChannel)
    }
  }, [meetingId])

  // データ取得関数
  async function fetchAllData() {
    await Promise.all([
      fetchAgendas(),
      fetchSalesMetrics(),
      fetchSalesStatus(),
      fetchDevProjects(),
      fetchDebate(),
      fetchAnnouncement(),
      fetchFreeTopics(),
    ])
  }

  async function fetchAgendas() {
    const { data } = await supabase
      .from('agendas')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('sort_order')
    if (data) setAgendas(data as Agenda[])
  }

  async function fetchSalesMetrics() {
    const { data } = await supabase
      .from('sales_metrics')
      .select('*, sales_channels(*)')
      .eq('meeting_id', meetingId)
    if (data) setSalesMetrics(data as SalesMetric[])
  }

  async function fetchSalesStatus() {
    const { data } = await supabase
      .from('sales_status')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('sort_order')
    if (data) setSalesStatus(data as SalesStatus[])
  }

  async function fetchDevProjects() {
    const { data } = await supabase
      .from('dev_projects')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('sort_order')
    if (data) setDevProjects(data as DevProject[])
  }

  async function fetchDebate() {
    const { data } = await supabase
      .from('debates')
      .select('*')
      .eq('meeting_id', meetingId)
      .single()
    if (data) setDebate(data as Debate)
  }

  async function fetchAnnouncement() {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('meeting_id', meetingId)
      .single()
    if (data) setAnnouncement(data as Announcement)
  }

  async function fetchFreeTopics() {
    const { data } = await supabase
      .from('free_topics')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('sort_order')
    if (data) setFreeTopics(data as FreeTopic[])
  }

  return { fetchAllData }
}
