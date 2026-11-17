import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import styles from './Button.module.css'

// Figma Button 속성과 이름·값이 1:1로 같습니다. (state: default·hover·focus는 props가 아니라 CSS 상태)
export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Figma variant: primary | secondary | ghost */
  variant?: ButtonVariant
  /** Figma size: sm | md */
  size?: ButtonSize
  /** Figma disabled (true/false variant) — 실제 disabled 속성이 붙습니다 */
  disabled?: boolean
  /** Figma loading (Boolean 속성) — 스피너를 보여주고 클릭을 막습니다 */
  loading?: boolean
  /** Figma label (텍스트 속성) — 버튼 글자. children이 아니라 label로 받습니다 */
  label: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  label,
  type = 'button',
  className,
  onClick,
  ...rest
}: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // loading 중에는 마우스·Enter·Space 어떤 방식으로 눌러도 onClick을 실행하지 않음
    if (loading) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  return (
    <button
      {...rest}
      type={type}
      className={['text-label-md', styles.button, className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
      data-loading={loading ? '' : undefined}
      disabled={disabled}
      aria-busy={loading ? true : undefined}
      onClick={handleClick}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {label}
    </button>
  )
}
