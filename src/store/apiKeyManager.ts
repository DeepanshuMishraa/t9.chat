import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const PROVIDERS = ["google", "openrouter", "openai"] as const;
export type Provider = (typeof PROVIDERS)[number];

export type ApiKeyManagerState = {
  apiKeys: Record<Provider, string>;
  isLoading: boolean;
  error: string | null;
  setApiKey: (provider: Provider, key: string) => void;
  getApiKey: (provider: Provider) => string | undefined;
  removeApiKey: (provider: Provider) => void;
  hasApiKey: (provider: Provider) => boolean;
  clearAllApiKeys: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
};

export const useApiKeyStore = create<ApiKeyManagerState>()(
  persist(
    (set, get) => ({
      apiKeys: {} as Record<Provider, string>,
      isLoading: false,
      error: null,

      setApiKey: (provider, key) => {
        try {
          set((state) => ({
            apiKeys: { ...state.apiKeys, [provider]: key },
            error: null,
          }));
        } catch (error) {
          set({ error: 'Failed to set API key' });
        }
      },

      getApiKey: (provider) => {
        return get().apiKeys[provider];
      },

      removeApiKey: (provider) => {
        try {
          set((state) => {
            const { [provider]: _, ...rest } = state.apiKeys;
            return { apiKeys: rest as Record<Provider, string>, error: null };
          });
        } catch (error) {
          set({ error: 'Failed to remove API key' });
        }
      },
      hasApiKey: (provider) => {
        const key = get().apiKeys[provider];
        return !!key && key.trim().length > 0;
      },
      clearAllApiKeys: () => {
        set({ apiKeys: {} as Record<Provider, string>, error: null });
      },
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'api-key-storage',
      partialize: (state) => ({ apiKeys: state.apiKeys }),
    }
  )
);
