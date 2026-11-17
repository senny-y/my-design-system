// 검사 1: Figma 변수·텍스트 스타일(JSON) ↔ 토큰 CSS(src/tokens/tokens.css)
// 변환 스크립트(scripts/generate-tokens.mjs)와 따로 "기대값"을 계산해서, 생성기 오류나 CSS를 손으로 고친 흔적을 잡아냅니다.
import { countBy, readJson, readText, stripBlockComments } from './util.mjs'

export const TOKEN_LABELS = ['일치', '불일치', 'Figma 전용', '코드 전용']

const norm = (s) => s.replace(/\s+/g, ' ').trim()
const cssNameOf = (variable) => {
  const m = /^var\((--[a-z0-9-]+)\)$/.exec(variable.codeSyntax?.web ?? '')
  return m ? m[1] : null
}
const UNITLESS = new Set(['font-weight'])

// 모드 이름이 "Mode 1" 같은 기본 이름이면 :root, light처럼 이름을 붙인 모드는 [data-theme="light"]
const modeSelector = (modeName, total) => (total === 1 && /^Mode \d+$/.test(modeName) ? ':root' : `[data-theme="${modeName.toLowerCase().replace(/\s+/g, '-')}"]`)

function parseCss(text) {
  const rules = []
  for (const m of stripBlockComments(text).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = m[1].split(',').map(norm).filter(Boolean)
    const decls = []
    for (const d of m[2].split(';')) {
      const i = d.indexOf(':')
      if (i > 0) decls.push([norm(d.slice(0, i)), norm(d.slice(i + 1))])
    }
    rules.push({ selectors, decls })
  }
  return rules
}

export function checkTokens(root, cfg) {
  const data = readJson(root, cfg.tokens.variables)
  const styleData = readJson(root, cfg.tokens.textStyles)
  const rules = parseCss(readText(root, cfg.tokens.css))

  const declared = new Map() // CSS 변수 이름 → [{ selectors, value }]
  const classes = new Map() // .text-… → Map(속성 → 값)
  for (const rule of rules) {
    for (const [prop, value] of rule.decls) {
      if (prop.startsWith('--')) {
        if (!declared.has(prop)) declared.set(prop, [])
        declared.get(prop).push({ selectors: rule.selectors, value })
      }
    }
    for (const sel of rule.selectors) {
      if (sel.startsWith('.text-')) {
        if (!classes.has(sel)) classes.set(sel, new Map())
        for (const [prop, value] of rule.decls) classes.get(sel).set(prop, value)
      }
    }
  }

  const byName = new Map()
  for (const collection of data.collections) {
    for (const variable of collection.variables) byName.set(variable.name, { ...variable, collection, cssName: cssNameOf(variable) })
  }

  const expectedValue = (variable, modeName) => {
    const raw = variable.values[modeName]
    if (raw === undefined) return { error: `Figma에 "${modeName}" 모드 값이 없음` }
    if (typeof raw === 'object' && raw.alias) {
      const target = byName.get(raw.alias)
      return target?.cssName ? { exact: `var(${target.cssName})` } : { error: `참조 대상 없음: ${raw.alias}` }
    }
    if (variable.type === 'COLOR') return { exact: String(raw), ignoreCase: true }
    if (variable.type === 'STRING') return { startsWith: `"${raw}"` }
    return { exact: UNITLESS.has(variable.name.split('/')[0]) ? String(raw) : `${raw}px` }
  }
  const matches = (exp, actual) => {
    if (exp.startsWith !== undefined) return actual.startsWith(exp.startsWith)
    return exp.ignoreCase ? actual.toLowerCase() === exp.exact.toLowerCase() : actual === exp.exact
  }
  const show = (exp) => exp.exact ?? `${exp.startsWith}… (대체 글꼴 포함)`

  // ----- 변수 -----
  const variableRows = []
  for (const variable of byName.values()) {
    const figmaName = variable.name
    const collection = variable.collection
    const ruleName = `--${figmaName.replaceAll('/', '-')}`
    if (!variable.cssName || variable.cssName !== ruleName) {
      variableRows.push({ figmaName, cssName: variable.cssName ?? '—', status: '불일치', expected: ruleName, actual: variable.codeSyntax?.web ?? '(Code syntax 없음)', note: 'Code syntax가 이름 규칙(/ → -)과 다르거나 없음' })
      continue
    }
    const found = declared.get(variable.cssName)
    if (!found) {
      variableRows.push({ figmaName, cssName: variable.cssName, status: 'Figma 전용', expected: '(CSS에 있어야 함)', actual: '—', note: 'CSS에 없음 — npm run tokens 필요' })
      continue
    }
    const problems = []
    const expectedParts = []
    const actualParts = []
    collection.modes.forEach((modeName) => {
      const exp = expectedValue(variable, modeName)
      const sel = modeSelector(modeName, collection.modes.length)
      const hit = found.find((f) => f.selectors.includes(sel))
      if (exp.error) { problems.push(exp.error); return }
      expectedParts.push(`${modeName}: ${show(exp)}`)
      if (!hit) { problems.push(`${sel} 블록에 없음`); actualParts.push(`${modeName}: (없음)`); return }
      actualParts.push(`${modeName}: ${hit.value}`)
      if (!matches(exp, hit.value)) problems.push(`${modeName} 값이 다름`)
    })
    variableRows.push({ figmaName, cssName: variable.cssName, status: problems.length ? '불일치' : '일치', expected: expectedParts.join(' · '), actual: actualParts.join(' · '), note: problems.join(', ') })
  }
  const known = new Set([...byName.values()].map((v) => v.cssName).filter(Boolean))
  for (const cssName of declared.keys()) {
    if (!known.has(cssName)) variableRows.push({ figmaName: '—', cssName, status: '코드 전용', expected: '(Figma에 없음)', actual: declared.get(cssName)[0].value, note: 'Figma 변수에 없는 CSS 변수' })
  }

  // ----- 텍스트 스타일 -----
  const styleRows = []
  const expectedClasses = new Set()
  for (const style of styleData.textStyles) {
    const className = `.text-${style.name.replaceAll('/', '-')}`
    expectedClasses.add(className)
    const ref = (name) => (byName.get(name)?.cssName ? `var(${byName.get(name).cssName})` : `(변수 없음: ${name})`)
    const expected = { 'font-family': ref(style.fontFamily), 'font-size': ref(style.fontSize), 'line-height': ref(style.lineHeight), 'font-weight': ref(style.fontWeight) }
    const actual = classes.get(className)
    if (!actual) {
      styleRows.push({ figmaName: style.name, cssName: className, status: 'Figma 전용', expected: JSON.stringify(expected), actual: '—', note: 'CSS에 클래스가 없음' })
      continue
    }
    const wrong = Object.entries(expected).filter(([prop, value]) => actual.get(prop) !== value).map(([prop]) => prop)
    styleRows.push({ figmaName: style.name, cssName: className, status: wrong.length ? '불일치' : '일치', expected: Object.values(expected).join(' / '), actual: [...actual.values()].join(' / '), note: wrong.length ? `다른 속성: ${wrong.join(', ')}` : '' })
  }
  for (const className of classes.keys()) {
    if (!expectedClasses.has(className)) styleRows.push({ figmaName: '—', cssName: className, status: '코드 전용', expected: '(Figma 텍스트 스타일에 없음)', actual: '—', note: 'Figma에 없는 글자 클래스' })
  }

  return {
    variables: { rows: variableRows, counts: countBy(variableRows, 'status', TOKEN_LABELS), figmaCount: byName.size, cssCount: declared.size },
    textStyles: { rows: styleRows, counts: countBy(styleRows, 'status', TOKEN_LABELS), figmaCount: styleData.textStyles.length, cssCount: classes.size },
  }
}
