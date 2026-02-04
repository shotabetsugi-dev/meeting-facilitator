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
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
