const LOG_PREFIX = '[Image Flow]'

export function log(...args: any[]) {
  console.log(LOG_PREFIX, ...args)
}

export function logWarn(...args: any[]) {
  console.warn(LOG_PREFIX, ...args)
}

export function logError(...args: any[]) {
  console.error(LOG_PREFIX, ...args)
}

