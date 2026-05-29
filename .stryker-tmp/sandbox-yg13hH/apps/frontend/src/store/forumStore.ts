import { create } from 'zustand';

interface VoteEntry {
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
}

interface ForumStore {
  votes: Record<string, VoteEntry>;
  setVote: (id: string, entry: VoteEntry) => void;
  getVote: (id: string, defaults: VoteEntry) => VoteEntry;
}

export const useForumStore = create<ForumStore>((set, get) => ({
  votes: {},
  setVote: (id, entry) =>
    set((state) => ({ votes: { ...state.votes, [id]: entry } })),
  getVote: (id, defaults) => get().votes[id] ?? defaults,
}));
