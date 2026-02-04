import { create } from 'zustand'
import type {
  Meeting,
  Agenda,
  SalesMetric,
  SalesStatus,
  DevProject,
  Announcement,
  FreeTopic,
  Debate,
} from '@/types'

interface MeetingStore {
  // Current meeting
  currentMeeting: Meeting | null
  setCurrentMeeting: (meeting: Meeting | null) => void

  // Agendas
  agendas: Agenda[]
  setAgendas: (agendas: Agenda[]) => void
  addAgenda: (agenda: Agenda) => void
  updateAgenda: (id: string, updates: Partial<Agenda>) => void
  removeAgenda: (id: string) => void

  // Sales metrics
  salesMetrics: SalesMetric[]
  setSalesMetrics: (metrics: SalesMetric[]) => void
  updateSalesMetric: (id: string, updates: Partial<SalesMetric>) => void

  // Sales status
  salesStatus: SalesStatus[]
  setSalesStatus: (status: SalesStatus[]) => void
  addSalesStatus: (status: SalesStatus) => void
  updateSalesStatus: (id: string, updates: Partial<SalesStatus>) => void
  removeSalesStatus: (id: string) => void

  // Dev projects
  devProjects: DevProject[]
  setDevProjects: (projects: DevProject[]) => void
  addDevProject: (project: DevProject) => void
  updateDevProject: (id: string, updates: Partial<DevProject>) => void
  removeDevProject: (id: string) => void

  // Announcement
  announcement: Announcement | null
  setAnnouncement: (announcement: Announcement | null) => void

  // Free topics
  freeTopics: FreeTopic[]
  setFreeTopics: (topics: FreeTopic[]) => void
  addFreeTopic: (topic: FreeTopic) => void
  updateFreeTopic: (id: string, updates: Partial<FreeTopic>) => void
  removeFreeTopic: (id: string) => void

  // Debate
  debate: Debate | null
  setDebate: (debate: Debate | null) => void
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  // Current meeting
  currentMeeting: null,
  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),

  // Agendas
  agendas: [],
  setAgendas: (agendas) => set({ agendas }),
  addAgenda: (agenda) =>
    set((state) => ({ agendas: [...state.agendas, agenda] })),
  updateAgenda: (id, updates) =>
    set((state) => ({
      agendas: state.agendas.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  removeAgenda: (id) =>
    set((state) => ({
      agendas: state.agendas.filter((a) => a.id !== id),
    })),

  // Sales metrics
  salesMetrics: [],
  setSalesMetrics: (metrics) => set({ salesMetrics: metrics }),
  updateSalesMetric: (id, updates) =>
    set((state) => ({
      salesMetrics: state.salesMetrics.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  // Sales status
  salesStatus: [],
  setSalesStatus: (status) => set({ salesStatus: status }),
  addSalesStatus: (status) =>
    set((state) => ({ salesStatus: [...state.salesStatus, status] })),
  updateSalesStatus: (id, updates) =>
    set((state) => ({
      salesStatus: state.salesStatus.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
  removeSalesStatus: (id) =>
    set((state) => ({
      salesStatus: state.salesStatus.filter((s) => s.id !== id),
    })),

  // Dev projects
  devProjects: [],
  setDevProjects: (projects) => set({ devProjects: projects }),
  addDevProject: (project) =>
    set((state) => ({ devProjects: [...state.devProjects, project] })),
  updateDevProject: (id, updates) =>
    set((state) => ({
      devProjects: state.devProjects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  removeDevProject: (id) =>
    set((state) => ({
      devProjects: state.devProjects.filter((p) => p.id !== id),
    })),

  // Announcement
  announcement: null,
  setAnnouncement: (announcement) => set({ announcement }),

  // Free topics
  freeTopics: [],
  setFreeTopics: (topics) => set({ freeTopics: topics }),
  addFreeTopic: (topic) =>
    set((state) => ({ freeTopics: [...state.freeTopics, topic] })),
  updateFreeTopic: (id, updates) =>
    set((state) => ({
      freeTopics: state.freeTopics.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  removeFreeTopic: (id) =>
    set((state) => ({
      freeTopics: state.freeTopics.filter((t) => t.id !== id),
    })),

  // Debate
  debate: null,
  setDebate: (debate) => set({ debate }),
}))
