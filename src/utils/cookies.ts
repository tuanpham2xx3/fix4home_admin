/**
 * Cookie utility functions
 * Used for storing authentication tokens and user info
 */

/**
 * Set a cookie
 * @param name Cookie name
 * @param value Cookie value
 * @param days Days until expiration (default: 7 days)
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  // Ensure minimum 1 day for cookie persistence
  const actualDays = Math.max(1, days)
  const expires = new Date()
  expires.setTime(expires.getTime() + actualDays * 24 * 60 * 60 * 1000)
  // Encode value to handle special characters
  const encodedValue = encodeURIComponent(value)
  document.cookie = `${name}=${encodedValue};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  console.log(`🍪 [COOKIES] Set cookie: ${name} (expires in ${actualDays} days, expires at: ${expires.toUTCString()})`)
  
  // Verify cookie was set immediately
  const verify = getCookie(name)
  if (verify !== value) {
    console.error(`❌ [COOKIES] Cookie ${name} was not set correctly!`, {
      expected: value.substring(0, 20) + '...',
      got: verify?.substring(0, 20) + '...',
      allCookies: document.cookie,
    })
  } else {
    console.log(`✅ [COOKIES] Cookie ${name} verified immediately`)
  }
}

/**
 * Set a cookie with JSON object
 * @param name Cookie name
 * @param value JSON object to store
 * @param days Days until expiration (default: 7 days)
 */
export function setCookieJSON(name: string, value: any, days: number = 7): void {
  try {
    const jsonString = JSON.stringify(value)
    setCookie(name, jsonString, days)
  } catch (error) {
    console.error(`❌ [COOKIES] Failed to set JSON cookie ${name}:`, error)
    throw error
  }
}

/**
 * Get a cookie value
 * @param name Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length)
      // Decode value to handle special characters
      try {
        return decodeURIComponent(value)
      } catch {
        return value
      }
    }
  }
  return null
}

/**
 * Get a cookie value as JSON object
 * @param name Cookie name
 * @returns Parsed JSON object or null if not found or invalid
 */
export function getCookieJSON<T = any>(name: string): T | null {
  const value = getCookie(name)
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error(`❌ [COOKIES] Failed to parse JSON cookie ${name}:`, error)
    return null
  }
}

/**
 * Delete a cookie
 * @param name Cookie name
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  console.log(`🍪 [COOKIES] Deleted cookie: ${name}`)
}

/**
 * Delete multiple cookies
 * @param names Array of cookie names to delete
 */
export function deleteCookies(names: string[]): void {
  names.forEach(name => deleteCookie(name))
}

/**
 * Check if cookies are enabled
 * @returns true if cookies are enabled
 */
export function areCookiesEnabled(): boolean {
  try {
    setCookie('__test__', 'test')
    const enabled = getCookie('__test__') === 'test'
    deleteCookie('__test__')
    return enabled
  } catch {
    return false
  }
}

