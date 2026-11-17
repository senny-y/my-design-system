// 검사 3: 컴포넌트 코드의 하드코딩(색상값, px 숫자, Tailwind 임의 값) 위치 찾기
// 코드에 "예외:" 주석을 이유와 함께 적어 둔 줄(같은 줄 또는 바로 위 2줄 안)은 "허용된 예외"로 따로 세고 실패로 치지 않습니다.
import { extname } from 'node:path'
import { readText, stripComments, walk } from './util.mjs'

const NAMED_COLORS = 'white|black|red|green|blue|gray|grey|orange|yellow|purple|pink|brown|navy|teal|cyan|magenta|silver|gold'
const COLOR_PROPS = '(?:color|background(?:-color)?|border(?:-[a-z]+)*|outline(?:-color)?|fill|stroke|box-shadow)'
const NONZERO = '(?:[1-9]\\d*\\.?\\d*|0\\.\\d*[1-9]\\d*|\\.\\d*[1-9]\\d*)'

const PATTERNS = [
  { kind: '색상값(#hex)', exts: ['.css'], test: (line) => { const i = line.indexOf(':'); return i >= 0 && /#[0-9a-fA-F]{3,8}\b/.exec(line.slice(i)) } },
  { kind: '색상값(#hex)', exts: ['.tsx', '.ts'], test: (line) => /#[0-9a-fA-F]{3,8}\b/.exec(line) },
  { kind: '색상 함수(rgb·hsl 등)', exts: ['.css', '.tsx', '.ts'], test: (line) => /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\s*\(/.exec(line) },
  { kind: '색상 이름', exts: ['.css'], test: (line) => new RegExp(`${COLOR_PROPS}\\s*:[^;]*?(?<![\\w-])(?:${NAMED_COLORS})(?![\\w-])`, 'i').exec(line.replace(/var\([^)]*\)/g, '')) },
  { kind: 'px·rem 크기 숫자', exts: ['.css', '.tsx', '.ts'], test: (line) => new RegExp(`(?<![\\w.-])-?${NONZERO}(?:px|rem|em|vh|vw|vmin|vmax|pt|ch)\\b`).exec(line) },
  { kind: '시간 값(s·ms)', exts: ['.css', '.tsx', '.ts'], test: (line) => new RegExp(`(?<![\\w.-])${NONZERO}(?:ms|s)\\b`).exec(line) },
  { kind: '스타일 속의 숫자', exts: ['.tsx', '.ts'], test: (line) => new RegExp(`\\b(?:padding|margin|gap|width|height|fontSize|borderRadius|top|left|right|bottom|lineHeight|letterSpacing|minWidth|maxWidth|minHeight|maxHeight)\\w*\\s*:\\s*-?${NONZERO}\\s*[,}]`).exec(line) },
  { kind: 'Tailwind 임의 값', exts: ['.tsx', '.ts'], test: (line) => /(?<![\w-])(?:[a-z]+:)*-?[a-z][a-z0-9-]*-\[[^\]\s]+\]/.exec(line) },
]

export function scanHardcode(root, cfg) {
  const files = [...new Set(cfg.hardcode.scan.flatMap((p) => walk(root, p, cfg.hardcode.extensions)))]
  const marker = cfg.hardcode.exceptionMarker
  const findings = []

  for (const file of files) {
    const ext = extname(file)
    const original = readText(root, file).split('\n')
    const cleaned = stripComments(readText(root, file), ext).split('\n')
    cleaned.forEach((line, i) => {
      for (const pattern of PATTERNS) {
        if (!pattern.exts.includes(ext)) continue
        const hit = pattern.test(line)
        if (!hit) continue
        // 같은 줄 또는 위 2줄에 "예외:" 주석이 있으면 허용된 예외
        const context = original.slice(Math.max(0, i - 2), i + 1)
        const markerLine = context.find((l) => l.includes(marker))
        const reason = markerLine ? markerLine.replace(/^.*?예외:\s*/, '').replace(/\*\/\s*$/, '').trim() : ''
        findings.push({ file, line: i + 1, kind: pattern.kind, found: hit[0].trim(), code: original[i].trim(), allowed: Boolean(markerLine), reason })
      }
    })
  }
  return { scannedFiles: files, findings, violations: findings.filter((f) => !f.allowed), exceptions: findings.filter((f) => f.allowed) }
}
