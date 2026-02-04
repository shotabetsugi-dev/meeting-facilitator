'use client'

import { PresenceIndicator } from './PresenceIndicator'

interface HeaderProps {
  meetingId?: string
  userName?: string
  meetingDate?: string
}

export function Header({ meetingId, userName, meetingDate }: HeaderProps) {
  return (
    <header className="border-b border-[var(--card-border)] px-6 py-4 bg-[var(--card-bg)]/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            <span className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-middle)] to-[var(--gradient-end)] bg-clip-text text-transparent">
              Lays-Lop
            </span>
            <span className="text-[var(--accent-blue)]"> Internal meeting</span>
          </h1>
          {meetingDate && (
            <p className="text-sm text-[var(--foreground)]/60 mt-1">{meetingDate}</p>
          )}
        </div>
        {meetingId && userName && (
          <PresenceIndicator meetingId={meetingId} userName={userName} />
        )}
      </div>
    </header>
  )
}
