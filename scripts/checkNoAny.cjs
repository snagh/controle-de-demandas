const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SRC = path.join(ROOT, 'src')
const allowed = new Set([path.join(SRC, 'supabaseHelpers.ts')])

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
        const full = path.join(dir, e.name)
        if (e.isDirectory()) {
            if (e.name === 'dist' || e.name === 'node_modules') continue
            walk(full)
        } else if (/\.tsx?$/.test(e.name)) {
            if (allowed.has(full)) continue
            const content = fs.readFileSync(full, 'utf8')
            const lines = content.split(/\r?\n/)
            lines.forEach((ln, idx) => {
                if (ln.includes('as any')) {
                    console.error(`${full}:${idx + 1}: found 'as any'`)
                    process.exitCode = 2
                }
            })
        }
    }
}

walk(SRC)

if (!process.exitCode) {
    console.log('No disallowed `as any` occurrences found.')
}
