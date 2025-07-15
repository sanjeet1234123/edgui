// @ts-nocheck - Disable TypeScript checking for this test file
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals'
import moment from 'moment'
import {
  formatDeploymentsDate,
  isValidUrl,
  getDeploymentStatusColor,
  getResourceUsageText,
  formatProjectDate,
  getRolePriority,
  timeAgo,
  formatServerDate,
  getRawGithubFileUrl,
  removeBackticks,
  formatJsonAsTable,
  cleanContent,
  getStrength,
} from '@/utils/commonFunction'

// Mock moment to have consistent tests
jest.mock('moment', () => {
  const mockMoment = jest.fn()
  mockMoment.mockImplementation(date => {
    const actualMoment = jest.requireActual('moment')
    return actualMoment(date)
  })

  // Add required moment methods
  mockMoment.utc = jest.fn().mockImplementation(date => {
    const actualMoment = jest.requireActual('moment')
    return actualMoment.utc(date)
  })

  return mockMoment
})

describe('Common Functions', () => {
  // Store original Date
  const OriginalDate = global.Date

  beforeEach(() => {
    jest.clearAllMocks()

    // Set a fixed "now" date for testing
    const fixedDate = new OriginalDate('2023-01-01T12:00:00Z')
    jest.spyOn(Date, 'now').mockImplementation(() => fixedDate.getTime())

    // Mock Date constructor without causing recursion
    global.Date = jest.fn(arg => {
      if (arg === undefined) {
        return fixedDate
      }
      return new OriginalDate(arg)
    })
    global.Date.UTC = OriginalDate.UTC
    global.Date.parse = OriginalDate.parse
    global.Date.now = jest.fn(() => fixedDate.getTime())
  })

  // Restore Date after all tests
  afterAll(() => {
    global.Date = OriginalDate
  })

  describe('formatDeploymentsDate', () => {
    it('should format a valid date in the correct format', () => {
      const result = formatDeploymentsDate('2022-12-31T10:30:00Z')
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4} at \d{2}:\d{2} IST/)
    })

    it('should return N/A for invalid dates', () => {
      expect(formatDeploymentsDate('')).toBe('N/A')
      expect(formatDeploymentsDate('invalid-date')).toBe('N/A')
      expect(formatDeploymentsDate(null)).toBe('N/A')
      expect(formatDeploymentsDate(undefined)).toBe('N/A')
    })
  })

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('https://example.com/path?query=param')).toBe(true)
    })

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl('example.com')).toBe(false)
      expect(isValidUrl('ftp://example.com')).toBe(false)
      expect(isValidUrl(null)).toBe(false)
      expect(isValidUrl(undefined)).toBe(false)
    })
  })

  describe('getDeploymentStatusColor', () => {
    it('should return correct color for each status', () => {
      expect(getDeploymentStatusColor('running')).toBe('green')
      expect(getDeploymentStatusColor('pending')).toBe('yellow')
      expect(getDeploymentStatusColor('succeeded')).toBe('blue')
      expect(getDeploymentStatusColor('failed')).toBe('red')
      expect(getDeploymentStatusColor('unknown')).toBe('gray')
    })
  })

  describe('getResourceUsageText', () => {
    it('should return the correct message for CPU usage', () => {
      expect(getResourceUsageText('CPU', 20)).toBe(
        'Model is utilising only 20% CPU usage and it is in stable mode',
      )
      expect(getResourceUsageText('cpu', 50)).toBe(
        'Model is utilising 50% CPU usage and it is in moderate mode',
      )
      expect(getResourceUsageText('CPU', 80)).toBe(
        'Model is utilising 80% CPU usage and it is in unstable mode',
      )
    })

    it('should return the correct message for GPU usage', () => {
      expect(getResourceUsageText('GPU', 20)).toBe(
        'Model is utilising only 20% GPU usage and it is in stable mode',
      )
      expect(getResourceUsageText('gpu', 50)).toBe(
        'Model is utilising 50% GPU usage and it is in moderate mode',
      )
      expect(getResourceUsageText('GPU', 80)).toBe(
        'Model is utilising 80% GPU usage and it is in unstable mode',
      )
    })

    it('should return error message for invalid resource type', () => {
      expect(getResourceUsageText('RAM', 50)).toBe(
        "Error: Resource type must be either 'GPU' or 'CPU'",
      )
    })

    it('should return error message for out-of-range values', () => {
      expect(getResourceUsageText('CPU', -10)).toBe(
        'Error: Usage value must be a number between 0 and 100',
      )
      expect(getResourceUsageText('CPU', 110)).toBe(
        'Error: Usage value must be a number between 0 and 100',
      )
    })
  })

  describe('formatProjectDate', () => {
    it('should handle recent dates', () => {
      const now = new OriginalDate('2023-01-01T12:00:00Z')

      const justNow = new OriginalDate(now.getTime() - 1 * 60 * 1000) // 1 minute ago
      expect(formatProjectDate(justNow.toISOString())).toBe('created just now')

      const fewMinutesAgo = new OriginalDate(now.getTime() - 10 * 60 * 1000) // 10 minutes ago
      expect(formatProjectDate(fewMinutesAgo.toISOString())).toBe(
        'created 10 minutes ago',
      )

      const hoursAgo = new OriginalDate(now.getTime() - 5 * 60 * 60 * 1000) // 5 hours ago
      expect(formatProjectDate(hoursAgo.toISOString())).toBe(
        'created 5 hours ago',
      )
    })

    it('should handle days, weeks, months, and years', () => {
      const now = new OriginalDate('2023-01-01T12:00:00Z')

      const yesterday = new OriginalDate(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
      expect(formatProjectDate(yesterday.toISOString())).toBe(
        'created yesterday',
      )

      const daysAgo = new OriginalDate(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      expect(formatProjectDate(daysAgo.toISOString())).toBe(
        'created 3 days ago',
      )

      const weeksAgo = new OriginalDate(
        now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000,
      ) // 2 weeks ago
      expect(formatProjectDate(weeksAgo.toISOString())).toBe(
        'created 2 weeks ago',
      )

      const monthsAgo = new OriginalDate(
        now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000,
      ) // 2 months ago
      expect(formatProjectDate(monthsAgo.toISOString())).toBe(
        'created 2 months ago',
      )

      const yearsAgo = new OriginalDate(
        now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000,
      ) // 2 years ago
      expect(formatProjectDate(yearsAgo.toISOString())).toBe(
        'created 2 years ago',
      )
    })

    it('should handle invalid dates', () => {
      expect(formatProjectDate('')).toBe('date unknown')
      expect(formatProjectDate('invalid-date')).toBe('date unknown')
      expect(formatProjectDate(null)).toBe('date unknown')
      expect(formatProjectDate(undefined)).toBe('date unknown')
    })
  })

  describe('getRolePriority', () => {
    it('should return the correct priority for each role', () => {
      expect(getRolePriority('owner')).toBe(0)
      expect(getRolePriority('admin')).toBe(1)
      expect(getRolePriority('user')).toBe(2)
      expect(getRolePriority('other')).toBe(3)
      expect(getRolePriority('')).toBe(3)
    })
  })

  describe('timeAgo', () => {
    it('should handle invalid inputs', () => {
      expect(timeAgo(null)).toBe('unknown time')
      expect(timeAgo(undefined)).toBe('unknown time')
      expect(timeAgo('not-a-number')).toBe('unknown time')
    })

    it('should handle future timestamps', () => {
      const future = Date.now() + 1000 * 60 * 60 // 1 hour in the future
      expect(timeAgo(future)).toBe('in the future')
    })

    it('should handle very old timestamps', () => {
      const veryOld = 0 // Jan 1, 1970
      expect(timeAgo(veryOld)).toBe('unknown time')
    })

    it('should convert milliseconds to seconds if needed', () => {
      const now = Date.now()
      const fiveMinutesAgoMs = now - 5 * 60 * 1000 // 5 minutes ago in milliseconds
      expect(timeAgo(fiveMinutesAgoMs)).toBe('5 mins ago')
    })

    it('should handle different time ranges correctly', () => {
      const now = Math.floor(Date.now() / 1000) // current time in seconds

      expect(timeAgo(now - 30)).toBe('just now') // 30 seconds ago
      expect(timeAgo(now - 120)).toBe('2 mins ago') // 2 minutes ago
      expect(timeAgo(now - 3600)).toBe('1 hour ago') // 1 hour ago
      expect(timeAgo(now - 7200)).toBe('2 hours ago') // 2 hours ago
      expect(timeAgo(now - 86400)).toBe('1 day ago') // 1 day ago
      expect(timeAgo(now - 172800)).toBe('2 days ago') // 2 days ago
      expect(timeAgo(now - 604800)).toBe('1 week ago') // 1 week ago
      expect(timeAgo(now - 1209600)).toBe('2 weeks ago') // 2 weeks ago
      expect(timeAgo(now - 2592000)).toBe('1 month ago') // 1 month ago
      expect(timeAgo(now - 5184000)).toBe('2 months ago') // 2 months ago
      expect(timeAgo(now - 31536000)).toBe('1 year ago') // 1 year ago
      expect(timeAgo(now - 63072000)).toBe('2 years ago') // 2 years ago
    })
  })

  describe('formatServerDate', () => {
    it('should handle recent dates', () => {
      const now = new OriginalDate('2023-01-01T12:00:00Z')

      const justNow = new OriginalDate(now.getTime() - 1 * 60 * 1000) // 1 minute ago
      expect(formatServerDate(justNow.toISOString())).toBe('just now')

      const fewMinutesAgo = new OriginalDate(now.getTime() - 10 * 60 * 1000) // 10 minutes ago
      expect(formatServerDate(fewMinutesAgo.toISOString())).toBe(
        '10 minutes ago',
      )

      const hoursAgo = new OriginalDate(now.getTime() - 5 * 60 * 60 * 1000) // 5 hours ago
      expect(formatServerDate(hoursAgo.toISOString())).toBe('5 hours ago')
    })

    it('should handle days, weeks, months, and years', () => {
      const now = new OriginalDate('2023-01-01T12:00:00Z')

      const yesterday = new OriginalDate(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
      expect(formatServerDate(yesterday.toISOString())).toBe('yesterday')

      const daysAgo = new OriginalDate(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      expect(formatServerDate(daysAgo.toISOString())).toBe('3 days ago')

      const weeksAgo = new OriginalDate(
        now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000,
      ) // 2 weeks ago
      expect(formatServerDate(weeksAgo.toISOString())).toBe('2 weeks ago')

      const monthsAgo = new OriginalDate(
        now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000,
      ) // 2 months ago
      expect(formatServerDate(monthsAgo.toISOString())).toBe('2 months ago')

      const yearsAgo = new OriginalDate(
        now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000,
      ) // 2 years ago
      expect(formatServerDate(yearsAgo.toISOString())).toBe('2 years ago')
    })

    it('should handle invalid dates', () => {
      expect(formatServerDate('')).toBe('date unknown')
      expect(formatServerDate('invalid-date')).toBe('date unknown')
      expect(formatServerDate(null)).toBe('date unknown')
      expect(formatServerDate(undefined)).toBe('date unknown')
    })
  })

  describe('getRawGithubFileUrl', () => {
    it('should convert GitHub URLs to raw URLs correctly', () => {
      const githubUrl = 'https://github.com/username/repo'
      const filePath = 'src/utils/file.ts'

      expect(getRawGithubFileUrl(githubUrl, filePath)).toBe(
        'https://raw.githubusercontent.com/username/repo/main/src/utils/file.ts',
      )
    })

    it('should handle custom branches', () => {
      const githubUrl = 'https://github.com/username/repo'
      const filePath = 'src/utils/file.ts'
      const branch = 'develop'

      expect(getRawGithubFileUrl(githubUrl, filePath, branch)).toBe(
        'https://raw.githubusercontent.com/username/repo/develop/src/utils/file.ts',
      )
    })

    it('should return null for invalid GitHub URLs', () => {
      expect(getRawGithubFileUrl('https://invalid-url.com', 'file.ts')).toBe(
        null,
      )
      expect(getRawGithubFileUrl('https://github.com', 'file.ts')).toBe(null)
    })
  })

  describe('removeBackticks', () => {
    it('should remove backticks from the beginning and end of strings', () => {
      expect(removeBackticks('`hello`')).toBe('hello')
      expect(removeBackticks('`world`')).toBe('world')
      expect(removeBackticks('`test function`')).toBe('test function')
    })

    it('should handle strings with only one backtick', () => {
      expect(removeBackticks('`hello')).toBe('hello')
      expect(removeBackticks('world`')).toBe('world')
    })

    it('should handle strings without backticks', () => {
      expect(removeBackticks('hello world')).toBe('hello world')
      expect(removeBackticks('no backticks here')).toBe('no backticks here')
    })

    it('should handle empty strings', () => {
      expect(removeBackticks('')).toBe('')
      expect(removeBackticks('``')).toBe('')
    })

    it('should preserve backticks in the middle of strings', () => {
      expect(removeBackticks('`hello`world`test`')).toBe('hello`world`test')
      expect(removeBackticks('`code`with`backticks`')).toBe(
        'code`with`backticks',
      )
    })
  })

  describe('formatJsonAsTable', () => {
    it('should convert JSON array to markdown table', () => {
      const jsonContent = `Here is some data: [{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]`
      const result = formatJsonAsTable(jsonContent)

      expect(result).toContain('| name | age |')
      expect(result).toContain('| --- | --- |')
      expect(result).toContain('| John | 30 |')
      expect(result).toContain('| Jane | 25 |')
    })

    it('should handle JSON arrays with different keys', () => {
      const jsonContent = `Data: [{"name": "John", "city": "NYC"}, {"name": "Jane", "age": 25}]`
      const result = formatJsonAsTable(jsonContent)

      expect(result).toContain('| name | city | age |')
      expect(result).toContain('| John | NYC |  |')
      expect(result).toContain('| Jane |  | 25 |')
    })

    it('should handle empty JSON arrays', () => {
      const jsonContent = `Empty array: []`
      const result = formatJsonAsTable(jsonContent)

      expect(result).toBe(jsonContent) // Should return unchanged
    })

    it('should handle non-JSON content', () => {
      const content = 'This is just regular text'
      const result = formatJsonAsTable(content)

      expect(result).toBe(content) // Should return unchanged
    })

    it('should handle invalid JSON', () => {
      const jsonContent = `Invalid: [{"name": "John", age: 30}]` // Missing quotes
      const result = formatJsonAsTable(jsonContent)

      expect(result).toBe(jsonContent) // Should return unchanged
    })

    it('should handle JSON with null and undefined values', () => {
      const jsonContent = `Data: [{"name": "John", "value": null}, {"name": "Jane", "value": "test"}]`
      const result = formatJsonAsTable(jsonContent)

      expect(result).toContain('| name | value |')
      expect(result).toContain('| John |  |')
      expect(result).toContain('| Jane | test |')
    })

    it('should handle non-object array items', () => {
      const jsonContent = `Data: ["string1", "string2"]`
      const result = formatJsonAsTable(jsonContent)

      expect(result).toBe(jsonContent) // Should return unchanged for non-object arrays
    })

    it('should handle multiple JSON arrays in content', () => {
      const jsonContent = `First: [{"a": 1}] and Second: [{"b": 2}]`
      const result = formatJsonAsTable(jsonContent)

      expect(result).toContain('| a |')
      expect(result).toContain('| b |')
    })
  })

  describe('cleanContent', () => {
    it('should remove leading and trailing quotes', () => {
      expect(cleanContent('"hello world"')).toBe('hello world')
      expect(cleanContent('"test content"')).toBe('test content')
    })

    it('should replace escaped newlines with actual newlines', () => {
      expect(cleanContent('line1\\nline2')).toBe('line1\nline2')
      expect(cleanContent('first\\nsecond\\nthird')).toBe(
        'first\nsecond\nthird',
      )
    })

    it('should replace escaped backticks with actual backticks', () => {
      expect(cleanContent('\\`code\\`')).toBe('`code`')
      expect(cleanContent('This is \\`inline code\\`')).toBe(
        'This is `inline code`',
      )
    })

    it('should fix code block formatting', () => {
      expect(cleanContent('text```javascript')).toBe('text\n```javascript')
      expect(cleanContent('some text```python\ncode\n```')).toBe(
        'some text\n```python\ncode\n```',
      )
    })

    it('should handle content without quotes', () => {
      const content = 'regular content without quotes'
      expect(cleanContent(content)).toBe(content)
    })

    it('should preserve quotes that are not at beginning and end', () => {
      expect(cleanContent('He said "hello" to me')).toBe(
        'He said "hello" to me',
      )
    })

    it('should improve table formatting', () => {
      const contentWithTable = 'text\n|col1|col2|\n|val1|val2|'
      const result = cleanContent(contentWithTable)

      // The function adds \n\n before | and \n\n after |
      expect(result).toContain('\n\n|col1|col2|\n\n')
      // The second table row won't have \n\n before it since it already has \n
      expect(result).toContain('|val1|val2|')
    })

    it('should process JSON arrays as tables through formatJsonAsTable', () => {
      const content = 'Data: [{"name": "John", "age": 30}]'
      const result = cleanContent(content)

      expect(result).toContain('| name | age |')
      expect(result).toContain('| John | 30 |')
    })

    it('should handle complex content with multiple transformations', () => {
      const complexContent =
        '"Code: \\`console.log()\\`\\nNew line```js\ncode\n```"'
      const result = cleanContent(complexContent)

      expect(result).toBe('Code: `console.log()`\nNew line\n```js\ncode\n```')
    })

    it('should handle empty and null content', () => {
      expect(cleanContent('')).toBe('')
      expect(cleanContent('""')).toBe('')
    })
  })

  describe('getStrength', () => {
    it('should return low strength for short passwords', () => {
      // For passwords <= 5 characters, multiplier starts at 1
      // For '123': missing lowercase, uppercase, special = +3, total multiplier = 4
      // Strength = 100 - (100/5) * 4 = 100 - 80 = 20 (max with 10)
      expect(getStrength('123')).toBe(20)

      // For 'abc': missing number, uppercase, special = +3, total multiplier = 4
      expect(getStrength('abc')).toBe(20)

      // For '': missing all requirements = +4, total multiplier = 5
      // Strength = 100 - (100/5) * 5 = 0, but minimum is 10
      expect(getStrength('')).toBe(10)
    })

    it('should return higher strength for longer passwords', () => {
      const shortPassword = 'abc123'
      const result = getStrength(shortPassword)
      expect(result).toBeGreaterThan(10)
    })

    it('should give full strength for passwords meeting all requirements', () => {
      const strongPassword = 'MyStr0ng!Pass'
      const result = getStrength(strongPassword)
      expect(result).toBe(100) // Should get full strength
    })

    it('should reduce strength for missing number', () => {
      const passwordWithoutNumber = 'MyString!Pass'
      const result = getStrength(passwordWithoutNumber)
      expect(result).toBeLessThan(100)
    })

    it('should reduce strength for missing lowercase', () => {
      const passwordWithoutLowercase = 'MYSTR0NG!PASS'
      const result = getStrength(passwordWithoutLowercase)
      expect(result).toBeLessThan(100)
    })

    it('should reduce strength for missing uppercase', () => {
      const passwordWithoutUppercase = 'mystr0ng!pass'
      const result = getStrength(passwordWithoutUppercase)
      expect(result).toBeLessThan(100)
    })

    it('should reduce strength for missing special character', () => {
      const passwordWithoutSpecial = 'MyStr0ngPass'
      const result = getStrength(passwordWithoutSpecial)
      expect(result).toBeLessThan(100)
    })

    it('should handle passwords with only some requirements', () => {
      const passwordWithTwoRequirements = 'password123'
      const result = getStrength(passwordWithTwoRequirements)
      expect(result).toBeGreaterThan(10)
      expect(result).toBeLessThan(100)
    })

    it('should return minimum 10% strength', () => {
      // For very weak password with length <= 5 and missing all requirements
      const veryWeakPassword = 'a'
      const result = getStrength(veryWeakPassword)
      // Length <= 5: +1, missing number, uppercase, special: +3 = multiplier 4
      // 100 - (100/5) * 4 = 20
      expect(result).toBe(20)
    })

    it('should handle edge case with exactly 6 characters', () => {
      const sixCharPassword = 'Pass1!'
      const result = getStrength(sixCharPassword)
      expect(result).toBe(100) // Should meet all requirements
    })

    it('should properly calculate strength based on multiplier', () => {
      // Test the calculation logic
      const passwordMissingTwo = 'password' // missing number, uppercase, and special char
      const result = getStrength(passwordMissingTwo)

      // Length > 5: multiplier starts at 0
      // Missing number, uppercase, and special char: +3
      // Total multiplier = 3
      // strength should be 100 - (100/5) * 3 = 100 - 60 = 40
      expect(result).toBe(40)
    })

    it('should handle empty password edge case', () => {
      // Empty password: length <= 5 (+1) + missing all 4 requirements (+4) = 5
      // 100 - (100/5) * 5 = 0, but minimum is 10
      expect(getStrength('')).toBe(10)
    })
  })
})
