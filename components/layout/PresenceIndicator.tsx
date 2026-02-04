'use client'

import { usePresence } from '@/hooks/usePresence'

interface PresenceIndicatorProps {
  meetingId: string
  userName: string
}

export function PresenceIndicator({ meetingId, userName }: PresenceIndicatorProps) {
  const { presences } = usePresence(meetingId, userName)

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--foreground)]/60">参加中:</span>
      <div className="flex -space-x-2">
        {presences.map((user) => (
          <div key={user.id} className="relative group">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-[var(--card-border)]"
              style={{ backgroundColor: user.color }}
            >
              {user.name.charAt(0)}
            </div>

            {/* ツールチップ */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {user.name}
              {user.section && ` - ${user.section}`}
            </div>

            {/* 編集中インジケーター */}
            {user.field && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--accent-green)] rounded-full border border-[var(--card-border)] animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
