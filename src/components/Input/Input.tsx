import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

// Figma Input 속성과 이름·값이 1:1로 같습니다. (state: default·focus는 props가 아니라 CSS 상태)
export type InputSize = 'md'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'disabled'> {
  /** Figma size: md */
  size?: InputSize
  /** Figma error (true/false variant) — 테두리와 도움말이 오류 색으로 바뀌고 aria-invalid가 붙습니다 */
  error?: boolean
  /** Figma disabled (true/false variant) — 실제 disabled 속성이 붙습니다 */
  disabled?: boolean
  /** Figma label (텍스트 속성) — 입력칸 위의 글자. 입력칸과 연결됩니다 */
  label: string
  /** Figma helperText (텍스트 속성) — 입력칸 아래 안내 글자. error일 때는 오류 메시지로 읽힙니다 */
  helperText?: string
}

export function Input({
  size = 'md',
  error = false,
  disabled = false,
  label,
  helperText,
  id,
  className,
  'aria-describedby': describedByProp,
  ...rest
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helperId = `${inputId}-helper`
  // 도움말(오류 메시지 포함)을 입력칸의 설명으로 연결. 직접 넘긴 aria-describedby도 함께 유지
  const describedBy = [describedByProp, helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-size={size}
      data-error={error ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
    >
      <label htmlFor={inputId} className={`text-label-md ${styles.label}`}>
        {label}
      </label>
      <div className={styles.field}>
        <input
          {...rest}
          id={inputId}
          className={`text-body-md ${styles.input}`}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      </div>
      {helperText && (
        <p id={helperId} className={`text-body-sm ${styles.helper}`}>
          {helperText}
        </p>
      )}
    </div>
  )
}
