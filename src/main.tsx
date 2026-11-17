import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css' // 글꼴 불러오기 (Storybook과 같은 파일)
import './tokens/tokens.css' // Figma 토큰 CSS (npm run tokens로 자동 생성)
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
