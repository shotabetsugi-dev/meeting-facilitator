import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent placeholder:text-[var(--foreground)]/30 resize-none ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
