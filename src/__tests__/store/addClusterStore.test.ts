// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import useAddClusterStore from '@/store/addClusterStore'

describe('useAddClusterStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const { setVMS, setAccountId } = useAddClusterStore.getState()
    setVMS([])
    setAccountId('')
  })

  it('should have initial state', () => {
    const state = useAddClusterStore.getState()
    expect(state.vms).toEqual([])
    expect(state.accountId).toBe('')
  })

  it('should set VMS', () => {
    const vms = [
      { id: 1, vm: 'vm1' },
      { id: 2, vm: 'vm2' },
    ]
    useAddClusterStore.getState().setVMS(vms)
    expect(useAddClusterStore.getState().vms).toEqual(vms)
  })

  it('should set accountId', () => {
    useAddClusterStore.getState().setAccountId('abc123')
    expect(useAddClusterStore.getState().accountId).toBe('abc123')
  })

  it('should update VMS independently of accountId', () => {
    useAddClusterStore.getState().setAccountId('id1')
    useAddClusterStore.getState().setVMS([{ id: 3, vm: 'vm3' }])
    expect(useAddClusterStore.getState().accountId).toBe('id1')
    expect(useAddClusterStore.getState().vms).toEqual([{ id: 3, vm: 'vm3' }])
  })

  it('should update accountId independently of VMS', () => {
    useAddClusterStore.getState().setVMS([{ id: 4, vm: 'vm4' }])
    useAddClusterStore.getState().setAccountId('id2')
    expect(useAddClusterStore.getState().vms).toEqual([{ id: 4, vm: 'vm4' }])
    expect(useAddClusterStore.getState().accountId).toBe('id2')
  })
})
