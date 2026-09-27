import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  address: string | null;
  /** Native XLM balance string */
  balance: string | null;
  /** BST token balance string — kept in the store so any component can read it */
  bstBalance: string | null;
  /**
   * Incrementing counter. Bump this to trigger a silent re-fetch of the BST
   * balance in any component that uses it as a SWR key.
   *
   * Usage:
   *   useWalletStore.getState().refreshBstBalance()
   *   // or inside a component:
   *   const { refreshBstBalance } = useWalletStore()
   */
  bstBalanceRefreshKey: number;
  isConnecting: boolean;
  error: string | null;
  balanceError: boolean;
  setAddress: (address: string | null) => void;
  setBalance: (balance: string | null) => void;
  setBstBalance: (bstBalance: string | null) => void;
  refreshBstBalance: () => void;
  setIsConnecting: (v: boolean) => void;
  setError: (error: string | null) => void;
  setBalanceError: (v: boolean) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      balance: null,
      bstBalance: null,
      bstBalanceRefreshKey: 0,
      isConnecting: false,
      error: null,
      balanceError: false,
      setAddress: (address) => set({ address }),
      setBalance: (balance) => set({ balance }),
      setBstBalance: (bstBalance) => set({ bstBalance }),
      /** Increment the key so SWR re-validates the BST balance fetch */
      refreshBstBalance: () =>
        set((s) => ({ bstBalanceRefreshKey: s.bstBalanceRefreshKey + 1 })),
      setIsConnecting: (isConnecting) => set({ isConnecting }),
      setError: (error) => set({ error }),
      setBalanceError: (balanceError) => set({ balanceError }),
      disconnect: () =>
        set({
          address: null,
          balance: null,
          bstBalance: null,
          bstBalanceRefreshKey: 0,
          error: null,
          balanceError: false,
        }),
    }),
    {
      name: 'wallet-storage',
      // Persist address, balance, and bstBalance across sessions
      partialize: (s) => ({
        address: s.address,
        balance: s.balance,
        bstBalance: s.bstBalance,
      }),
    }
  )
);
