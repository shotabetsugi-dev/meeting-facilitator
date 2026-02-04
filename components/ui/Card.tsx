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
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
      onClick={onClick}
    >
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      {children}
    </div>
  )
}
