export interface UserRecord {
  username: string
  passwordHash: string
  createdAt: number
  settings?: {
    apiKey?: string
    theme?: 'light' | 'dark' | 'sepia'
    readerWidth?: number
  }
}

const CURRENT_USER_KEY = 'sr-current-user'

function userKey(username: string) {
  return `sr-user-${username}`
}

async function sha256(text: string): Promise<string> {
  try {
    const enc = new TextEncoder().encode(text)
    const buf = await crypto.subtle.digest('SHA-256', enc)
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    // Fallback (not cryptographically secure)
    let hash = 0
    for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash) + text.charCodeAt(i)
    return `${hash}`
  }
}

export async function registerUser(username: string, password: string): Promise<void> {
  username = username.trim().toLowerCase()
  if (!username || !password) throw new Error('Username and password are required')
  if (localStorage.getItem(userKey(username))) throw new Error('User already exists')
  const passwordHash = await sha256(password)
  const record: UserRecord = { username, passwordHash, createdAt: Date.now(), settings: { theme: 'light', readerWidth: 960 } }
  localStorage.setItem(userKey(username), JSON.stringify(record))
  localStorage.setItem(CURRENT_USER_KEY, username)
}

export async function loginUser(username: string, password: string): Promise<void> {
  username = username.trim().toLowerCase()
  const raw = localStorage.getItem(userKey(username))
  if (!raw) throw new Error('User not found')
  const record: UserRecord = JSON.parse(raw)
  const passwordHash = await sha256(password)
  if (passwordHash !== record.passwordHash) throw new Error('Invalid credentials')
  localStorage.setItem(CURRENT_USER_KEY, username)
}

export function getCurrentUsername(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY)
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function getUserRecord(username: string): UserRecord | null {
  const raw = localStorage.getItem(userKey(username))
  return raw ? JSON.parse(raw) as UserRecord : null
}

export function saveUserSettings(username: string, settings: Partial<UserRecord['settings']>): void {
  const raw = localStorage.getItem(userKey(username))
  if (!raw) return
  const record: UserRecord = JSON.parse(raw)
  record.settings = { ...record.settings, ...settings }
  localStorage.setItem(userKey(username), JSON.stringify(record))
}

