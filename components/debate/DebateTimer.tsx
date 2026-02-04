'use client'

import { useTimer } from '@/hooks/useTimer'
import { formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'

interface DebateTimerProps {
  meetingId: string
  debateId: string | null
}

export function DebateTimer({ meetingId, debateId }: DebateTimerProps) {
  const { timerState, startTimer, stopTimer, addOneMinute, setDuration } =
    useTimer(meetingId, debateId)
  const [customMinutes, setCustomMinutes] = useState(5)

  const progress =
    timerState.totalDuration && timerState.totalDuration > 0
      ? (timerState.remaining / timerState.totalDuration) * 100
      : 100

  const isWarning = timerState.remaining <= 60 && timerState.remaining > 10
  const isDanger = timerState.remaining <= 10 && timerState.remaining > 0

  return (
    <Card title="ディベートタイマー">
      {/* タイマー表示 */}
      <div className="text-center mb-6">
        <div
          className={`text-6xl font-mono font-bold ${
            isDanger
              ? 'text-red-500 animate-pulse'
              : isWarning
              ? 'text-yellow-500'
              : 'text-gray-900'
          }`}
        >
          {formatTime(timerState.remaining)}
        </div>

        {/* プログレスバー */}
        <div className="h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isDanger
                ? 'bg-red-500'
                : isWarning
                ? 'bg-yellow-500'
                : 'bg-teal-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* プリセットボタン */}
      <div className="flex gap-2 mb-4 justify-center flex-wrap">
        {[5, 3, 1].map((min) => (
          <Button
            key={min}
            variant="secondary"
            size="sm"
            onClick={() => setDuration(min)}
            disabled={timerState.status === 'running'}
          >
            {min}分
          </Button>
        ))}
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            min={1}
            max={30}
            value={customMinutes}
            onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 5)}
            disabled={timerState.status === 'running'}
            className="w-20 text-center"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDuration(customMinutes)}
            disabled={timerState.status === 'running'}
          >
            設定
          </Button>
        </div>
      </div>

      {/* コントロールボタン */}
      <div className="flex gap-2 justify-center">
        {timerState.status !== 'running' ? (
          <Button
            onClick={() => startTimer((timerState.totalDuration || 300) / 60)}
            className="flex-1"
          >
            ▶ 開始
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={addOneMinute}>
              +1分
            </Button>
            <Button variant="danger" onClick={stopTimer} className="flex-1">
              終了
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
