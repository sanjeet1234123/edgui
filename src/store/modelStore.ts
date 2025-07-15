import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Model } from '@/types/marketplaceType'

interface Filter {
  safety: string | null
  hardware: string | null
}

type ModelStore = {
  selectedModelCategory: string
  setSelectedModelCategory: (category: string) => void
  currentModel: Model | null
  ingressUrl: string | null
  searchedModel: string | null
  filters: Filter | null
  viewMode: string
  setSearchModel: (modelName: string) => void
  setCurrentModel: (model: Model) => void
  setIngressUrl: (ingressUrl: string) => void
  setFilters: (filters: Filter) => void
  setViewMode: (viewMode: string) => void // Remove the optional modifier
}

export const useModelStore = create<ModelStore>()(
  persist(
    set => ({
      selectedModelCategory: '',
      currentModel: null,
      ingressUrl: null,
      searchedModel: null,
      filters: null,
      viewMode: 'grid', // Default view mode
      setViewMode: (viewMode: string) => set({ viewMode }),
      setSearchModel: (modelName: string) => set({ searchedModel: modelName }),
      setCurrentModel: (model: Model) => set({ currentModel: model }),
      setIngressUrl: (ingressUrl: string) => set({ ingressUrl }),
      setFilters: (filters: Filter) => set({ filters }),
      setSelectedModelCategory: (category: string) =>
        set({ selectedModelCategory: category }),
    }),
    {
      name: 'model-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
