// 디자인 시스템 검사 — 실행: npm run audit
// 불일치·하드코딩이 하나라도 나오면 종료 코드 1로 끝납니다. (배포 전에 자동으로 막으려는 용도)
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkComponents } from './lib/components-check.mjs'
import { buildGuide } from './lib/guide-builder.mjs'
import { scanHardcode } from './lib/hardcode-check.mjs'
import { buildReport, reportFileName } from './lib/report.mjs'
import { checkTokens } from './lib/tokens-check.mjs'
import { readJson } from './lib/util.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cfg = readJson(root, 'design-audit/config.json')
const startedAt = new Date()
const t0 = performance.now()

const tokens = checkTokens(root, cfg)
const components = checkComponents(root, cfg)
const hardcode = scanHardcode(root, cfg)

// 가이드: 지금 만들면 나오는 내용과 디스크의 파일이 같은지 (직접 수정하거나 npm run guide를 안 한 경우를 잡음)
const { files, rules } = buildGuide(root, cfg, components)
const stale = []
for (const f of files) {
  const abs = join(root, f.path)
  if (!existsSync(abs)) stale.push({ path: f.path, reason: '파일이 없음' })
  else if (readFileSync(abs, 'utf8') !== f.content) stale.push({ path: f.path, reason: '원본과 내용이 다름' })
}
const outDir = join(root, cfg.guide.outputDir)
if (existsSync(outDir)) {
  const expected = new Set(files.map((f) => f.path.split('/').pop()))
  for (const name of readdirSync(outDir)) if (name.endsWith('.mdx') && !expected.has(name)) stale.push({ path: join(cfg.guide.outputDir, name), reason: '더 이상 필요 없는 파일' })
}
const guide = { total: files.length, stale, missingRules: rules.filter((r) => !r.exists).map((r) => r.path) }

const failures = {
  tokens: tokens.variables.counts['불일치'] + tokens.variables.counts['Figma 전용'] + tokens.variables.counts['코드 전용'] + tokens.textStyles.counts['불일치'] + tokens.textStyles.counts['Figma 전용'] + tokens.textStyles.counts['코드 전용'],
  components: components.counts['불일치'],
  hardcode: hardcode.violations.length,
  guide: guide.stale.length + guide.missingRules.length,
}
const passed = Object.values(failures).every((n) => n === 0)
const seconds = (performance.now() - t0) / 1000

// 리포트 파일 (날짜가 들어간 이름, 같은 날 다시 돌리면 덮어씀)
const reportDir = join(root, cfg.reportsDir)
mkdirSync(reportDir, { recursive: true })
const reportName = reportFileName(startedAt)
writeFileSync(join(reportDir, reportName), buildReport({ date: startedAt, seconds, tokens, components, hardcode, guide, passed }))

// 터미널 요약
const tv = tokens.variables.counts
const ts = tokens.textStyles.counts
const line = (ok, text) => console.log(`${ok ? '✓' : '✗'} ${text}`)
console.log('\n=== 디자인 시스템 검사 ===')
line(failures.tokens === 0, `토큰: 변수 ${tokens.variables.figmaCount}개 · 텍스트 스타일 ${tokens.textStyles.figmaCount}개 — 일치 ${tv['일치'] + ts['일치']} / 불일치 ${tv['불일치'] + ts['불일치']} / Figma 전용 ${tv['Figma 전용'] + ts['Figma 전용']} / 코드 전용 ${tv['코드 전용'] + ts['코드 전용']}`)
line(failures.components === 0, `컴포넌트: ${components.components.length}개 속성 ${components.counts['일치'] + components.counts['불일치']}줄 — 일치 ${components.counts['일치']} / 불일치 ${components.counts['불일치']}`)
line(failures.hardcode === 0, `하드코딩: 파일 ${hardcode.scannedFiles.length}개 검사 — 하드코딩 ${hardcode.violations.length}건 (허용된 예외 ${hardcode.exceptions.length}건)`)
line(failures.guide === 0, `가이드: 자동 생성 ${guide.total}개 — 최신이 아닌 파일 ${guide.stale.length}개`)

// 문제가 있으면 위치까지 보여줌
const show = (title, rows) => { if (rows.length) { console.log(`\n[${title}]`); rows.slice(0, 20).forEach((r) => console.log('  - ' + r)); if (rows.length > 20) console.log(`  … 외 ${rows.length - 20}건 (리포트 참고)`) } }
show('토큰 문제', [...tokens.variables.rows, ...tokens.textStyles.rows].filter((r) => r.status !== '일치').map((r) => `${r.status} · ${r.figmaName} ↔ ${r.cssName}: ${r.note}`))
show('컴포넌트 문제', components.components.flatMap((c) => c.rows.filter((r) => r.status !== '일치').map((r) => `${c.name}.${r.figmaProp === '—' ? r.codeProp : r.figmaProp}: ${r.note}`)))
show('하드코딩 위치', hardcode.violations.map((f) => `${f.file}:${f.line} · ${f.kind} · ${f.found}`))
show('가이드 문제', [...guide.stale.map((s) => `${s.path}: ${s.reason}`), ...guide.missingRules.map((p) => `${p}: 사용 규칙 파일 없음`)])

console.log(`\n리포트: ${join(cfg.reportsDir, reportName)}  (${seconds.toFixed(2)}초)`)
console.log(passed ? '결과: 통과 ✅\n' : '결과: 실패 ❌ — 위 문제를 고친 뒤 다시 실행하세요.\n')
process.exit(passed ? 0 : 1)
