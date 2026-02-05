'use client'

import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  position?: 'center' | 'right'
}

export function Modal({ isOpen, onClose, title, children, position = 'center' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed z-50 ${
          position === 'right'
            ? 'top-0 right-0 h-full w-full max-w-md animate-slide-in-right'
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg animate-fade-in'
        }`}
      >
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-2xl overflow-hidden h-full flex flex-col">
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
              <button
                onClick={onClose}
                className="text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
