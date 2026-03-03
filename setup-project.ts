#!/usr/bin/env bun

/**
 * Post-clone project setup.
 * Run: bun run setup-project.ts (or bun setup-project.ts)
 *
 * Prompts for: project name, package scope (short name), domain, and which React Native app to keep (Feedy, Propia, or None).
 * - Keeps one native app, renames it to `apps/native`, deletes the other
 * - Replaces @starter with @scope everywhere
 * - Replaces @feedy / @propia with @scope in the kept native app
 * - Sets bundle id / package from domain (e.g. com.example.app)
 */

import { execSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

const ROOT =
  (import.meta as { dir?: string }).dir ??
  path.dirname(fileURLToPath(import.meta.url))

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve((answer ?? '').trim())
    })
  })
}

function askSelect(question: string, options: string[]): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const opts = options.map((o) => o.toLowerCase())
  const prompt = `${question} (${options.join(' / ')}): `
  return new Promise((resolve) => {
    const run = () => {
      rl.question(prompt, (answer) => {
        const normalized = (answer ?? '').trim().toLowerCase()
        const chosen = opts.find(
          (o) => o === normalized || o.startsWith(normalized)
        )
        if (chosen) {
          rl.close()
          resolve(opts.find((o) => o === chosen) ?? chosen)
        } else {
          console.log(`Please choose one of: ${options.join(', ')}`)
          run()
        }
      })
    }
    run()
  })
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function scopeFromShortName(short: string): string {
  return short.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const DOT_G = /\./g
const HTTP_PREFIX = /^https?:\/\//
const NO_NATIVE_UPDATE_ALL = /\s*&&\s*\(cd apps\/feedy[^)]*\)/

/** e.g. spotfinder.com -> com.spotfinder.app */
function domainToBundleId(domain: string, appSlug: string): string {
  const clean = domain.replace(HTTP_PREFIX, '').split('/')[0].toLowerCase()
  const parts = clean.split('.').reverse()
  const domainPart =
    parts.length >= 2 ? parts.slice(0, 2).join('.') : clean.replace(DOT_G, '')
  return `com.${domainPart.replace(DOT_G, '')}.${appSlug}`
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function rmDir(dir: string): Promise<void> {
  if (!(await exists(dir))) return
  await fs.rm(dir, { recursive: true })
  console.log(`Removed ${path.relative(ROOT, dir)}`)
}

async function* walk(
  dir: string,
  opts: { extensions?: string[]; excludeDirs?: string[] }
): AsyncGenerator<string> {
  await Promise.resolve() // satisfy lint: async generator
  const exclude = new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    '.expo',
    '.turbo',
    'coverage',
    '.next',
    ...(opts.excludeDirs ?? [])
  ])
  const exts = opts.extensions
    ? new Set(opts.extensions.map((e) => e.toLowerCase()))
    : null

  async function* go(d: string): AsyncGenerator<string> {
    const entries = await fs.readdir(d, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(d, e.name)
      if (e.isDirectory()) {
        if (!exclude.has(e.name)) yield* go(full)
      } else if (
        e.isFile() &&
        (!exts || exts.has(path.extname(e.name).toLowerCase()))
      )
        yield full
    }
  }
  yield* go(dir)
}

async function main() {
  console.log('\n--- Project setup ---\n')

  const projectName = await ask('Project name (e.g. Spot Finder): ')
  if (!projectName) {
    console.error('Project name is required.')
    process.exit(1)
  }

  const shortName = await ask(
    'Package short name / scope for imports (e.g. SPT → @spt/ui): '
  )
  if (!shortName) {
    console.error('Package short name is required.')
    process.exit(1)
  }

  const domain = await ask('Domain for publishing (e.g. spotfinder.com): ')
  if (!domain) {
    console.error('Domain is required.')
    process.exit(1)
  }

  const nativeChoice = await askSelect('Which React Native app to keep?', [
    'feedy',
    'propia',
    'none'
  ])
  const projectSlug = slug(projectName) || 'app'
  const scope = scopeFromShortName(shortName) || 'app'
  const bundleId = domainToBundleId(domain, projectSlug)

  console.log('\nApplying:')
  console.log('  Project name:', projectName, '→ slug:', projectSlug)
  console.log(`  Package scope: @${scope}`)
  console.log('  Domain:', domain, '→ bundle id:', bundleId)
  console.log(
    '  Native app:',
    nativeChoice === 'none' ? 'remove both' : `${nativeChoice} → native`
  )

  // --- Native app: delete one or both, rename selected to native
  const feedyPath = path.join(ROOT, 'apps', 'feedy')
  const propiaPath = path.join(ROOT, 'apps', 'propia')
  const nativePath = path.join(ROOT, 'apps', 'native')

  if (nativeChoice === 'feedy') {
    await rmDir(propiaPath)
    if (await exists(feedyPath)) {
      if (await exists(nativePath)) await rmDir(nativePath)
      await fs.rename(feedyPath, nativePath)
      console.log('Renamed apps/feedy → apps/native')
    }
  } else if (nativeChoice === 'propia') {
    await rmDir(feedyPath)
    if (await exists(propiaPath)) {
      if (await exists(nativePath)) await rmDir(nativePath)
      await fs.rename(propiaPath, nativePath)
      console.log('Renamed apps/propia → apps/native')
    }
  } else {
    await rmDir(feedyPath)
    await rmDir(propiaPath)
    if (await exists(nativePath)) await rmDir(nativePath)
  }

  const hasNative = nativeChoice !== 'none'
  const nativeAlias =
    nativeChoice === 'feedy'
      ? 'feedy'
      : nativeChoice === 'propia'
        ? 'propia'
        : null

  // --- Replace @starter with @scope everywhere (package names and imports)
  const replaceStarterRegex = /@starter\//g

  for await (const file of walk(ROOT, {
    extensions: ['.ts', '.tsx', '.json', '.jsonc', '.md'],
    excludeDirs: ['node_modules', '.git', 'dist', 'build', '.expo', '.turbo']
  })) {
    const rel = path.relative(ROOT, file)
    if (rel.includes('node_modules') || rel.startsWith('.git')) continue

    const content = await fs.readFile(file, 'utf-8')
    if (!content.includes('@starter')) continue

    const newContent = content.replace(replaceStarterRegex, `@${scope}/`)
    await fs.writeFile(file, newContent)
    console.log('  Updated', rel)
  }

  // --- In apps/native: replace @feedy or @propia with @scope and update config files
  if (hasNative && nativeAlias && (await exists(nativePath))) {
    const aliasRegex = new RegExp(`@${nativeAlias}/`, 'g')
    for await (const file of walk(nativePath, {
      extensions: ['.ts', '.tsx', '.json', '.jsonc'],
      excludeDirs: ['node_modules', '.expo']
    })) {
      let content = await fs.readFile(file, 'utf-8')
      if (content.includes(`@${nativeAlias}/`)) {
        content = content.replace(aliasRegex, `@${scope}/`)
        await fs.writeFile(file, content)
        console.log('  Updated', path.relative(ROOT, file))
      }
    }

    // apps/native/tsconfig.json path alias
    const nativeTsconfig = path.join(nativePath, 'tsconfig.json')
    if (await exists(nativeTsconfig)) {
      let tc = await fs.readFile(nativeTsconfig, 'utf-8')
      tc = tc.replace(new RegExp(`@${nativeAlias}`, 'g'), scope)
      await fs.writeFile(nativeTsconfig, tc)
      console.log('  Updated apps/native/tsconfig.json paths')
    }

    // apps/native/package.json name → "native"
    const nativePkg = path.join(nativePath, 'package.json')
    if (await exists(nativePkg)) {
      const pkg = JSON.parse(await fs.readFile(nativePkg, 'utf-8'))
      pkg.name = 'native'
      await fs.writeFile(nativePkg, JSON.stringify(pkg, null, 2))
      console.log('  Updated apps/native/package.json name → native')
    }

    // apps/native/app.json: name, slug, scheme, ios.bundleIdentifier, android.package
    const appJsonPath = path.join(nativePath, 'app.json')
    if (await exists(appJsonPath)) {
      const appJson = JSON.parse(await fs.readFile(appJsonPath, 'utf-8'))
      const expo = appJson.expo ?? {}
      appJson.expo = expo
      expo.name = projectName
      expo.slug = projectSlug
      expo.scheme = projectSlug
      expo.ios = expo.ios ?? {}
      expo.ios.bundleIdentifier = bundleId
      expo.android = expo.android ?? {}
      expo.android.package = bundleId
      await fs.writeFile(appJsonPath, JSON.stringify(appJson, null, 2))
      console.log(
        '  Updated apps/native/app.json (name, slug, scheme, bundle id)'
      )
    }
  }

  // --- Root package.json: name → project slug, scripts
  const rootPkgPath = path.join(ROOT, 'package.json')
  const rootPkg = JSON.parse(await fs.readFile(rootPkgPath, 'utf-8'))
  rootPkg.name = projectSlug
  if (rootPkg.scripts) {
    rootPkg.scripts['db:push'] = `turbo -F @${scope}/db db:push`
    rootPkg.scripts['db:studio'] = `turbo -F @${scope}/db db:studio`
    if (rootPkg.scripts['update:all']) {
      if (hasNative) {
        rootPkg.scripts['update:all'] = rootPkg.scripts['update:all'].replace(
          'apps/feedy',
          'apps/native'
        )
      } else {
        rootPkg.scripts['update:all'] = rootPkg.scripts['update:all'].replace(
          NO_NATIVE_UPDATE_ALL,
          ''
        )
      }
    }
  }
  await fs.writeFile(rootPkgPath, JSON.stringify(rootPkg, null, 2))
  console.log('  Updated root package.json')

  // --- .syncpackrc.json packages
  const syncpackPath = path.join(ROOT, '.syncpackrc.json')
  if (await exists(syncpackPath)) {
    const syncpack = JSON.parse(await fs.readFile(syncpackPath, 'utf-8'))
    for (const g of syncpack.semverGroups ?? []) {
      if (Array.isArray(g.packages) && g.packages.includes('@rov/**')) {
        g.packages = g.packages.map((p: string) =>
          p === '@rov/**' ? `@${scope}/**` : p
        )
      }
    }
    await fs.writeFile(syncpackPath, JSON.stringify(syncpack, null, 2))
    console.log('  Updated .syncpackrc.json')
  }

  // --- Env files: copy examples to .env / .dev.vars and set defaults
  const apiDevVarsExample = path.join(ROOT, 'apps', 'api', '.dev.vars.example')
  const apiDevVars = path.join(ROOT, 'apps', 'api', '.dev.vars')
  const webEnvExample = path.join(ROOT, 'apps', 'web', '.env.example')
  const webEnv = path.join(ROOT, 'apps', 'web', '.env')

  const defaultOrigin = 'http://localhost:3000'
  const defaultApiUrl = 'http://localhost:3001'
  const betterAuthSecret = execSync('openssl rand -base64 32', {
    encoding: 'utf-8'
  }).trim()

  if (await exists(apiDevVarsExample)) {
    let devVarsContent = await fs.readFile(apiDevVarsExample, 'utf-8')
    devVarsContent = devVarsContent
      .replace(
        /BETTER_AUTH_SECRET=.*/m,
        `BETTER_AUTH_SECRET=${betterAuthSecret}`
      )
      .replace(/BETTER_AUTH_URL=.*/m, `BETTER_AUTH_URL=${defaultApiUrl}`)
      .replace(/CORS_ORIGINS=.*/m, `CORS_ORIGINS=${defaultOrigin}`)
    await fs.writeFile(apiDevVars, devVarsContent)
    console.log('  Created apps/api/.dev.vars from .dev.vars.example')
  }
  if (await exists(webEnvExample)) {
    let webEnvContent = await fs.readFile(webEnvExample, 'utf-8')
    webEnvContent = webEnvContent
      .replace(/VITE_API_URL=.*/m, `VITE_API_URL=${defaultApiUrl}`)
      .replace(/VITE_APP_URL=.*/m, `VITE_APP_URL=${defaultOrigin}`)
    await fs.writeFile(webEnv, webEnvContent)
    console.log('  Created apps/web/.env from .env.example')
  }

  // --- Reset git and re-init (fresh history for new project)
  const resetGit = await askSelect(
    'Reset git and re-initialize a fresh repo?',
    ['yes', 'no']
  )
  if (resetGit === 'yes') {
    const gitDir = path.join(ROOT, '.git')
    if (await exists(gitDir)) {
      await fs.rm(gitDir, { recursive: true })
      console.log('  Removed .git')
    }
    execSync('git init', { cwd: ROOT, stdio: 'inherit' })
    console.log('  Initialized new git repo')
  }

  console.log(
    '\nDone. Next: bun install (if you changed package names). Fill DATABASE_URL and Google OAuth in .env and apps/api/.dev.vars.\n'
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
