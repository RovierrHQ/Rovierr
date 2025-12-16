import type { App } from '@api/index'
import { treaty } from '@elysiajs/eden'

const api = treaty<App>('localhost:3000')

export default api
