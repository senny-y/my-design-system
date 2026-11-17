// 자동 생성 가이드(src/docs/generated/*.mdx)가 가져다 쓰는 화면 조각들입니다. (직접 쓰는 파일)
// 이 파일의 색·간격·radius·크기·글자도 토큰만 사용합니다.
import type { CSSProperties, ReactNode } from 'react'

const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse' }
const cellStyle: CSSProperties = {
  padding: 'var(--spacing-8) var(--spacing-12)',
  borderBottom: 'var(--spacing-1) solid var(--border-default)',
  textAlign: 'left',
  verticalAlign: 'middle',
}
const headStyle: CSSProperties = { ...cellStyle, color: 'var(--text-subtle)' }

function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} scope="col" className="text-label-md" style={headStyle}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

// ---------- Foundations: 토큰 표 ----------
export type TokenKind = 'color' | 'spacing' | 'radius' | 'size' | 'fontSize' | 'fontFamily' | 'fontWeight' | 'none'
export interface TokenRow {
  figmaName: string
  cssName: string
  codeSyntax: string
  value: string
  /** 모드가 둘 이상인 변수(semantic: light·dark)의 모드별 값 */
  modes?: ModeValue[]
}

export interface ModeValue {
  name: string
  /** 참조하는 primitive의 Figma 이름 (예: color/neutral/0) */
  ref: string
  /** 실제 색 (예: #FFFFFF) */
  hex: string
  /** 견본을 그릴 primitive의 Code syntax (예: var(--color-neutral-0)) — 모드와 상관없이 항상 같은 색 */
  swatch: string | null
}

const swatchBox: CSSProperties = {
  display: 'block',
  width: 'var(--size-24)',
  height: 'var(--size-24)',
  borderRadius: 'var(--radius-4)',
  boxShadow: 'inset 0 0 0 var(--spacing-1) var(--border-default)',
}

// light / dark 견본을 나란히 (현재 Storybook이 어떤 모드든 두 색 모두 보임)
function ModeSwatches({ modes }: { modes: ModeValue[] }) {
  return (
    <span style={{ display: 'flex', gap: 'var(--spacing-8)' }}>
      {modes.map((mode) => (
        <span key={mode.name} role="img" aria-label={`${mode.name} ${mode.hex}`} title={`${mode.name} ${mode.hex}`} style={{ ...swatchBox, background: mode.swatch ?? 'none' }} />
      ))}
    </span>
  )
}

function Sample({ kind, codeSyntax }: { kind: TokenKind; codeSyntax: string }) {
  const box: CSSProperties = { display: 'block', width: 'var(--size-24)', height: 'var(--size-24)' }
  switch (kind) {
    case 'color':
      return <span style={{ ...swatchBox, background: codeSyntax }} />
    case 'spacing':
      return <span style={{ display: 'block', width: codeSyntax, height: 'var(--size-16)', background: 'var(--bg-primary)' }} />
    case 'radius':
      return <span style={{ ...box, background: 'var(--bg-primary)', borderRadius: codeSyntax }} />
    case 'size':
      return <span style={{ display: 'block', width: codeSyntax, height: codeSyntax, background: 'var(--bg-primary)', borderRadius: 'var(--radius-4)' }} />
    case 'fontSize':
      return <span style={{ fontSize: codeSyntax }}>Aa</span>
    case 'fontFamily':
      return <span style={{ fontFamily: codeSyntax }}>Aa 가나다</span>
    case 'fontWeight':
      return <span style={{ fontWeight: codeSyntax }}>Aa</span>
    default:
      return null
  }
}

export function TokenTable({ kind, rows }: { kind: TokenKind; rows: TokenRow[] }) {
  const hasModes = rows.some((row) => row.modes)
  return (
    <Table headers={[hasModes ? '견본 (light · dark)' : '견본', 'Figma 이름', '코드 이름', 'Code syntax', hasModes ? '모드별 값 / 참조' : '값 / 참조']}>
      {rows.map((row) => (
        <tr key={row.figmaName}>
          <td style={cellStyle}>{row.modes ? <ModeSwatches modes={row.modes} /> : <Sample kind={kind} codeSyntax={row.codeSyntax} />}</td>
          <td style={cellStyle} className="text-body-sm">
            {row.figmaName}
          </td>
          <td style={cellStyle}>
            <code>{row.cssName}</code>
          </td>
          <td style={cellStyle}>
            <code>{row.codeSyntax}</code>
          </td>
          <td style={cellStyle} className="text-body-sm">
            {row.modes
              ? row.modes.map((mode) => (
                  <div key={mode.name}>
                    <strong>{mode.name}</strong> · {mode.ref.replace('color/', '')} → {mode.hex}
                  </div>
                ))
              : row.value}
          </td>
        </tr>
      ))}
    </Table>
  )
}

export interface TextStyleRow {
  figmaName: string
  className: string
  font: string
  variables: string[]
}

export function TextStyleTable({ rows }: { rows: TextStyleRow[] }) {
  return (
    <Table headers={['견본', 'Figma 이름', '코드 이름 (클래스)', '쓰는 변수 (Code syntax)']}>
      {rows.map((row) => (
        <tr key={row.figmaName}>
          <td style={cellStyle}>
            {/* Storybook 문서의 기본 글꼴이 덮어쓰지 못하도록 글꼴 토큰을 직접 지정 */}
            <span className={row.className.slice(1)} style={{ fontFamily: 'var(--font-family-base)' }}>
              가나다 Aa The quick brown fox
            </span>
          </td>
          <td style={cellStyle} className="text-body-sm">
            {row.figmaName}
            <br />
            {row.font}
          </td>
          <td style={cellStyle}>
            <code>{row.className}</code>
          </td>
          <td style={cellStyle}>
            {row.variables.map((v) => (
              <div key={v}>
                <code>{v}</code>
              </div>
            ))}
          </td>
        </tr>
      ))}
    </Table>
  )
}

// ---------- 컴포넌트 문서 ----------
export function Lead({ text, figmaNodeId }: { text: string; figmaNodeId: string | null }) {
  return (
    <div style={{ marginBottom: 'var(--spacing-16)' }}>
      <p className="text-body-md" style={{ margin: 0 }}>
        {text}
      </p>
      {figmaNodeId && (
        <p className="text-body-sm" style={{ margin: 0, marginTop: 'var(--spacing-8)', color: 'var(--text-subtle)' }}>
          Figma 컴포넌트 세트 ID: <code>{figmaNodeId}</code>
        </p>
      )}
    </div>
  )
}

export interface PropRow {
  figmaProp: string
  figmaKind: string
  figmaValues: string
  figmaDefault: string
  codeProp: string
  codeType: string
  codeDefault: string
  status: string
  note: string
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <Table headers={['Figma 속성', 'Figma 값', 'Figma 기본값', '코드 props', '코드 타입', '코드 기본값', '결과']}>
      {rows.map((row) => {
        const ok = row.status === '일치'
        return (
          <tr key={`${row.figmaProp}-${row.codeProp}`}>
            <td style={cellStyle}>
              <code>{row.figmaProp}</code>
              <div className="text-body-sm" style={{ color: 'var(--text-subtle)' }}>
                {row.figmaKind}
              </div>
            </td>
            <td style={cellStyle} className="text-body-sm">
              {row.figmaValues}
            </td>
            <td style={cellStyle}>
              <code>{row.figmaDefault}</code>
            </td>
            <td style={cellStyle}>
              <code>{row.codeProp}</code>
            </td>
            <td style={cellStyle} className="text-body-sm">
              {row.codeType}
            </td>
            <td style={cellStyle}>
              <code>{row.codeDefault}</code>
            </td>
            <td style={cellStyle}>
              <span
                className="text-label-sm"
                style={{
                  display: 'inline-block',
                  padding: 'var(--spacing-4) var(--spacing-8)',
                  borderRadius: 'var(--radius-999)',
                  background: ok ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
                  color: ok ? 'var(--status-success-text)' : 'var(--status-error-text)',
                }}
              >
                {row.status}
              </span>
              {row.note && (
                <div className="text-body-sm" style={{ color: 'var(--text-subtle)', marginTop: 'var(--spacing-4)' }}>
                  {row.note}
                </div>
              )}
            </td>
          </tr>
        )
      })}
    </Table>
  )
}

export function A11yNotes({ items }: { items: string[] }) {
  if (items.length === 0) {
    return (
      <p className="text-body-sm" style={{ color: 'var(--text-subtle)' }}>
        알려진 접근성 예외가 없습니다.
      </p>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
      {items.map((item) => (
        <div
          key={item}
          className="text-body-sm"
          style={{ padding: 'var(--spacing-12) var(--spacing-16)', borderRadius: 'var(--radius-8)', background: 'var(--status-info-bg)', color: 'var(--text-default)' }}
        >
          <strong>접근성 예외 · </strong>
          {item}
        </div>
      ))}
    </div>
  )
}

// `코드`처럼 백틱으로 감싼 부분을 코드 모양으로 보여줌
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>))}
    </>
  )
}

function RuleList({ title, items, tone, source }: { title: string; items: string[]; tone: 'do' | 'dont'; source: string }) {
  const bg = tone === 'do' ? 'var(--status-success-bg)' : 'var(--status-error-bg)'
  const color = tone === 'do' ? 'var(--status-success-text)' : 'var(--status-error-text)'
  return (
    <div style={{ flex: 1, padding: 'var(--spacing-16)', borderRadius: 'var(--radius-8)', background: bg }}>
      <div className="text-label-md" style={{ color }}>
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-body-sm" style={{ margin: 0, marginTop: 'var(--spacing-8)', color: 'var(--text-subtle)' }}>
          아직 작성되지 않았어요. <code>{source}</code>에 적으면 여기에 나타납니다.
        </p>
      ) : (
        <ul className="text-body-sm" style={{ margin: 0, marginTop: 'var(--spacing-8)', paddingLeft: 'var(--spacing-16)', color: 'var(--text-default)' }}>
          {items.map((item) => (
            <li key={item}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function DoDont({ dos, donts, source }: { dos: string[]; donts: string[]; source: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-16)' }}>
      <RuleList title="Do" items={dos} tone="do" source={source} />
      <RuleList title="Don't" items={donts} tone="dont" source={source} />
    </div>
  )
}
