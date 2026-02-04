'use client'

interface Tab {
  id: string
  label: string
}

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

const tabs: Tab[] = [
  { id: 'agenda', label: 'Agenda' },
  { id: 'sales', label: 'Sales' },
  { id: 'dev', label: 'Dev' },
  { id: 'announce', label: 'アナウンス' },
  { id: 'free', label: 'Free議題' },
  { id: 'debate', label: 'ディベート' },
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-[var(--card-border)]">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
              activeTab === tab.id
                ? 'border-[var(--accent-blue)] text-[var(--accent-blue)]'
                : 'border-transparent text-[var(--foreground)]/50 hover:text-[var(--accent-purple)] hover:border-[var(--accent-purple)]/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
