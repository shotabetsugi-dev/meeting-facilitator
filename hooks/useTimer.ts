'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTimerStore } from '@/stores/timerStore'
import type { TimerState } from '@/types'

export function useTimer(meetingId: string, debateId: string | null) {
  const supabase = createClient()
  const { timerState, setTimerState } = useTimerStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // DBからタイマー状態を同期
  useEffect(() => {
    if (!debateId) return

    const channel = supabase
      .channel('timer-sync')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'debates',
          filter: `id=eq.${debateId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).timer_state) {
            setTimerState((payload.new as any).timer_state as TimerState)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [debateId])

  // ローカルでタイマーを動かす
  useEffect(() => {
    if (timerState.status === 'running') {
      intervalRef.current = setInterval(() => {
        setTimerState((prev) => {
          if (prev.remaining <= 0) {
            // タイマー終了
            if (debateId) {
              stopTimer()
            }
            return { ...prev, remaining: 0, status: 'stopped' }
          }
          return { ...prev, remaining: prev.remaining - 1 }
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState.status])

  // タイマー操作（DBに書き込んで全員に同期）
  const startTimer = useCallback(
    async (durationMinutes: number) => {
      if (!debateId) return

      const newState: TimerState = {
        status: 'running',
        remaining: durationMinutes * 60,
        totalDuration: durationMinutes * 60,
        startedAt: new Date().toISOString(),
      }

      await supabase
        .from('debates')
        .update({ timer_state: newState, duration_minutes: durationMinutes })
        .eq('id', debateId)
    },
    [debateId]
  )

  const stopTimer = useCallback(async () => {
    if (!debateId) return

    const newState: TimerState = {
      status: 'stopped',
      remaining: 0,
      totalDuration: timerState.totalDuration || 300,
    }

    await supabase
      .from('debates')
      .update({ timer_state: newState })
      .eq('id', debateId)
  }, [debateId, timerState.totalDuration])

  const addOneMinute = useCallback(async () => {
    if (!debateId) return

    const newState: TimerState = {
      ...timerState,
      remaining: timerState.remaining + 60,
      totalDuration: (timerState.totalDuration || 0) + 60,
    }

    await supabase
      .from('debates')
      .update({ timer_state: newState })
      .eq('id', debateId)
  }, [debateId, timerState])

  const setDuration = useCallback(
    async (minutes: number) => {
      if (!debateId) return

      const newState: TimerState = {
        status: 'stopped',
        remaining: minutes * 60,
        totalDuration: minutes * 60,
      }

      await supabase
        .from('debates')
        .update({ timer_state: newState, duration_minutes: minutes })
        .eq('id', debateId)
    },
    [debateId]
  )

  return {
    timerState,
    startTimer,
    stopTimer,
    addOneMinute,
    setDuration,
  }
}
