# New Design System (v0.1)

Figma 디자인 시스템과 코드(React + TypeScript + Vite + Storybook)를 같은 토큰으로 맞추는 프로젝트입니다.

## 자주 쓰는 명령어

| 하고 싶은 일 | 터미널에 입력 |
|---|---|
| Storybook 열기 | `npm run storybook` (http://localhost:6006) |
| 토큰 CSS 다시 만들기 | `npm run tokens` |
| 타입 검사 + 빌드 | `npm run build` |

`storybook`, `dev`, `build`를 실행하면 토큰 CSS가 먼저 자동으로 다시 만들어집니다.

## 토큰이 코드까지 오는 길

```
Figma 변수·텍스트 스타일
   ↓ (아래 "Figma에서 다시 내보내기")
figma-tokens/variables.json    ← 변수 (색, 간격, radius, 크기, 글꼴…)
figma-tokens/text-styles.json  ← 텍스트 스타일 (heading/lg 등)
   ↓ npm run tokens
src/tokens/tokens.css          ← 자동 생성 파일 (직접 수정 금지)
   ↓
Storybook과 앱에서 var(--bg-primary), .text-body-md 로 사용
```

- 두 JSON 파일이 원본입니다. `src/tokens/tokens.css`는 직접 고치지 말고, 원본을 바꾼 뒤 `npm run tokens`로 다시 만드세요.
- CSS 변수 이름은 Figma의 Code syntax와 똑같습니다. (예: `color/primary/600` → `var(--color-primary-600)`)
- semantic 변수는 값을 복사하지 않고 primitive를 참조합니다. (`--bg-primary: var(--color-primary-600)`)
- 숫자 변수는 px로 나옵니다. (`font-weight`만 단위 없음)
- 텍스트 스타일은 클래스로 나옵니다. (`heading/lg` → `.text-heading-lg`)
- 글꼴의 한글 대체 목록(Apple SD Gothic Neo, Noto Sans KR…)은 Figma에 없는 정보라서 `scripts/generate-tokens.mjs`의 `FONT_FALLBACKS`에 있습니다.
- Storybook에서 Inter가 보이도록 `.storybook/preview-head.html`에서 글꼴을 불러옵니다. (인터넷 연결 필요)

## Figma에서 다시 내보내기

Figma에서 변수나 텍스트 스타일을 바꿨다면 두 파일을 다시 내보내야 코드에 반영됩니다.
Figma 변수는 Figma 안에서 파일로 바로 내려받는 기능이 없어서, Figma가 연결된 Claude Code에 시켜서 내보냅니다.

**준비**
1. Figma에서 `New_Design-System` 파일을 열어 둡니다. (파일 링크가 필요해요)
2. Claude Code에서 Figma 연결이 되어 있는지 확인합니다. ("피그마 연결 확인"이라고 입력)

**Claude Code에 이렇게 요청하세요** (복사해서 붙여넣기)

```
Figma 파일 <파일 링크>에서 변수와 텍스트 스타일을 다시 내보내줘.
- figma-tokens/variables.json : 모든 컬렉션·모드·변수
  (이름, 타입, 용도(scopes), Code syntax(Web), 모드별 값. semantic처럼 다른 변수를 참조하면
  alias(참조 대상 이름)와 resolved(실제 값)를 같이 적기)
- figma-tokens/text-styles.json : 텍스트 스타일 전부
  (이름, 글꼴 굵기 이름, 그리고 fontFamily·fontSize·lineHeight·fontWeight가 각각 연결된 변수 이름)
기존 파일의 형식을 그대로 따르고, 다 하면 npm run tokens를 실행해서 개수가 일치하는지 알려줘.
```

**끝나고 확인할 것**
- `npm run tokens`를 실행했을 때 `✓ 개수 일치`가 나와야 합니다.
- 모든 변수에 Code syntax가 있어야 합니다. 없거나 이름 규칙과 다르면 스크립트가 어떤 변수인지 알려 주며 멈춥니다.
- 새 글꼴 변수를 만들었다면 `scripts/generate-tokens.mjs`의 `FONT_FALLBACKS`에 대체 글꼴도 추가해야 합니다. (없으면 스크립트가 멈춥니다)

### 두 파일의 모양

`figma-tokens/variables.json` (일부)
```json
{
  "collections": [
    {
      "name": "semantic",
      "modes": ["light"],
      "variables": [
        {"name":"bg/primary","type":"COLOR","scopes":["FRAME_FILL","SHAPE_FILL"],
         "codeSyntax":{"web":"var(--bg-primary)"},
         "values":{"light":{"alias":"color/primary/600","resolved":"#3E46D6"}}}
      ]
    }
  ]
}
```

`figma-tokens/text-styles.json` (일부)
```json
{
  "textStyles": [
    {"name":"heading/lg","font":{"style":"Semi Bold"},
     "fontFamily":"font-family/base","fontSize":"font-size/24",
     "lineHeight":"line-height/32","fontWeight":"font-weight/600"}
  ]
}
```
`fontFamily`, `fontSize`, `lineHeight`, `fontWeight`에는 값이 아니라 **변수 이름**을 적습니다.

## 작업 규칙

[.claude/CLAUDE.md](.claude/CLAUDE.md)를 보세요. (토큰만 사용, Figma와 코드 이름 일치, 비밀 파일 commit 금지)
