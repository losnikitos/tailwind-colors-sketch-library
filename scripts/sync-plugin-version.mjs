import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const dest = process.argv[2] || join(ROOT, 'plugin/manifest.json')
const manifest = JSON.parse(readFileSync(join(ROOT, 'plugin/manifest.json'), 'utf8'))
manifest.version = version
writeFileSync(dest, `${JSON.stringify(manifest, null, 2)}\n`)
