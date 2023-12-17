import schedule from 'node-schedule'

import rdb from './relaydb.js'
import config from "./config.js"
import checkCache from './check-cache.js'
import publish from './publish.js'
import Logger from '@nostrwatch/logger'

import { configureQueues } from './queue.js'
import { bootstrap } from '@nostrwatch/seed'
import { chunkArray, msToCronTime } from "@nostrwatch/utils"

const {trawlQueue, trawlWorker} = await configureQueues()
const logger = new Logger('daemon')
let busy = false

const populateTrawler = async (relays) => {
  await trawlWorker.pause()
  const relaysPerChunk = config?.trawler?.trawl_concurrent_relays || 50;
  const batches = chunkArray(relays, relaysPerChunk)
  batches.forEach( (batch, index) => {
    logger.info(`adding batch ${index} to trawlQueue`)
    trawlQueue.add(`trawlBatch${index}`, { relays: batch })
  })
  trawlWorker.resume()
}

const maybeCheckRelays = async () => {
  const seeded = rdb.relay.count.all() > 0
  const useCache = config?.trawler?.check?.enabled || false
  if(!seeded || !useCache || busy === true) return
  logger.info('maybeCheckRelays(): checking relays, pausing TrawlWorker')
  busy = true
  await checkCache()
  busy = false
  logger.info('maybeCheckRelays(): checked relays, resuming TrawlWorker')
}

const schedules = () => {
  const checkEveryMs = config?.trawler?.check?.interval? parseInt(eval(config.trawler.check.interval)): 12*60*60*1000
  schedule.scheduleJob( msToCronTime(checkEveryMs), maybeCheckRelays )
}

export default async () => {
  return new Promise( async (resolve) => {
    schedules()
    await maybeCheckRelays()
    const seed = await bootstrap('trawler')
    const relays = seed[0]
    const updatedAt = seed[1]
    await populateTrawler( relays )
    resolve({ queues: { trawlQueue }, watcher: null })
  })
}