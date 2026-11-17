import type { Preview } from '@storybook/react-vite'
import '../src/styles/fonts.css' // 글꼴 불러오기 (앱과 같은 파일)
import '../src/tokens/tokens.css' // Figma 토큰 CSS (npm run tokens로 자동 생성)

const preview: Preview = {
  parameters: {
    // 사이드바 순서: 기초(Foundations) → 컴포넌트 → 토큰 확인용
    options: { storySort: { order: ['Foundations', 'Components', 'Tokens'] } },

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