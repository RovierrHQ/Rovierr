import { createCentrifugeServerClient } from '@rov/realtime'
import { env } from './env'

// Create Centrifugo server client for publishing real-time updates
const realtime = createCentrifugeServerClient({
  url: env.CENTRIFUGO_URL || 'http://localhost:8000',
  apiKey: env.CENTRIFUGO_API_KEY || ''
})

export default realtime
