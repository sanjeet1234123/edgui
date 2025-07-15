import { create } from 'zustand'

interface AddClusterStore {
  vms: Array<{ id: number; vm: string }>
  accountId: string
  setVMS: (vms: Array<{ id: number; vm: string }>) => void
  setAccountId: (accountId: string) => void
}

const useAddClusterStore = create<AddClusterStore>((set) => ({
  vms: [],
  accountId: '',
  setVMS: (vms: Array<{ id: number; vm: string }>) => set({ vms }),
  setAccountId: (accountId: string) => set({ accountId }),
}))

export default useAddClusterStore
