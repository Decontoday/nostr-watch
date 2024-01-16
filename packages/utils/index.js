import murmurhash from 'murmurhash'
import 'dotenv/config'
import network from './network.js'

export { getEnvValue, setEnvValue } from './env-tools.js'
export { loadConfigSync, loadConfig, extractConfig } from './config.js'

// export { env } from './env.js'

let { DAEMON_PUBKEY } = process.env;
DAEMON_PUBKEY = DAEMON_PUBKEY? DAEMON_PUBKEY : 'WARNING_DAEMON_PUBKEY_UNSET';
export { DAEMON_PUBKEY }

export const isBrowser = () => (typeof window !== 'undefined' && typeof document !== 'undefined')

export const parseRelayNetwork = network.parseRelayNetwork
export const relaysSerializedByNetwork = network.relaysSerializedByNetwork

export const hashRelay = (relay) => murmurhash.v3(relay)
export const relayId = (relay, schema="Relay") => `${schema}@${hashRelay(relay)}`
export const serviceId = (service) => `Service@${service}`
export const cacheTimeId = (key) => `CacheTime@${key}`
export const noteId = (key) => `Note@${key}`
export const lastCheckedId = (key, relay) => `${DAEMON_PUBKEY}:LastChecked:${key}:${relay}`

export const now = () => new Date().getTime()
export const nowstr = () => Math.round(now()/1000)

export const delay = async (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const devnull = () => {}

export const RedisConnectionDetails = function(){
  const redis = {}
  Object.keys(process.env).forEach(key => {
    if(key.startsWith('REDIS_'))
    redis[key.replace('REDIS_', '').toLowerCase()] = process.env[key]
  })
  return redis
}

export const chunkArray = function(arr, chunkSize) {
  if (chunkSize <= 0) {
    throw new Error("Chunk size must be greater than 0.");
  }

  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    result.push(chunk);
  }

  return result;
}

export const msToCronTime = (milliseconds) => {
  // Ensure the input is a non-negative integer
  if (!Number.isInteger(milliseconds) || milliseconds < 0) {
      return 'Invalid input';
  }

  // Convert milliseconds to minutes
  let minutes = Math.ceil(milliseconds / 60000);

  // Convert to hours if it's 60 minutes or more
  if (minutes >= 60) {
      let hours = Math.ceil(minutes / 60);
      return `0 */${hours} * * *`;
  } else {
      // For less than 60 minutes, use the minute field in cron
      return `*/${minutes} * * * *`;
  }
}

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase()+str.slice(1);
}
