// 문서 페이지의 Storybook 기본 화면(제목, 본문, 코드 상자 등)도 라이트/다크에 맞게 바꾸는 컨테이너입니다.
// <html data-theme>이 바뀌는 것을 지켜보다가 Storybook의 라이트/다크 문서 테마를 고릅니다.
import { DocsContainer } from '@storybook/addon-docs/blocks'
import type { ComponentProps } from 'react'
import { useEffect, useState } from 'react'
import { themes } from 'storybook/theming'

const currentMode = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

export function ThemedDocsContainer(props: ComponentProps<typeof DocsContainer>) {
  const [mode, setMode] = useState(currentMode)
  useEffect(() => {
    const observer = new MutationObserver(() => setMode(currentMode()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  return <DocsContainer {...props} theme={mode === 'dark' ? themes.dark : themes.light} />
}
