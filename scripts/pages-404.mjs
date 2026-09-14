import { copyFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const indexHtml = resolve(root, 'dist/client/index.html')
const notFound = resolve(root, 'dist/client/404.html')

if (!existsSync(indexHtml)) {
  console.error('build:pages expected dist/client/index.html after vite build')
  process.exit(1)
}

copyFileSync(indexHtml, notFound)
console.log('Copied dist/client/index.html → dist/client/404.html')
