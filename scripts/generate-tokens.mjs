// Figma 변수(figma-tokens/variables.json) + 텍스트 스타일(figma-tokens/text-styles.json)
// → 토큰 CSS(src/tokens/tokens.css) 자동 변환
// 실행: npm run tokens

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = 'figma-tokens/variables.json'
const TEXT_STYLES_SOURCE = 'figma-tokens/text-styles.json'
const OUTPUT = 'src/tokens/tokens.css'

// px가 아니라 숫자 그대로 쓰는 변수 그룹 (font-weight)
const UNITLESS_GROUPS = new Set(['font-weight'])

// 글꼴 변수 뒤에 붙일 대체 글꼴 (Figma에는 없고 CSS에만 필요) — 한글 글꼴 대비
const FONT_FALLBACKS = {
  'font-family/base': '"Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif',
}

const fail = (message) => {
  console.error(`✗ ${message}`)
  process.exit(1)
}

const data = JSON.parse(readFileSync(resolve(ROOT, SOURCE), 'utf8'))
const textStyleData = JSON.parse(readFileSync(resolve(ROOT, TEXT_STYLES_SOURCE), 'utf8'))

// ---------- 변수 색인 + CSS 이름 (Code syntax와 똑같이) ----------
const byName = new Map()
for (const collection of data.collections) {
  for (const variable of collection.variables) {
    const web = variable.codeSyntax?.web
    const match = typeof web === 'string' && web.match(/^var\((--[a-z0-9-]+)\)$/)
    if (!match) fail(`Code syntax가 없거나 형식이 달라요: ${variable.name} (${web})`)
    const expected = `--${variable.name.replaceAll('/', '-')}`
    if (match[1] !== expected) fail(`Code syntax가 이름 규칙과 달라요: ${variable.name} → ${web} (기대: var(${expected}))`)
    if (byName.has(variable.name)) fail(`변수 이름이 중복돼요: ${variable.name}`)
    byName.set(variable.name, { ...variable, collection: collection.name, cssName: match[1] })
  }
}
const cssNames = new Set()
for (const v of byName.values()) {
  if (cssNames.has(v.cssName)) fail(`CSS 변수 이름이 중복돼요: ${v.cssName}`)
  cssNames.add(v.cssName)
}

// ---------- 값 변환 ----------
const toCssValue = (variable, modeName) => {
  const raw = variable.values[modeName]
  if (raw === undefined) fail(`${variable.name}: "${modeName}" 모드 값이 없어요`)
  if (typeof raw === 'object' && raw.alias) {
    const target = byName.get(raw.alias)
    if (!target) fail(`${variable.name}: 참조 대상이 없어요 (${raw.alias})`)
    if (target.type !== variable.type) fail(`${variable.name}: 참조 대상의 타입이 달라요 (${raw.alias})`)
    return `var(${target.cssName})` // 값을 복사하지 않고 참조
  }
  if (variable.type === 'COLOR') return String(raw)
  if (variable.type === 'STRING') {
    // 글꼴 이름은 따옴표로 감싸고, 대체 글꼴이 정해져 있으면 뒤에 붙임
    const fallback = FONT_FALLBACKS[variable.name]
    if (variable.name.startsWith('font-family/') && !fallback) fail(`${variable.name}: 대체 글꼴(FONT_FALLBACKS)이 정해지지 않았어요`)
    return fallback ? `"${raw}", ${fallback}` : `"${raw}"`
  }
  if (variable.type === 'FLOAT') {
    const group = variable.name.split('/')[0]
    return UNITLESS_GROUPS.has(group) ? String(raw) : `${raw}px`
  }
  return fail(`지원하지 않는 타입이에요: ${variable.name} (${variable.type})`)
}

// ---------- 정렬: 그룹은 처음 나온 순서, 그룹 안에서 숫자는 오름차순 ----------
const orderVariables = (variables) => {
  const groups = new Map()
  for (const v of variables) {
    const key = v.name.split('/').slice(0, -1).join('/')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(v)
  }
  return [...groups.values()].map((items) => {
    const numeric = items.every((v) => /^\d+$/.test(v.name.split('/').pop()))
    return numeric ? [...items].sort((a, b) => Number(a.name.split('/').pop()) - Number(b.name.split('/').pop())) : items
  })
}

// 모드 이름이 "Mode 1" 같은 기본 이름이면 모드 구분 없이 :root, light처럼 이름을 붙인 모드는 [data-theme]로 나눔
const modeSelector = (modeName, index, total) => {
  if (total === 1 && /^Mode \d+$/.test(modeName)) return ':root'
  const attr = `[data-theme="${modeName.toLowerCase().replace(/\s+/g, '-')}"]`
  return index === 0 ? `:root,\n${attr}` : attr // 첫 번째 모드가 기본값
}

// ---------- CSS 만들기 ----------
const out = []
out.push(`/*
 * 자동 생성 · 직접 수정 금지
 * 원본 파일: ${SOURCE}, ${TEXT_STYLES_SOURCE}
 * 다시 만들기: npm run tokens
 */`)

for (const collection of data.collections) {
  const groups = orderVariables(collection.variables.map((v) => byName.get(v.name)))
  collection.modes.forEach((modeName, index) => {
    const lines = []
    groups.forEach((items, i) => {
      if (i > 0) lines.push('')
      for (const v of items) lines.push(`  ${v.cssName}: ${toCssValue(v, modeName)};`)
    })
    out.push(`\n/* ${collection.name} · 모드: ${modeName} */\n${modeSelector(modeName, index, collection.modes.length)} {\n${lines.join('\n')}\n}`)
  })
}

// 텍스트 스타일 → CSS 클래스 (예: heading/lg → .text-heading-lg)
const textStyles = textStyleData.textStyles ?? []
if (textStyles.length) {
  const blocks = textStyles.map((style) => {
    const ref = (name, expectedGroup) => {
      const target = byName.get(name)
      if (!target || target.name.split('/')[0] !== expectedGroup) fail(`텍스트 스타일 ${style.name}: ${expectedGroup} 변수를 찾을 수 없어요 (${name})`)
      return `var(${target.cssName})`
    }
    const className = `.text-${style.name.replaceAll('/', '-')}`
    return `${className} {\n  font-family: ${ref(style.fontFamily, 'font-family')};\n  font-size: ${ref(style.fontSize, 'font-size')};\n  line-height: ${ref(style.lineHeight, 'line-height')};\n  font-weight: ${ref(style.fontWeight, 'font-weight')};\n}`
  })
  out.push(`\n/* 텍스트 스타일 */\n${blocks.join('\n\n')}`)
}

const css = `${out.join('\n')}\n`
const outPath = resolve(ROOT, OUTPUT)
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, css)

// ---------- 파비콘(public/favicon.svg): 색·모서리·글자 크기를 토큰 값에서 가져옴 ----------
// 파비콘은 브라우저 탭에서 따로 그려져서 페이지의 CSS 변수(var(--…))를 쓸 수 없으므로, 토큰의 "값"을 SVG에 넣습니다.
const tokenValue = (name) => {
  const variable = byName.get(name)
  if (!variable) fail(`파비콘에 쓸 토큰이 없어요: ${name}`)
  const raw = Object.values(variable.values)[0]
  if (typeof raw === 'object') fail(`파비콘에는 다른 변수를 참조하는 토큰을 쓸 수 없어요: ${name}`)
  return raw
}
const faviconSvg = `<!--
  자동 생성 · 직접 수정 금지
  원본 파일: ${SOURCE} (color/primary/600, color/neutral/0, radius/8, font-size/16)
  다시 만들기: npm run tokens
-->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="${tokenValue('radius/8')}" fill="${tokenValue('color/primary/600')}"/>
  <text x="16" y="17" fill="${tokenValue('color/neutral/0')}" font-size="${tokenValue('font-size/16')}" font-weight="700" font-family="Inter, system-ui, -apple-system, 'Segoe UI', Arial, sans-serif" text-anchor="middle" dominant-baseline="central">DS</text>
</svg>
`
mkdirSync(resolve(ROOT, 'public'), { recursive: true })
writeFileSync(resolve(ROOT, 'public/favicon.svg'), faviconSvg)

// ---------- 검증: Figma 변수 개수 = 생성된 CSS 변수 개수 ----------
const declared = new Set([...css.matchAll(/^\s+(--[a-z0-9-]+):/gm)].map((m) => m[1]))
const figmaCount = byName.size
const missing = [...cssNames].filter((n) => !declared.has(n))
const extra = [...declared].filter((n) => !cssNames.has(n))
const modeCounts = data.collections.map((c) => `${c.name} ${c.variables.length}개`).join(' · ')
console.log(`Figma 변수 ${figmaCount}개 (${modeCounts})`)
console.log(`생성된 CSS 변수 ${declared.size}개 · 텍스트 스타일 클래스 ${textStyles.length}개`)
if (missing.length || extra.length || declared.size !== figmaCount) {
  fail(`개수가 달라요. 빠짐: ${missing.join(', ') || '없음'} / 더 생김: ${extra.join(', ') || '없음'}`)
}
console.log(`✓ 개수 일치 → ${OUTPUT} · 파비콘 → public/favicon.svg`)
