// Storybook Docs 가이드 자동 생성 — 실행: npm run guide
// - src/docs/generated/*.mdx 를 새로 만듭니다. (직접 수정 금지, 항상 덮어씀)
// - design-guide/rules/*.md (사용 규칙 Do/Don't)는 없을 때만 빈 칸 양식으로 만들고, 있으면 절대 건드리지 않습니다.
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkComponents } from './lib/components-check.mjs'
import { buildGuide, rulesTemplate } from './lib/guide-builder.mjs'
import { readJson } from './lib/util.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cfg = readJson(root, 'design-audit/config.json')
const start = performance.now()

const comps = checkComponents(root, cfg)

// 1) 사용 규칙 파일: 없을 때만 빈 양식을 만듦
mkdirSync(join(root, cfg.guide.rulesDir), { recursive: true })
let created = 0
let kept = 0
for (const c of comps.components) {
  const path = join(root, cfg.guide.rulesDir, `${c.name}.md`)
  if (existsSync(path)) kept++
  else { writeFileSync(path, rulesTemplate(c.name)); created++ }
}

// 2) 가이드 파일 만들기 (이전에 만든 파일 중 이제 필요 없는 것은 지움)
const { files, rules } = buildGuide(root, cfg, comps)
const outDir = join(root, cfg.guide.outputDir)
mkdirSync(outDir, { recursive: true })
const keep = new Set(files.map((f) => f.path.split('/').pop()))
let removed = 0
for (const name of readdirSync(outDir)) {
  if (name.endsWith('.mdx') && !keep.has(name)) { rmSync(join(outDir, name)); removed++ }
}
for (const f of files) writeFileSync(join(root, f.path), f.content)

const filled = rules.filter((r) => r.dos.length + r.donts.length > 0).length
console.log(`✓ 가이드 ${files.length}개 생성 → ${cfg.guide.outputDir}${removed ? ` (오래된 파일 ${removed}개 삭제)` : ''}`)
console.log(`  사용 규칙 파일: 기존 ${kept}개 유지(덮어쓰지 않음) · 새 양식 ${created}개 생성 · 내용이 채워진 것 ${filled}/${rules.length}개`)
console.log(`  (${((performance.now() - start) / 1000).toFixed(2)}초)`)
