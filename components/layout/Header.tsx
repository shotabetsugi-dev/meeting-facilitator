'use client'

import { PresenceIndicator } from './PresenceIndicator'

interface HeaderProps {
  meetingId?: string
  userName?: string
  meetingDate?: string
}

export function Header({ meetingId, userName, meetingDate }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            社内定例会議 AIファシリテーター
          </h1>
          {meetingDate && (
            <p className="text-sm text-gray-500 mt-1">{meetingDate}</p>
          )}
        </div>
        {meetingId && userName && (
          <PresenceIndicator meetingId={meetingId} userName={userName} />
        )}
      </div>
    </header>
  )
}
