import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  onClick?: () => void
}

export function Card({ children, className = '', title, onClick }: CardProps) {
  return (
    <div
      className={`gradient-border p-6 ${onClick ? 'cursor-pointer hover:shadow-lg hover:shadow-[var(--gradient-start)]/10 transition-all' : ''} ${className}`}
      onClick={onClick}
    >
      {title && <h2 className="text-xl font-bold mb-4 text-[var(--foreground)]">{title}</h2>}
      {children}
    </div>
  )
}
