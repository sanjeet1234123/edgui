// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import { features, Feature } from '@/components/upcomingFeatures/constants'

describe('UpcomingFeatures Constants', () => {
  it('features should be defined', () => {
    expect(features).toBeDefined()
    expect(Array.isArray(features)).toBe(true)
  })

  it('features should not be empty', () => {
    expect(features.length).toBeGreaterThan(0)
  })

  it('each feature should have the required properties with correct types', () => {
    features.forEach((feature: Feature) => {
      expect(feature).toHaveProperty('title')
      expect(feature).toHaveProperty('description')
      expect(feature).toHaveProperty('status')
      expect(feature).toHaveProperty('eta')
      expect(feature).toHaveProperty('section')
      
      expect(typeof feature.title).toBe('string')
      expect(typeof feature.description).toBe('string')
      expect(typeof feature.status).toBe('string')
      expect(typeof feature.eta).toBe('string')
      expect(typeof feature.section).toBe('string')
      
      expect(feature.title.length).toBeGreaterThan(0)
      expect(feature.description.length).toBeGreaterThan(0)
      expect(feature.status.length).toBeGreaterThan(0)
      expect(feature.eta.length).toBeGreaterThan(0)
      expect(feature.section.length).toBeGreaterThan(0)
    })
  })

  it('should have valid status values', () => {
    const validStatuses = ['Coming Soon', 'In Development', 'Planning', 'Unknown']
    
    features.forEach((feature: Feature) => {
      expect(validStatuses).toContain(feature.status)
    })
  })

  it('should have valid ETA format (e.g., Q1 2025)', () => {
    const etaRegex = /^Q[1-4] \d{4}$/
    
    features.forEach((feature: Feature) => {
      expect(feature.eta).toMatch(etaRegex)
    })
  })

  it('should have unique feature titles', () => {
    const titles = features.map(feature => feature.title)
    const uniqueTitles = [...new Set(titles)]
    
    expect(titles.length).toBe(uniqueTitles.length)
  })

  it('should group features by sections correctly', () => {
    const sections = [...new Set(features.map(feature => feature.section))]
    
    // Check expected sections exist
    const expectedSections = [
      'Dashboard',
      'Database',
      'Marketplace',
      'Model',
      'Settings',
      'Workflow',
      'Workspace'
    ]
    
    expectedSections.forEach(section => {
      expect(sections).toContain(section)
    })
    
    // Check each section has at least one feature
    sections.forEach(section => {
      const sectionFeatures = features.filter(feature => feature.section === section)
      expect(sectionFeatures.length).toBeGreaterThan(0)
    })
  })

  it('should have at least 2 features per section', () => {
    const sections = [...new Set(features.map(feature => feature.section))]
    
    sections.forEach(section => {
      const sectionFeatures = features.filter(feature => feature.section === section)
      expect(sectionFeatures.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('should have balanced distribution of statuses', () => {
    const statusCounts = features.reduce((acc, feature) => {
      acc[feature.status] = (acc[feature.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Check if we have at least one of each status
    expect(Object.keys(statusCounts).length).toBeGreaterThanOrEqual(3)
  })
}) 