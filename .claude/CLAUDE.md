# 프로젝트 규칙

## 답변 방식
- 모든 답변은 한국어로, 비전공 디자이너가 이해하기 쉽게 쓴다.

## 디자인 값은 토큰으로만
- 색, 간격, radius, 크기, 글자는 하드코딩하지 않고 반드시 토큰을 사용한다.
- 맞는 토큰이 없으면 비슷한 토큰으로 대신하지 말고, 작업을 멈추고 먼저 물어본다.
- 토큰 목록은 `figma-tokens/variables.json`에 있다. (Code syntax는 `var(--color-primary-600)` 형식)
- 토큰 CSS(`src/tokens/tokens.css`)는 자동 생성 파일이라 직접 수정하지 않는다.
  원본(`figma-tokens/variables.json`)을 고친 뒤 `npm run tokens`로 다시 만든다.
- 글자는 텍스트 스타일 클래스(`.text-heading-lg`, `.text-body-md` 등)를 쓴다.

## Figma와 코드 이름 일치
- Figma 컴포넌트의 속성 이름과 값은 코드 props의 이름과 값과 똑같이 쓴다.
  (예: Button의 `variant`, `size`, `state`, `disabled`, `loading`, `label`)
- Figma 컴포넌트의 기본 variant와 코드 props 기본값은 같아야 한다.
  (Figma 컴포넌트 세트의 맨 왼쪽 위 variant = 코드 기본값. 컴포넌트를 만들 때마다 둘을 표로 비교해서 확인한다)
  - Boolean 속성(loading 등)의 기본값도 같게 한다.
  - 텍스트 속성(label 등)의 Figma 기본 글자는 예시 문구이므로 코드 기본값으로 쓰지 않는다. (코드는 필수 props로 받는다)

## 비밀 파일
- `.env` 같은 비밀 파일은 절대 commit하지 않는다. (`.gitignore`에 등록되어 있다)
