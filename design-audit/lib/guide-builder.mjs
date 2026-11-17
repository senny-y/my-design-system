// Storybook Docs 가이드(MDX) 만들기 — 같은 입력이면 항상 같은 결과가 나오도록(날짜·시간을 넣지 않음) 만듭니다.
// 직접 쓰는 "사용 규칙(Do/Don't)"은 design-guide/rules/*.md 에서 읽어 오고, 그 파일은 절대 덮어쓰지 않습니다.
import { join } from 'node:path'
import { exists, readJson, readText } from './util.mjs'

const HEADER = '자동 생성 · 직접 수정 금지 · 원본 파일: figma-tokens/*.json, design-guide/rules/*.md · 다시 만들기: npm run guide'
const js = (value) => JSON.stringify(value, null, 2)
const num = (name) => Number(name.split('/').pop())
const sortNumeric = (vars) => [...vars].sort((a, b) => num(a.name) - num(b.name))

// ---------- 사용 규칙(Do/Don't) 파일 ----------
export const rulesTemplate = (name) => `# ${name} 사용 규칙

<!--
  아래에 직접 적어 주세요. "- " 뒤에 한 줄씩 쓰면 됩니다. (\`코드\`는 백틱으로 감싸면 코드 모양으로 보여요)
  이 파일은 npm run sync / npm run guide를 다시 해도 지워지거나 덮어써지지 않습니다.
-->

## Do

-

## Don't

-
`

export function parseRules(markdown) {
  const out = { dos: [], donts: [] }
  let current = null
  let last = null
  const text = markdown.replace(/<!--[\s\S]*?-->/g, '')
  for (const raw of text.split('\n')) {
    const heading = /^##\s+(.+?)\s*$/.exec(raw)
    if (heading) {
      const title = heading[1].toLowerCase().replace(/[’']/g, "'")
      current = title === 'do' ? out.dos : title === "don't" || title === 'dont' ? out.donts : null
      last = null
      continue
    }
    if (!current) continue
    const bullet = /^\s*[-*]\s+(.*)$/.exec(raw)
    if (bullet) {
      const item = bullet[1].trim()
      if (item) { current.push(item); last = current.length - 1 } else last = null
    } else if (last !== null && /^\s{2,}\S/.test(raw)) {
      current[last] += ' ' + raw.trim() // 들여쓴 다음 줄은 앞 항목에 이어 붙임
    }
  }
  return out
}

export const rulesPath = (cfg, name) => join(cfg.guide.rulesDir, `${name}.md`)

// ---------- Foundations 데이터 ----------
// codeSyntaxOf: Figma 변수 이름 → Code syntax (모드별 견본 색을 primitive CSS 변수로 그리기 위해 필요)
function tokenRows(variables, codeSyntaxOf = () => null) {
  return variables.map((v) => {
    const raw = Object.values(v.values)[0]
    const value = typeof raw === 'object' ? `${raw.alias} → ${raw.resolved ?? ''}` : typeof raw === 'number' ? (v.name.startsWith('font-weight/') ? String(raw) : `${raw}px`) : String(raw)
    const cssName = v.codeSyntax.web.replace(/^var\(/, '').replace(/\)$/, '')
    const row = { figmaName: v.name, cssName, codeSyntax: v.codeSyntax.web, value }
    // 모드가 둘 이상이면(light/dark) 모드별 참조·색·견본(primitive CSS 변수)을 함께 보여줌
    const modeNames = Object.keys(v.values)
    if (modeNames.length > 1) {
      row.modes = modeNames.map((name) => {
        const m = v.values[name]
        return { name, ref: m.alias, hex: m.resolved, swatch: codeSyntaxOf(m.alias) }
      })
    }
    return row
  })
}

const mdx = (title, imports, body) => `${imports}\n\n{/* ${HEADER} */}\n\n<Meta title="${title}" />\n\n${body}\n`

function foundationsPages(root, cfg) {
  const data = readJson(root, cfg.tokens.variables)
  const styleData = readJson(root, cfg.tokens.textStyles)
  const all = data.collections.flatMap((c) => c.variables.map((v) => ({ ...v, collection: c.name })))
  const group = (prefix) => all.filter((v) => v.name.startsWith(prefix))
  const codeSyntaxOf = (name) => all.find((v) => v.name === name)?.codeSyntax.web ?? null
  const imports = "import { Meta } from '@storybook/addon-docs/blocks'\nimport { TokenTable, TextStyleTable } from '../GuideBlocks'"
  const pages = []

  // 색
  const colorSection = (title, intro, vars, groups) => `## ${title}\n\n${intro}\n\n${groups.map((g) => `### ${g.label}\n\n<TokenTable kind="color" rows={${js(tokenRows(g.vars, codeSyntaxOf))}} />`).join('\n\n')}`
  const primGroups = ['primary', 'neutral', 'red', 'green', 'orange'].map((g) => ({ label: g, vars: sortNumeric(group(`color/${g}/`)) }))
  const semGroups = ['bg', 'text', 'border', 'status'].map((g) => ({ label: g, vars: group(`${g}/`) }))
  pages.push({
    file: 'Foundations-Colors.mdx',
    content: mdx('Foundations/Colors', imports, `# Colors\n\nFigma 이름, 코드 이름(CSS 변수), Code syntax를 한 줄에 보여줍니다. 견본의 색은 실제 토큰 CSS에서 가져옵니다.\n\n${colorSection('primitive', '원본 색상 값입니다. 컴포넌트에서는 직접 쓰지 않고 semantic을 통해서만 씁니다.', null, primGroups)}\n\n${colorSection('semantic', '용도별 이름입니다. 값은 primitive를 참조합니다. 견본은 왼쪽이 light, 오른쪽이 dark입니다. (Storybook 위쪽 도구 막대에서 모드를 바꾸면 화면 전체가 바뀝니다)', null, semGroups)}`),
  })

  const simple = (file, title, heading, intro, prefix, kind, sorted = true) => {
    const vars = sorted ? sortNumeric(group(prefix)) : group(prefix)
    pages.push({ file, content: mdx(title, imports, `# ${heading}\n\n${intro}\n\n<TokenTable kind="${kind}" rows={${js(tokenRows(vars))}} />`) })
  }
  simple('Foundations-Spacing.mdx', 'Foundations/Spacing', 'Spacing', '간격(padding, gap)에 쓰는 값입니다. 막대의 너비가 실제 값입니다.', 'spacing/', 'spacing')
  simple('Foundations-Radius.mdx', 'Foundations/Radius', 'Radius', '모서리 둥글기입니다. 999는 완전히 둥근 모양(알약)입니다.', 'radius/', 'radius')
  simple('Foundations-Size.mdx', 'Foundations/Size', 'Size', '너비·높이에 쓰는 값입니다. (간격과 용도가 달라 spacing과 따로 둡니다)', 'size/', 'size')

  // 타이포
  const refName = (name) => { const v = all.find((x) => x.name === name); return v ? v.codeSyntax.web : name }
  const styleRows = styleData.textStyles.map((s) => ({
    figmaName: s.name,
    className: `.text-${s.name.replaceAll('/', '-')}`,
    font: s.font.style,
    variables: [s.fontFamily, s.fontSize, s.lineHeight, s.fontWeight].map(refName),
  }))
  const typo = (label, prefix, kind) => `### ${label}\n\n<TokenTable kind="${kind}" rows={${js(tokenRows(sortNumeric(group(prefix))))}} />`
  pages.push({
    file: 'Foundations-Typography.mdx',
    content: mdx('Foundations/Typography', imports, `# Typography\n\n## 텍스트 스타일\n\nFigma 텍스트 스타일은 CSS 클래스로 만들어집니다. 글자에는 이 클래스를 씁니다.\n\n<TextStyleTable rows={${js(styleRows)}} />\n\n## 글자 변수\n\n${typo('font-family', 'font-family/', 'fontFamily')}\n\n${typo('font-size', 'font-size/', 'fontSize')}\n\n${typo('line-height', 'line-height/', 'none')}\n\n${typo('font-weight', 'font-weight/', 'fontWeight')}`),
  })
  return pages
}

// ---------- 컴포넌트 문서 ----------
function componentPages(root, cfg, comps) {
  const pages = []
  const rules = []
  for (const c of comps.components) {
    const rp = rulesPath(cfg, c.name)
    const fileExists = exists(root, rp)
    const parsed = fileExists ? parseRules(readText(root, rp)) : { dos: [], donts: [] }
    rules.push({ name: c.name, path: rp, exists: fileExists, ...parsed })
    const cc = cfg.components.find((x) => x.name === c.name)
    const rows = c.rows.map((r) => ({ figmaProp: r.figmaProp, figmaKind: r.figmaKind ?? '—', figmaValues: r.figmaValues ?? '—', figmaDefault: r.figmaDefault ?? '—', codeProp: r.codeProp ?? '—', codeType: r.codeType ?? '—', codeDefault: r.codeDefault ?? '—', status: r.status, note: r.note ?? '' }))
    const storiesImport = `../../${cc.dir.replace(/^src\//, '')}/${c.name}.stories`
    const body = `# ${c.name}

<Lead text={${js(c.description)}} figmaNodeId={${js(c.figmaNodeId)}} />

## 미리보기 (라이트 / 다크)

위쪽 도구 막대의 모드와 상관없이 라이트와 다크를 항상 같이 보여줍니다.

<ThemePreview>
  <Story of={Stories.${cfg.guide.previewStory}} />
</ThemePreview>

## Figma 속성 ↔ 코드 props

Figma 속성 이름·값·기본값이 코드 props와 같은지 \`npm run audit\`이 확인한 결과입니다.

<PropsTable rows={${js(rows)}} />

## 접근성

<A11yNotes items={${js(c.accessibilityNotes)}} />

## 사용 규칙 (Do / Don't)

<DoDont dos={${js(parsed.dos)}} donts={${js(parsed.donts)}} source={${js(rp)}} />

## 직접 바꿔보기

<Controls of={Stories.Playground} />`
    pages.push({
      file: `Components-${c.name}.mdx`,
      content: `import { Meta, Story, Controls } from '@storybook/addon-docs/blocks'\nimport * as Stories from '${storiesImport}'\nimport { Lead, ThemePreview, PropsTable, A11yNotes, DoDont } from '../GuideBlocks'\n\n{/* ${HEADER} */}\n\n<Meta of={Stories} name="Docs" />\n\n${body}\n`,
    })
  }
  return { pages, rules }
}

// 가이드 파일 전체를 만들어 돌려줌 (파일에 쓰는 일은 하지 않음)
export function buildGuide(root, cfg, comps) {
  const foundations = foundationsPages(root, cfg)
  const { pages, rules } = componentPages(root, cfg, comps)
  const files = [...foundations, ...pages].map((p) => ({ path: join(cfg.guide.outputDir, p.file), content: p.content }))
  return { files, rules }
}
