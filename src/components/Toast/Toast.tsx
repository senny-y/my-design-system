import type { HTMLAttributes } from 'react'
import styles from './Toast.module.css'

// Figma Toast 속성과 이름·값이 1:1로 같습니다.
export type ToastType = 'success' | 'error' | 'info'

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Figma type: success | error | info */
  type?: ToastType
  /** Figma title (텍스트 속성) — 굵은 제목. children이 아니라 title로 받습니다 */
  title: string
  /** Figma description (텍스트 속성) — 제목 아래 설명. 없으면 줄이 사라집니다 */
  description?: string
  /** Figma closable (Boolean 속성) — 닫기 버튼 표시/숨김 */
  closable?: boolean
  /** 닫기 버튼을 눌렀을 때 실행 (Figma에는 없는 동작 — 실제로 닫는 일은 사용하는 쪽이 처리) */
  onClose?: () => void
}

// 아이콘 글리프는 Figma와 같이 글자로 표현 (장식이라 스크린리더에는 읽히지 않음)
const glyph: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
}

export function Toast({
  type = 'success',
  title,
  description,
  closable = true,
  onClose,
  className,
  ...rest
}: ToastProps) {
  return (
    <div
      // 오류는 바로 읽어주고(alert), 성공·안내는 하던 말이 끝난 뒤 읽어줌(status)
      role={type === 'error' ? 'alert' : 'status'}
      {...rest}
      className={[styles.toast, className].filter(Boolean).join(' ')}
      data-type={type}
    >
      <span className={`text-label-sm ${styles.icon}`} aria-hidden="true">
        {glyph[type]}
      </span>
      <div className={styles.content}>
        <p className={`text-label-md ${styles.title}`}>{title}</p>
        {description && <p className={`text-body-sm ${styles.description}`}>{description}</p>}
      </div>
      {closable && (
        <button type="button" className={`text-body-md ${styles.close}`} aria-label="닫기" onClick={onClose}>
          <span aria-hidden="true">✕</span>
        </button>
      )}
    </div>
  )
}
