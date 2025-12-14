/**
 * Logger utility to output JSON responses to console/file for debugging
 */

interface LogEntry {
  timestamp: string
  type: 'request' | 'response' | 'error'
  method?: string
  url?: string
  status?: number
  data?: any
  error?: any
}

class ApiLogger {
  private logs: LogEntry[] = []
  private maxLogs = 100

  logRequest(method: string, url: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type: 'request',
      method,
      url,
      data,
    }
    this.addLog(entry)
    this.printToTerminal(entry)
  }

  logResponse(method: string, url: string, status: number, data: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type: 'response',
      method,
      url,
      status,
      data,
    }
    this.addLog(entry)
    this.printToTerminal(entry)
  }

  logError(method: string, url: string, status: number | undefined, error: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type: 'error',
      method,
      url,
      status,
      error,
    }
    this.addLog(entry)
    this.printToTerminal(entry)
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  private printToTerminal(entry: LogEntry) {
    const jsonStr = JSON.stringify(entry, null, 2)
    
    // Print to console with clear formatting
    console.log('\n' + '='.repeat(80))
    console.log(`[${entry.timestamp}] ${entry.type.toUpperCase()}`)
    console.log('='.repeat(80))
    console.log(jsonStr)
    console.log('='.repeat(80) + '\n')
    
    // Also log to browser console for easy copy
    if (entry.type === 'response' && entry.data) {
      console.log('📋 JSON Response (copy this):')
      console.log(JSON.stringify(entry.data, null, 2))
    } else if (entry.type === 'error' && entry.error) {
      console.log('📋 JSON Error (copy this):')
      console.log(JSON.stringify(entry.error, null, 2))
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  downloadLogs() {
    const jsonStr = this.exportLogs()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-logs-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  clearLogs() {
    this.logs = []
  }
}

export const apiLogger = new ApiLogger()

// Make logger available globally for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).apiLogger = apiLogger
  console.log('💡 API Logger available. Use window.apiLogger in console to:')
  console.log('   - window.apiLogger.getLogs() - Get all logs')
  console.log('   - window.apiLogger.exportLogs() - Export as JSON string')
  console.log('   - window.apiLogger.downloadLogs() - Download logs as JSON file')
  console.log('   - window.apiLogger.clearLogs() - Clear all logs')
}

