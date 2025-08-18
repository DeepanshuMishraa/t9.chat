import { create, Mutate, StoreApi } from 'zustand';
import { persist } from 'zustand/middleware';

export const PROVIDERS = ['google', 'openrouter', 'openai', 'groq'] as const;
export type Provider = (typeof PROVIDERS)[number];

type APIKeys = Record<Provider, string>;

type APIKeyStore = {
  keys: APIKeys;
  setKeys: (newKeys: Partial<APIKeys>) => void;
  hasRequiredKeys: () => boolean;
  getKey: (provider: Provider) => string | null;
};

type StoreWithPersist = Mutate<
  StoreApi<APIKeyStore>,
  [['zustand/persist', { keys: APIKeys }]]
>;

export const withStorageDOMEvents = (store: StoreWithPersist) => {
  if (typeof window === 'undefined') return () => {};
  
  const storageEventCallback = (e: StorageEvent) => {
    if (e.key === store.persist.getOptions().name && e.newValue) {
      store.persist.rehydrate();
    }
  };

  window.addEventListener('storage', storageEventCallback);

  return () => {
    window.removeEventListener('storage', storageEventCallback);
  };
};

export const useApiKeyStore = create<APIKeyStore>()(
  persist(
    (set, get) => ({
      keys: {
        google: '',
        openrouter: '',
        openai: '',
        groq: '',
      },

      setKeys: (newKeys) => {
        set((state) => ({
          keys: { ...state.keys, ...newKeys },
        }));
      },

      hasRequiredKeys: () => {
        const keys = get().keys;
        return !!(keys.google || keys.openai || keys.groq || keys.openrouter);
      },

      getKey: (provider) => {
        const key = get().keys[provider];
        return key ? key : null;
      },
    }),
    {
      name: 'api-keys',
      partialize: (state) => ({ keys: state.keys }),
    }
  )
);

withStorageDOMEvents(useApiKeyStore);