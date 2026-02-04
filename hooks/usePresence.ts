'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePresenceStore } from '@/stores/presenceStore'
import { getRandomColor } from '@/lib/utils'
import type { UserPresence } from '@/types'

export function usePresence(meetingId: string, userName: string) {
  const supabase = createClient()
  const { presences, setPresences, updateMyPresence } = usePresenceStore()
  const [userId] = useState(() => crypto.randomUUID())
  const [userColor] = useState(() => getRandomColor())

  useEffect(() => {
    if (!meetingId || !userName) return

    const channel = supabase.channel(`presence-${meetingId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users: UserPresence[] = []

        Object.entries(state).forEach(([key, value]) => {
          const presence = (value as any)[0]
          users.push({
            id: key,
            name: presence.name,
            section: presence.section,
            field: presence.field,
            color: presence.color,
          })
        })

        setPresences(users)
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('User joined:', key)
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('User left:', key)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // 自分のプレゼンスを送信
          await channel.track({
            name: userName,
            section: 'agenda',
            color: userColor,
          })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [meetingId, userName, userId, userColor])

  // 自分の現在地を更新
  const updateSection = async (section: string, field?: string) => {
    const channel = supabase.channel(`presence-${meetingId}`)
    await channel.track({
      name: userName,
      section,
      field,
      color: userColor,
    })
    updateMyPresence({ section, field })
  }

  return { presences, updateSection }
}
