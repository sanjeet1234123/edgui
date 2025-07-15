// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { useModelStore } from '@/store/modelStore'

describe('useModelStore', () => {
  const mockModel = {
    id: 'model-1',
    model_name: 'Test Model',
    description: 'A test model',
    provider: 'openai',
    type: 'llm',
    status: 'active',
    created_at: '2025-05-28T00:00:00Z',
    updated_at: '2025-05-28T00:00:00Z',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    hf_model_name: 'hf/test-model',
    is_fallback: false,
    fallback_of: null,
    fallback_priority: null,
    fallback_enabled: false,
    fallback_status: null,
    fallback_reason: null,
    fallback_updated_at: null,
    fallback_created_at: null,
    fallback_model_id: null,
    fallback_model_name: null,
    fallback_provider: null,
    fallback_type: null,
    fallback_status_reason: null,
    fallback_status_updated_at: null,
    fallback_status_created_at: null,
    fallback_status_model_id: null,
    fallback_status_model_name: null,
    fallback_status_provider: null,
    fallback_status_type: null,
    fallback_status_fallback_of: null,
    fallback_status_fallback_priority: null,
    fallback_status_fallback_enabled: null,
    fallback_status_fallback_status: null,
    fallback_status_fallback_reason: null,
    fallback_status_fallback_updated_at: null,
    fallback_status_fallback_created_at: null,
    fallback_status_fallback_model_id: null,
    fallback_status_fallback_model_name: null,
    fallback_status_fallback_provider: null,
    fallback_status_fallback_type: null,
    fallback_status_fallback_status_reason: null,
    fallback_status_fallback_status_updated_at: null,
    fallback_status_fallback_status_created_at: null,
    fallback_status_fallback_status_model_id: null,
    fallback_status_fallback_status_model_name: null,
    fallback_status_fallback_status_provider: null,
    fallback_status_fallback_status_type: null,
    fallback_status_fallback_status_fallback_of: null,
    fallback_status_fallback_status_fallback_priority: null,
    fallback_status_fallback_status_fallback_enabled: null,
    fallback_status_fallback_status_fallback_status: null,
    fallback_status_fallback_status_fallback_reason: null,
    fallback_status_fallback_status_fallback_updated_at: null,
    fallback_status_fallback_status_fallback_created_at: null,
    fallback_status_fallback_status_fallback_model_id: null,
    fallback_status_fallback_status_fallback_model_name: null,
    fallback_status_fallback_status_fallback_provider: null,
    fallback_status_fallback_status_fallback_type: null,
  }

  beforeEach(() => {
    localStorage.clear()
    useModelStore.setState({
      currentModel: null,
      ingressUrl: null,
      selectedModelCategory: '',
      searchedModel: null,
      filters: null,
      viewMode: 'grid',
    })
  })

  it('should have initial state', () => {
    const state = useModelStore.getState()
    expect(state.currentModel).toBeNull()
    expect(state.ingressUrl).toBeNull()
    expect(state.selectedModelCategory).toBe('')
    expect(state.searchedModel).toBeNull()
    expect(state.filters).toBeNull()
    expect(state.viewMode).toBe('grid')
  })

  it('should set currentModel', () => {
    useModelStore.getState().setCurrentModel(mockModel)
    expect(useModelStore.getState().currentModel).toEqual(mockModel)
  })

  it('should set ingressUrl', () => {
    useModelStore.getState().setIngressUrl('http://test-ingress')
    expect(useModelStore.getState().ingressUrl).toBe('http://test-ingress')
  })

  it('should set selectedModelCategory', () => {
    useModelStore.getState().setSelectedModelCategory('llm')
    expect(useModelStore.getState().selectedModelCategory).toBe('llm')
  })

  it('should set searchedModel', () => {
    useModelStore.getState().setSearchModel('test model')
    expect(useModelStore.getState().searchedModel).toBe('test model')
  })

  it('should set viewMode', () => {
    useModelStore.getState().setViewMode('list')
    expect(useModelStore.getState().viewMode).toBe('list')
  })

  it('should set filters', () => {
    const mockFilters = {
      safety: 'high',
      hardware: 'gpu',
    }
    useModelStore.getState().setFilters(mockFilters)
    expect(useModelStore.getState().filters).toEqual(mockFilters)
  })

  it('should persist all state properties to localStorage', () => {
    const mockFilters = {
      safety: 'medium',
      hardware: 'cpu',
    }

    useModelStore.getState().setSelectedModelCategory('vlm')
    useModelStore.getState().setSearchModel('search term')
    useModelStore.getState().setViewMode('table')
    useModelStore.getState().setFilters(mockFilters)
    useModelStore.getState().setCurrentModel(mockModel)
    useModelStore.getState().setIngressUrl('http://test-url')

    const persisted = JSON.parse(localStorage.getItem('model-storage'))
    expect(persisted.state.selectedModelCategory).toBe('vlm')
    expect(persisted.state.searchedModel).toBe('search term')
    expect(persisted.state.viewMode).toBe('table')
    expect(persisted.state.filters).toEqual(mockFilters)
    expect(persisted.state.currentModel).toEqual(mockModel)
    expect(persisted.state.ingressUrl).toBe('http://test-url')
  })

  it('should update currentModel independently of ingressUrl', () => {
    useModelStore.getState().setIngressUrl('http://url1')
    useModelStore.getState().setCurrentModel(mockModel)
    expect(useModelStore.getState().ingressUrl).toBe('http://url1')
    expect(useModelStore.getState().currentModel).toEqual(mockModel)
  })

  it('should update ingressUrl independently of currentModel', () => {
    useModelStore.getState().setCurrentModel(mockModel)
    useModelStore.getState().setIngressUrl('http://url2')
    expect(useModelStore.getState().currentModel).toEqual(mockModel)
    expect(useModelStore.getState().ingressUrl).toBe('http://url2')
  })
})
