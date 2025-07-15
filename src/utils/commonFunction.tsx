import moment from 'moment'

export const formatDeploymentsDate = (dateString: string) => {
  if (!dateString || !moment(dateString).isValid()) {
    return 'N/A'
  }

  return moment(dateString)
    .utcOffset('+05:30')
    .format('DD.MM.YYYY [at] HH:mm [IST]')
}

export const isValidUrl = (url: string) => {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

export const getDeploymentStatusColor = (status: string) => {
  switch (status) {
    case 'running':
      return 'green'
    case 'pending':
      return 'yellow'
    case 'succeeded':
      return 'blue'
    case 'failed':
      return 'red'
    default:
      return 'gray'
  }
}

export const getResourceUsageText = (resourceType: string, value: number) => {
  const type = resourceType.toUpperCase()

  if (type !== 'GPU' && type !== 'CPU') {
    return "Error: Resource type must be either 'GPU' or 'CPU'"
  }

  if (value < 0 || value > 100) {
    return 'Error: Usage value must be a number between 0 and 100'
  }

  let status
  if (value < 31) {
    status = 'stable'
  } else if (value < 61) {
    status = 'moderate'
  } else {
    status = 'unstable'
  }

  return `Model is utilising ${
    value < 31 ? 'only ' : ''
  }${value}% ${type} usage and it is in ${status} mode`
}

export const formatProjectDate = (dateString: string) => {
  // Handle null, undefined, or invalid dates
  if (!dateString || !moment(dateString).isValid()) {
    return 'date unknown'
  }

  const date = moment(dateString)
  const now = moment()

  // Calculate differences
  const diffDays = now.diff(date, 'days')
  const diffHours = now.diff(date, 'hours')
  const diffMinutes = now.diff(date, 'minutes')

  if (diffMinutes < 5) {
    return 'created just now'
  } else if (diffHours < 1) {
    return `created ${diffMinutes} minutes ago`
  } else if (diffHours < 24) {
    return `created ${diffHours} hours ago`
  } else if (diffDays === 1) {
    return 'created yesterday'
  } else if (diffDays < 7) {
    return `created ${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `created ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `created ${months} ${months === 1 ? 'month' : 'months'} ago`
  } else {
    const years = Math.floor(diffDays / 365)
    return `created ${years} ${years === 1 ? 'year' : 'years'} ago`
  }
}

export const getRolePriority = (role: string) => {
  if (role === 'owner') return 0
  if (role === 'admin') return 1
  if (role === 'user') return 2
  return 3
}

export function timeAgo(timestamp: any) {
  // Handle null, undefined, NaN, or invalid timestamp
  if (!timestamp || isNaN(timestamp)) {
    return 'unknown time'
  }

  // Ensure timestamp is a number
  const ts = Number(timestamp)

  // If timestamp is in milliseconds (13 digits), convert to seconds
  const timestampInSeconds =
    ts.toString().length > 10 ? Math.floor(ts / 1000) : ts

  // Get current time in seconds
  const now = Math.floor(Date.now() / 1000)

  // If timestamp is in the future or too far in the past (more than 100 years)
  if (timestampInSeconds > now) {
    return 'in the future'
  }
  if (now - timestampInSeconds > 3153600000) {
    // ~100 years in seconds
    return 'long ago'
  }

  const seconds = now - timestampInSeconds

  // Define time intervals in seconds
  const minute = 60
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const month = day * 30
  const year = day * 365

  // Return appropriate string based on elapsed time
  if (seconds < minute) {
    return 'just now'
  } else if (seconds < hour) {
    const minutes = Math.floor(seconds / minute)
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`
  } else if (seconds < day) {
    const hours = Math.floor(seconds / hour)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  } else if (seconds < week) {
    const days = Math.floor(seconds / day)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  } else if (seconds < month) {
    const weeks = Math.floor(seconds / week)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  } else if (seconds < year) {
    const months = Math.floor(seconds / month)
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  } else {
    const years = Math.floor(seconds / year)
    return `${years} ${years === 1 ? 'year' : 'years'} ago`
  }
}

export const formatServerDate = (dateString: string) => {
  // Handle null, undefined, or invalid dates
  if (!dateString || !moment(dateString).isValid()) {
    return 'date unknown'
  }

  const date = moment(dateString)
  const now = moment()

  // Calculate differences
  const diffDays = now.diff(date, 'days')
  const diffHours = now.diff(date, 'hours')
  const diffMinutes = now.diff(date, 'minutes')

  if (diffMinutes < 5) {
    return 'just now'
  } else if (diffHours < 1) {
    return `${diffMinutes} minutes ago`
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`
  } else if (diffDays === 1) {
    return 'yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} ${years === 1 ? 'year' : 'years'} ago`
  }
}

/**
 * Converts a GitHub repo URL to a raw content URL for a specific file.
 *
 * @param githubUrl - Full GitHub repo URL (e.g., https://github.com/user/repo)
 * @param filePath - Path to the file inside the repo (e.g., src/github/file.ts)
 * @param branch - Optional branch name (default is 'main')
 * @returns Raw file URL for GitHub content
 */
export function getRawGithubFileUrl(
  githubUrl: string,
  filePath: string,
  branch: string = 'main',
): string | null {
  try {
    const url = new URL(githubUrl)
    const [owner, repo] = url.pathname.split('/').filter(Boolean)

    if (!owner || !repo) {
      throw new Error('Invalid GitHub URL')
    }

    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`
  } catch (err) {
    console.error('Failed to generate raw URL:', err)
    return null
  }
}

// function to remove backticks from a string
export function removeBackticks(str: string) {
  return str.replace(/^`|`$/g, '')
}

// Function to detect and format JSON arrays as markdown tables
export const formatJsonAsTable = (content: string): string => {
  try {
    // Try to find JSON arrays in the content
    const jsonArrayMatch = content.match(/\[\s*\{[\s\S]*?\}\s*\]/g)

    if (jsonArrayMatch) {
      let formattedContent = content

      jsonArrayMatch.forEach(jsonString => {
        try {
          const jsonArray = JSON.parse(jsonString)

          // Check if it's an array of objects
          if (
            Array.isArray(jsonArray) &&
            jsonArray.length > 0 &&
            typeof jsonArray[0] === 'object'
          ) {
            // Get all unique keys from all objects
            const allKeys = new Set<string>()
            jsonArray.forEach(obj => {
              Object.keys(obj).forEach(key => allKeys.add(key))
            })

            const headers = Array.from(allKeys)

            // Create markdown table
            let markdownTable = '\n\n'

            // Add headers
            markdownTable += '| ' + headers.join(' | ') + ' |\n'
            markdownTable +=
              '| ' + headers.map(() => '---').join(' | ') + ' |\n'

            // Add rows
            jsonArray.forEach(obj => {
              const row = headers.map(header => {
                const value = obj[header]
                if (value === null || value === undefined) return ''
                if (typeof value === 'string') return value
                return String(value)
              })
              markdownTable += '| ' + row.join(' | ') + ' |\n'
            })

            markdownTable += '\n'

            // Replace the JSON array with the markdown table
            formattedContent = formattedContent.replace(
              jsonString,
              markdownTable,
            )
          }
        } catch (e) {
          // If parsing fails, leave the original content
          console.warn('Failed to parse JSON for table formatting:', e)
        }
      })

      return formattedContent
    }
  } catch (e) {
    // If anything fails, return original content
    console.warn('Error in JSON table formatting:', e)
  }

  return content
}

// Clean message content for markdown rendering
export const cleanContent = (raw: string) => {
  let content = raw
  // Remove leading/trailing quotes if present
  if (content.startsWith('"') && content.endsWith('"')) {
    content = content.slice(1, -1)
  }
  // Replace escaped newlines and backticks
  content = content.replace(/\\n/g, '\n').replace(/\\`/g, '`')
  // Fix code block formatting: ensure triple backticks are on a new line
  content = content.replace(/([^\n])```/g, '$1\n```')

  // Format JSON arrays as tables
  content = formatJsonAsTable(content)

  // Improve table formatting - ensure proper spacing around tables
  content = content.replace(/\n\|/g, '\n\n|').replace(/\|\n/g, '|\n\n')

  return content
}

// Function to calculate password strength
const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
]

export function getStrength(password: string) {
  let multiplier = password.length > 5 ? 0 : 1

  requirements.forEach(requirement => {
    if (!requirement.re.test(password)) {
      multiplier += 1
    }
  })

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10)
}
