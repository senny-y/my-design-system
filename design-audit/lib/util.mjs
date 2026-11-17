// 검사·가이드 스크립트가 함께 쓰는 작은 도구들
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

export const readText = (root, rel) => readFileSync(join(root, rel), 'utf8')
export const readJson = (root, rel) => JSON.parse(readText(root, rel))
export const exists = (root, rel) => existsSync(join(root, rel))

// 주석 안의 글자는 검사하지 않도록 지움 (줄 번호가 달라지지 않게 줄바꿈은 그대로 둠)
const blank = (m) => m.replace(/[^\n]/g, ' ')
export const stripBlockComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, blank)
const stripLineComments = (text) => text.replace(/(^|[^:'"`])\/\/.*$/gm, (m, p1) => p1 + blank(m.slice(p1.length)))
export const stripComments = (text, ext) => (ext === '.css' ? stripBlockComments(text) : stripLineComments(stripBlockComments(text)))

// 폴더 안의 파일을 모두 찾아서 (프로젝트 기준) 상대 경로로 돌려줌
export function walk(root, rel, extensions) {
  const abs = join(root, rel)
  if (!existsSync(abs)) return []
  if (statSync(abs).isFile()) return extensions.includes(extname(abs)) ? [rel] : []
  const out = []
  for (const name of readdirSync(abs).sort()) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    out.push(...walk(root, join(rel, name), extensions))
  }
  return out
}

const pad = (n) => String(n).padStart(2, '0')
export const localDate = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const localDateTime = (d = new Date()) => `${localDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

export const countBy = (rows, key, labels) => Object.fromEntries(labels.map((l) => [l, rows.filter((r) => r[key] === l).length]))
