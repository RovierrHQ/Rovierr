import type { Page, TestInfo } from '@playwright/test'

export type DebugCapture = {
  consoleErrors: string[]
  badResponses: { url: string; status: number }[]
}

/** Call at start of test. Listeners push into returned arrays. */
export function installDebugCapture(page: Page): DebugCapture {
  const consoleErrors: string[] = []
  const badResponses: { url: string; status: number }[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('response', (res) => {
    const status = res.status()
    if (status >= 400) badResponses.push({ url: res.url(), status })
  })
  return { consoleErrors, badResponses }
}

/** Attach screenshot + captured errors/responses, then throw. Use when create/API flow fails in CI. */
export async function attachDebugAndThrow(
  page: Page,
  testInfo: TestInfo,
  debug: DebugCapture,
  issueTitle: string,
  cause: string
): Promise<never> {
  if (process.env.CI) {
    try {
      const screenshotPath = `.playwright-failure-${Date.now()}.png`
      await page.screenshot({ path: screenshotPath })
      await testInfo.attach('failure-screenshot', {
        path: screenshotPath,
        contentType: 'image/png'
      })
    } catch {
      /* ignore */
    }
    try {
      await testInfo.attach('console-errors', {
        body: debug.consoleErrors.join('\n') || '(none)',
        contentType: 'text/plain'
      })
    } catch {
      /* ignore */
    }
    try {
      await testInfo.attach('failed-responses-4xx-5xx', {
        body: JSON.stringify(debug.badResponses, null, 2),
        contentType: 'application/json'
      })
    } catch {
      /* ignore */
    }
  }
  throw new Error(
    `${cause} Issue: "${issueTitle}". In CI, check API at VITE_API_URL, auth cookie, CORS. ${process.env.CI ? 'See attachments.' : ''}`
  )
}
