import type { Preview } from '@storybook/react-vite'
import '../src/styles/fonts.css' // 글꼴 불러오기 (앱과 같은 파일)
import '../src/tokens/tokens.css' // Figma 토큰 CSS (npm run tokens로 자동 생성)
import './preview.css' // 화면 바탕을 토큰 색으로 (라이트/다크 전환 시 같이 바뀜)
import { ThemedDocsContainer } from './ThemedDocsContainer'
import { watchTheme } from './theme-sync'

// 툴바의 라이트/다크 선택을 <html data-theme>에 반영 (토큰 CSS의 [data-theme="dark"]가 적용됨)
watchTheme()

const preview: Preview = {
  // 위쪽 도구 막대의 라이트/다크 전환 버튼
  globalTypes: {
    theme: {
      description: '라이트 / 다크 모드',
      toolbar: {
        title: '모드',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: '라이트', icon: 'sun' },
          { value: 'dark', title: '다크', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },

  parameters: {
    // 사이드바 순서: 기초(Foundations) → 컴포넌트
    options: { storySort: { order: ['Foundations', 'Components'] } },

    // 문서 페이지도 라이트/다크에 맞춤
    docs: { container: ThemedDocsContainer },

    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
