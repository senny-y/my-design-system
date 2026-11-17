import type { HTMLAttributes } from 'react'
import styles from './Tag.module.css'

// Figma Tag 속성과 이름·값이 1:1로 같습니다.
export type TagColor = 'neutral' | 'primary' | 'success' | 'error' | 'warning'
export type TagSize = 'sm' | 'md'

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'color'> {
  /** Figma color: neutral | primary | success | error | warning */
  color?: TagColor
  /** Figma size: sm | md */
  size?: TagSize
  /** Figma label (텍스트 속성) — 태그 글자. children이 아니라 label로 받습니다 */
  label: string
}

// Figma 텍스트 스타일: sm은 label/sm, md는 label/md
const textClass: Record<TagSize, string> = {
  sm: 'text-label-sm',
  md: 'text-label-md',
}

export function Tag({ color = 'neutral', size = 'md', label, className, ...rest }: TagProps) {
  return (
    <span
      {...rest}
      className={[textClass[size], styles.tag, className].filter(Boolean).join(' ')}
      data-color={color}
      data-size={size}
    >
      {label}
    </span>
  )
}
