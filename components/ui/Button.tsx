import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-middle)] text-white hover:shadow-lg hover:shadow-[var(--gradient-start)]/20',
    secondary: 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[var(--accent-purple)]',
    danger: 'bg-red-500/90 text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/20',
    success: 'bg-[var(--accent-green)] text-white hover:shadow-lg hover:shadow-[var(--accent-green)]/20',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
