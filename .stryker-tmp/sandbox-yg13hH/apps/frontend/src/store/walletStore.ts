import { create } from 'zustand';

interface WalletState {
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
  balanceError: boolean;
  setAddress: (address: string | null) => void;
  setBalance: (balance: string | null) => void;
  setIsConnecting: (v: boolean) => void;
  setError: (error: string | null) => void;
  setBalanceError: (v: boolean) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  balance: null,
  isConnecting: false,
  error: null,
  balanceError: false,
  setAddress: (address) => set({ address }),
  setBalance: (balance) => set({ balance }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setError: (error) => set({ error }),
  setBalanceError: (balanceError) => set({ balanceError }),
  disconnect: () => set({ address: null, balance: null, error: null, balanceError: false }),
}));
