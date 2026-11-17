// 검사 결과를 마크다운 리포트로 만들기
import { localDate, localDateTime } from './util.mjs'

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
const table = (headers, rows) => `| ${headers.join(' | ')} |\n|${headers.map(() => '---').join('|')}|\n${rows.map((r) => `| ${r.map(esc).join(' | ')} |`).join('\n')}`
const mark = (status) => (status === '일치' ? '✅ 일치' : `❌ ${status}`)

export const reportFileName = (date = new Date()) => `audit-${localDate(date)}.md`

export function buildReport({ date, seconds, tokens, components, hardcode, guide, passed }) {
  const out = []
  out.push(`# 디자인 시스템 검사 리포트 — ${localDate(date)}`)
  out.push(`- 실행 시각: ${localDateTime(date)}\n- 걸린 시간: ${seconds.toFixed(2)}초\n- 결과: **${passed ? '✅ 통과' : '❌ 실패'}**`)

  const tv = tokens.variables.counts
  const ts = tokens.textStyles.counts
  out.push('## 요약')
  out.push(table(['검사', '일치', '불일치', 'Figma 전용', '코드 전용'], [
    ['Figma 변수 ↔ 토큰 CSS', tv['일치'], tv['불일치'], tv['Figma 전용'], tv['코드 전용']],
    ['Figma 텍스트 스타일 ↔ 글자 클래스', ts['일치'], ts['불일치'], ts['Figma 전용'], ts['코드 전용']],
  ]))
  out.push(table(['검사', '일치', '불일치'], [['Figma 컴포넌트 속성 ↔ 코드 props', components.counts['일치'], components.counts['불일치']]]))
  out.push(table(['검사', '검사한 파일', '하드코딩', '허용된 예외(주석 있음)'], [['컴포넌트 코드 하드코딩', hardcode.scannedFiles.length, hardcode.violations.length, hardcode.exceptions.length]]))
  out.push(table(['검사', '생성 파일', '최신이 아닌 파일'], [['가이드(자동 생성 파일) 최신 여부', guide.total, guide.stale.length]]))

  out.push('## 1. 토큰 (Figma ↔ CSS)')
  out.push(`Figma 변수 ${tokens.variables.figmaCount}개 · CSS 변수 ${tokens.variables.cssCount}개 / Figma 텍스트 스타일 ${tokens.textStyles.figmaCount}개 · CSS 글자 클래스 ${tokens.textStyles.cssCount}개`)
  const bad = [...tokens.variables.rows, ...tokens.textStyles.rows].filter((r) => r.status !== '일치')
  out.push(bad.length ? `### 문제 있는 항목\n\n${table(['Figma 이름', 'CSS 이름', '상태', '기대값', '실제값', '설명'], bad.map((r) => [r.figmaName, r.cssName, mark(r.status), r.expected, r.actual, r.note]))}` : '문제 있는 항목이 없습니다.')
  out.push(`<details><summary>전체 변수 목록 (${tokens.variables.rows.length}개)</summary>\n\n${table(['Figma 이름', 'CSS 이름', '상태', '값'], tokens.variables.rows.map((r) => [r.figmaName, r.cssName, mark(r.status), r.actual]))}\n\n</details>`)
  out.push(`<details><summary>전체 텍스트 스타일 (${tokens.textStyles.rows.length}개)</summary>\n\n${table(['Figma 이름', 'CSS 클래스', '상태', '값'], tokens.textStyles.rows.map((r) => [r.figmaName, r.cssName, mark(r.status), r.actual]))}\n\n</details>`)

  out.push('## 2. 컴포넌트 (Figma 속성 ↔ 코드 props)')
  for (const c of components.components) {
    out.push(`### ${c.name}`)
    out.push(table(['Figma 속성', 'Figma 값', 'Figma 기본값', '코드 props', '코드 타입', '코드 기본값', '결과', '설명'], c.rows.map((r) => [r.figmaProp, r.figmaValues ?? '—', r.figmaDefault ?? '—', r.codeProp ?? '—', r.codeType ?? '—', r.codeDefault ?? '—', mark(r.status), r.note])))
  }

  out.push('## 3. 하드코딩')
  out.push(`검사한 파일 ${hardcode.scannedFiles.length}개: ${hardcode.scannedFiles.map((f) => `\`${f}\``).join(', ')}`)
  out.push(hardcode.violations.length ? `### 하드코딩 위치\n\n${table(['위치', '종류', '찾은 값', '코드'], hardcode.violations.map((f) => [`${f.file}:${f.line}`, f.kind, f.found, f.code]))}` : '하드코딩이 없습니다.')
  if (hardcode.exceptions.length) out.push(`### 허용된 예외 (코드에 "예외:" 주석으로 이유를 적어 둔 것)\n\n${table(['위치', '종류', '찾은 값', '이유'], hardcode.exceptions.map((f) => [`${f.file}:${f.line}`, f.kind, f.found, f.reason]))}`)

  out.push('## 4. 가이드 최신 여부')
  out.push(guide.stale.length ? `최신이 아닌 파일 (npm run guide 필요, 또는 직접 수정한 흔적):\n\n${guide.stale.map((s) => `- \`${s.path}\` — ${s.reason}`).join('\n')}` : `자동 생성 가이드 ${guide.total}개가 모두 원본과 같습니다.`)
  if (guide.missingRules.length) out.push(`사용 규칙 파일이 없음: ${guide.missingRules.map((p) => `\`${p}\``).join(', ')}`)
  return out.join('\n\n') + '\n'
}
