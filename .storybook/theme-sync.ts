// 툴바의 라이트/다크 선택(globals.theme)을 <html data-theme="light|dark">에 반영합니다.
// 토큰 CSS(src/tokens/tokens.css)가 [data-theme="dark"]일 때 semantic 색을 dark 값으로 바꿉니다.
// 스토리가 없는 문서 페이지(Foundations 등)에서도 동작하도록 스토리 데코레이터가 아니라 채널 이벤트로 받습니다.
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'

type ThemeMode = 'light' | 'dark'

export const applyTheme = (mode: ThemeMode) => {
  document.documentElement.dataset.theme = mode
}

export function watchTheme() {
  const channel = addons.getChannel()
  const onGlobals = (payload: { globals?: { theme?: string } }) => {
    applyTheme(payload.globals?.theme === 'dark' ? 'dark' : 'light')
  }
  channel.on(SET_GLOBALS, onGlobals) // 처음 열릴 때 (주소의 globals=theme:dark 포함)
  channel.on(GLOBALS_UPDATED, onGlobals) // 툴바에서 바꿀 때
}
