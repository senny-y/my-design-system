// 검사 2: Figma 컴포넌트 속성·값·기본값(figma-tokens/components.json) ↔ 코드 props(src/components/*)
// 코드는 TypeScript 파일의 글자를 읽어서 분석합니다. (이 프로젝트의 작성 규칙을 따른 파일만 읽을 수 있어요)
import { countBy, exists, readJson, readText, stripComments } from './util.mjs'

export const COMPONENT_LABELS = ['일치', '불일치']

// 중괄호 { } 가 짝이 맞는 끝 위치를 찾음
function matchBrace(text, openIndex) {
  let depth = 0
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}' && --depth === 0) return i
  }
  throw new Error('중괄호 짝을 찾지 못했어요')
}

// export type ButtonVariant = 'primary' | 'secondary' → { ButtonVariant: ['primary', 'secondary'] }
function parseUnionAliases(text) {
  const aliases = {}
  for (const m of text.matchAll(/export type (\w+)\s*=\s*([^\n;]+)/g)) {
    const parts = m[2].split('|').map((p) => p.trim())
    if (parts.every((p) => /^(['"]).*\1$/.test(p))) aliases[m[1]] = parts.map((p) => p.slice(1, -1))
  }
  return aliases
}

function parseInterface(text, name) {
  const at = text.search(new RegExp(`interface\\s+${name}\\b`))
  if (at < 0) throw new Error(`${name} 인터페이스를 찾지 못했어요`)
  const open = text.indexOf('{', at)
  const body = text.slice(open + 1, matchBrace(text, open))
  const props = new Map()
  for (const line of body.split('\n')) {
    const m = /^\s*([A-Za-z_]\w*)(\?)?\s*:\s*(.+?)\s*;?\s*$/.exec(line)
    if (m) props.set(m[1], { optional: Boolean(m[2]), type: m[3] })
  }
  return props
}

function parseDefaults(text, componentName) {
  const at = text.search(new RegExp(`export function ${componentName}\\s*\\(`))
  if (at < 0) throw new Error(`${componentName} 컴포넌트 함수를 찾지 못했어요`)
  const open = text.indexOf('{', at)
  const body = text.slice(open + 1, matchBrace(text, open))
  // 한 줄로 쓴 선언도 읽도록, 줄이 아니라 "괄호 밖의 쉼표" 기준으로 나눔
  const parts = []
  let depth = 0
  let quote = null
  let from = 0
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]
    if (quote) { if (ch === quote) quote = null; continue }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch
    else if ('([{<'.includes(ch)) depth++
    else if (')]}>'.includes(ch) && !(ch === '>' && body[i - 1] === '=')) depth--
    else if (ch === ',' && depth === 0) { parts.push(body.slice(from, i)); from = i + 1 }
  }
  parts.push(body.slice(from))
  const defaults = new Map()
  for (const part of parts) {
    const m = /^\s*([A-Za-z_]\w*)\s*=\s*([\s\S]+?)\s*$/.exec(part)
    if (m) defaults.set(m[1], m[2].replace(/^(['"])(.*)\1$/, '$2'))
  }
  return defaults
}

const kindLabel = (fp) => {
  if (fp.type === 'BOOLEAN') return 'Boolean 속성'
  if (fp.type === 'TEXT') return '텍스트 속성'
  const tf = fp.values.length === 2 && fp.values.includes('true') && fp.values.includes('false')
  return tf ? 'variant (true/false)' : 'variant'
}

export function checkComponents(root, cfg) {
  const spec = readJson(root, cfg.componentsSource)
  const results = []

  for (const comp of cfg.components) {
    const figma = spec.components.find((c) => c.name === comp.name)
    const sourcePath = `${comp.dir}/${comp.name}.tsx`
    const cssPath = `${comp.dir}/${comp.name}.module.css`
    const base = { name: comp.name, files: { source: sourcePath, css: cssPath, stories: `${comp.dir}/${comp.name}.stories.tsx` } }

    if (!figma) {
      results.push({ ...base, description: '', accessibilityNotes: [], figmaNodeId: null, rows: [{ figmaProp: '(컴포넌트 전체)', status: '불일치', note: `Figma 내보내기(${cfg.componentsSource})에 ${comp.name}이(가) 없음` }] })
      continue
    }
    if (!exists(root, sourcePath)) {
      results.push({ ...base, description: figma.description, accessibilityNotes: figma.accessibilityNotes, figmaNodeId: figma.figmaNodeId, rows: [{ figmaProp: '(컴포넌트 전체)', status: '불일치', note: `코드 파일이 없음: ${sourcePath}` }] })
      continue
    }

    const text = stripComments(readText(root, sourcePath), '.tsx')
    const cssText = exists(root, cssPath) ? stripComments(readText(root, cssPath), '.css') : ''
    const aliases = parseUnionAliases(text)
    const codeProps = parseInterface(text, comp.propsInterface)
    const defaults = parseDefaults(text, comp.name)
    const rows = []
    const matchedProps = new Set()

    for (const fp of figma.properties) {
      const row = { figmaProp: fp.name, figmaKind: kindLabel(fp), figmaValues: fp.type === 'VARIANT' ? fp.values.join(' | ') : fp.type === 'BOOLEAN' ? 'true | false' : '글자', figmaDefault: String(fp.default), codeProp: '—', codeType: '—', codeDefault: '—', status: '일치', note: '' }
      const problems = []

      if (comp.cssStateProps.includes(fp.name)) {
        // Figma state(default·hover·focus)는 props가 아니라 CSS 상태여야 함
        row.codeProp = '— (CSS 상태)'
        if (codeProps.has(fp.name)) problems.push(`코드에 ${fp.name} prop이 있음 (CSS 상태여야 함)`)
        const found = []
        for (const value of fp.values.filter((v) => v !== fp.default)) {
          const selectors = cfg.stateSelectors[value] ?? []
          const hit = selectors.find((s) => cssText.includes(s))
          if (hit) found.push(`${value} → ${hit}`)
          else problems.push(`CSS에 ${value} 상태(${selectors.join(' 또는 ') || '선택자 미지정'})가 없음`)
        }
        row.codeType = 'CSS 상태'
        row.codeDefault = fp.default
        row.note = problems.length ? '' : found.join(', ')
      } else if (!codeProps.has(fp.name)) {
        problems.push(`코드 props에 ${fp.name}이(가) 없음`)
      } else {
        matchedProps.add(fp.name)
        const cp = codeProps.get(fp.name)
        const codeDefault = defaults.get(fp.name)
        row.codeProp = fp.name + (cp.optional ? '?' : '')
        row.codeType = cp.type
        row.codeDefault = codeDefault ?? '없음'
        const isTrueFalse = fp.type === 'VARIANT' && fp.values.length === 2 && fp.values.includes('true') && fp.values.includes('false')

        if (fp.type === 'TEXT') {
          if (cp.type !== 'string') problems.push(`타입이 string이 아님 (${cp.type})`)
          if (codeDefault !== undefined) problems.push('글자 속성에 코드 기본값이 있음 (Figma 기본 글자는 예시 문구라서 코드는 기본값 없이 받아야 함)')
          row.note = '글자 기본값은 예시 문구 — 코드는 기본값 없음'
        } else if (fp.type === 'BOOLEAN' || isTrueFalse) {
          if (cp.type !== 'boolean') problems.push(`타입이 boolean이 아님 (${cp.type})`)
          if (codeDefault !== String(fp.default)) problems.push(`기본값이 다름 (Figma ${fp.default} ≠ 코드 ${codeDefault ?? '없음'})`)
        } else {
          const literals = aliases[cp.type]
          if (!literals) problems.push(`타입이 값 목록(유니온)이 아님 (${cp.type})`)
          else {
            const missing = fp.values.filter((v) => !literals.includes(v))
            const extra = literals.filter((v) => !fp.values.includes(v))
            if (missing.length) problems.push(`코드에 없는 값: ${missing.join(', ')}`)
            if (extra.length) problems.push(`Figma에 없는 값: ${extra.join(', ')}`)
            row.codeType = literals.join(' | ')
          }
          if (codeDefault !== String(fp.default)) problems.push(`기본값이 다름 (Figma ${fp.default} ≠ 코드 ${codeDefault ?? '없음'})`)
        }
      }
      if (problems.length) { row.status = '불일치'; row.note = problems.join(' / ') }
      rows.push(row)
    }

    // 코드에만 있는 props
    for (const [name, cp] of codeProps) {
      if (matchedProps.has(name) || comp.cssStateProps.includes(name)) continue
      const reason = comp.codeOnlyProps[name]
      rows.push({
        figmaProp: '—', figmaKind: '—', figmaValues: '—', figmaDefault: '—',
        codeProp: name + (cp.optional ? '?' : ''), codeType: cp.type, codeDefault: defaults.get(name) ?? '없음',
        status: reason ? '일치' : '불일치', note: reason ? `코드 전용 (허용): ${reason}` : 'Figma에 없는 코드 prop — 허용하려면 design-audit/config.json의 codeOnlyProps에 이유와 함께 적기',
      })
    }
    results.push({ ...base, description: figma.description, accessibilityNotes: figma.accessibilityNotes, figmaNodeId: figma.figmaNodeId, rows })
  }

  const allRows = results.flatMap((r) => r.rows)
  return { components: results, counts: countBy(allRows, 'status', COMPONENT_LABELS) }
}
