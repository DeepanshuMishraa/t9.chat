import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Thread = { id: string; title: string; createdAt: number }

type Pending = { threadId: string; text: string; model: string } | null

type ChatThreadsStore = {
  threads: Thread[]
  addThread: (t: Thread) => void
  pending: Pending
  setPending: (p: Pending) => void
}

export const useChatThreadsStore = create<ChatThreadsStore>()(
  persist(
    (set) => ({
      threads: [],
      addThread: (t) => set((s) => ({ threads: [t, ...s.threads] })),
      pending: null,
      setPending: (p) => set({ pending: p }),
    }),
    { name: 'chat-threads' }
  )
)
