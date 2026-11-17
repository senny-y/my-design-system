# New Design System (v0.1)

Figma 디자인 시스템과 코드(React + TypeScript + Vite + Storybook)를 같은 토큰으로 맞추는 프로젝트입니다.

## 자주 쓰는 명령어

| 하고 싶은 일 | 터미널에 입력 |
|---|---|
| Storybook 열기 | `npm run storybook` (http://localhost:6006) |
| **토큰 변환 → 가이드 생성 → 검사를 한 번에** | `npm run sync` |
| 토큰 CSS만 다시 만들기 | `npm run tokens` |
| Storybook 가이드 문서만 다시 만들기 | `npm run guide` |
| 검사만 하기 (불일치·하드코딩 찾기) | `npm run audit` |
| 타입 검사 + 빌드 | `npm run build` |

`storybook`을 실행하면 토큰 CSS와 가이드 문서가 먼저 자동으로 다시 만들어집니다. (`dev`, `build`는 토큰 CSS만)

## 토큰이 코드까지 오는 길

```
Figma 변수·텍스트 스타일
   ↓ (아래 "Figma에서 다시 내보내기")
figma-tokens/variables.json    ← 변수 (색, 간격, radius, 크기, 글꼴…)
figma-tokens/text-styles.json  ← 텍스트 스타일 (heading/lg 등)
figma-tokens/components.json   ← 컴포넌트 속성·값·기본값·접근성 메모 (Button, Tag, Input, Toast)
   ↓ npm run tokens            (변수·텍스트 스타일 → CSS)
src/tokens/tokens.css          ← 자동 생성 파일 (직접 수정 금지)
   ↓ npm run guide             (세 JSON + 코드 → Storybook 문서)
src/docs/generated/*.mdx       ← 자동 생성 파일 (직접 수정 금지)
   ↓ npm run audit             (Figma ↔ 코드 비교, 하드코딩 찾기)
design-audit/reports/          ← 검사 리포트 (날짜가 들어간 파일)
```

- JSON 파일 세 개가 원본입니다. `src/tokens/tokens.css`는 직접 고치지 말고, 원본을 바꾼 뒤 `npm run tokens`로 다시 만드세요.
- `npm run tokens`는 파비콘(`public/favicon.svg`, 탭 아이콘)도 토큰 값(`color/primary/600` 등)으로 함께 만듭니다. 앱과 Storybook이 같은 파일을 씁니다.
- CSS 변수 이름은 Figma의 Code syntax와 똑같습니다. (예: `color/primary/600` → `var(--color-primary-600)`)
- semantic 변수는 값을 복사하지 않고 primitive를 참조합니다. (`--bg-primary: var(--color-primary-600)`)
- 숫자 변수는 px로 나옵니다. (`font-weight`만 단위 없음)
- 텍스트 스타일은 클래스로 나옵니다. (`heading/lg` → `.text-heading-lg`)
- 글꼴의 한글 대체 목록(Apple SD Gothic Neo, Noto Sans KR…)은 Figma에 없는 정보라서 `scripts/generate-tokens.mjs`의 `FONT_FALLBACKS`에 있습니다.
- Inter 글꼴은 `src/styles/fonts.css` 한 곳에서 불러옵니다. 앱(`src/main.tsx`)과 Storybook(`.storybook/preview.tsx`)이 같은 파일을 가져다 씁니다. (인터넷 연결 필요)
  글꼴이나 굵기를 바꿀 때는 이 파일만 고치면 됩니다.

## Figma에서 다시 내보내기

Figma에서 변수, 텍스트 스타일, 컴포넌트를 바꿨다면 세 파일을 다시 내보내야 코드와 가이드에 반영됩니다.
Figma 변수는 Figma 안에서 파일로 바로 내려받는 기능이 없어서, Figma가 연결된 Claude Code에 시켜서 내보냅니다.

**준비**
1. Figma에서 `New_Design-System` 파일을 열어 둡니다. (파일 링크가 필요해요)
2. Claude Code에서 Figma 연결이 되어 있는지 확인합니다. ("피그마 연결 확인"이라고 입력)

**Claude Code에 이렇게 요청하세요** (복사해서 붙여넣기)

```
Figma 파일 <파일 링크>에서 변수, 텍스트 스타일, 컴포넌트를 다시 내보내줘.
- figma-tokens/variables.json : 모든 컬렉션·모드·변수
  (이름, 타입, 용도(scopes), Code syntax(Web), 모드별 값. semantic처럼 다른 변수를 참조하면
  alias(참조 대상 이름)와 resolved(실제 값)를 같이 적기)
- figma-tokens/text-styles.json : 텍스트 스타일 전부
  (이름, 글꼴 굵기 이름, 그리고 fontFamily·fontSize·lineHeight·fontWeight가 각각 연결된 변수 이름)
- figma-tokens/components.json : Components 페이지의 컴포넌트 세트 전부
  (이름, 속성 이름·종류(VARIANT/BOOLEAN/TEXT)·값 목록·기본값, 설명, 설명 중 "접근성 참고:"로 시작하는 줄은 accessibilityNotes로 따로)
기존 파일의 형식을 그대로 따르고, 다 하면 npm run sync를 실행해서 결과를 알려줘.
```

**끝나고 확인할 것**
- `npm run sync`가 끝까지 통과해야 합니다. (토큰 개수 일치 → 가이드 생성 → 검사 통과)
- 모든 변수에 Code syntax가 있어야 합니다. 없거나 이름 규칙과 다르면 스크립트가 어떤 변수인지 알려 주며 멈춥니다.
- 새 글꼴 변수를 만들었다면 `scripts/generate-tokens.mjs`의 `FONT_FALLBACKS`에 대체 글꼴도 추가해야 합니다. (없으면 스크립트가 멈춥니다)

### 파일의 모양

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

`figma-tokens/components.json` (일부)
```json
{
  "components": [
    {"name":"Button","description":"…",
     "accessibilityNotes":["disabled 상태의 글자는 …"],
     "properties":[
       {"name":"variant","type":"VARIANT","values":["primary","secondary","ghost"],"default":"primary"},
       {"name":"loading","type":"BOOLEAN","default":false},
       {"name":"label","type":"TEXT","default":"Button"}]}
  ]
}
```
> Figma 컴포넌트 설명에는 큰따옴표(")를 쓰지 마세요. Figma가 `&quot;`라는 글자로 바꿔 저장합니다. ‘ ’를 쓰면 됩니다.

## 검사·가이드 자동화 (npm run sync)

`npm run sync` 하나가 아래 세 단계를 **순서대로** 실행합니다. 중간에 실패하면 거기서 멈추고, 마지막 검사에서 문제가 나오면 **실패(종료 코드 1)** 로 끝납니다. (나중에 배포 전에 자동으로 막는 용도)

| 순서 | 명령 | 하는 일 |
|---|---|---|
| 1 | `npm run tokens` | Figma 변수·텍스트 스타일 → 토큰 CSS, 파비콘 |
| 2 | `npm run guide` | Storybook Docs 가이드(MDX) 자동 생성 |
| 3 | `npm run audit` | Figma ↔ 코드 검사, 하드코딩 찾기, 가이드 최신 여부 |

### 검사 (npm run audit)

| 검사 | 보는 것 | 실패로 치는 것 |
|---|---|---|
| 토큰 | Figma 변수·텍스트 스타일 ↔ `src/tokens/tokens.css` | **불일치**(값이 다름), **Figma 전용**(CSS에 없음), **코드 전용**(Figma에 없는 CSS 변수) |
| 컴포넌트 | Figma 속성 이름·값·기본값 ↔ 코드 props (`state`는 props가 아니라 CSS 상태인지도 확인) | 이름·값·기본값·타입이 다른 것, Figma에 없는 코드 props |
| 하드코딩 | `src/components`, `src/App.tsx`, `src/index.css`의 색상값(#hex·rgb 등), px 숫자, 시간 값, 스타일 속 숫자, Tailwind 임의 값(`w-[13px]`) | 위 값이 토큰 없이 적혀 있는 곳 |
| 가이드 | `src/docs/generated` 파일이 지금 원본으로 만들 결과와 같은지 | 직접 고친 흔적, `npm run guide`를 안 한 경우 |

- **결과**는 터미널에 요약으로 나오고, 같은 내용이 `design-audit/reports/audit-날짜.md`에 저장됩니다. (같은 날 다시 실행하면 덮어씁니다. 리포트는 commit하지 않습니다)
- **하드코딩 예외**: 어쩔 수 없는 값은 같은 줄이나 바로 위 줄에 `예외: 이유` 주석을 쓰면 "허용된 예외"로 따로 세고 실패로 치지 않습니다. (예: Button 스피너 두께 `2px`)
- **코드에만 있는 props**는 `design-audit/config.json`의 `codeOnlyProps`에 이유와 함께 적어야 허용됩니다. (예: Toast의 `onClose`)
- 새 컴포넌트를 만들면 `design-audit/config.json`의 `components`에 한 줄 추가하세요.
- 검사 스크립트는 TypeScript 파일의 글자를 읽어서 props를 분석하므로, 이 프로젝트의 작성 방식(`export type 이름 = 'a' | 'b'`, `export interface 이름Props`, `export function 이름({ ... }: 이름Props)`)을 따라야 읽을 수 있습니다.

### 가이드 문서 (npm run guide)

Storybook 사이드바에 자동으로 생기는 문서입니다.

- **Foundations**: Colors, Spacing, Radius, Size, Typography — 견본과 함께 *Figma 이름 / 코드 이름 / Code syntax*를 보여줍니다.
- **Components/○○ → Docs**: 컴포넌트마다 미리보기, *Figma 속성 ↔ 코드 props 표*(일치 여부 포함), **접근성 예외**, **사용 규칙 (Do / Don't)**, Controls가 나옵니다.
- **접근성 예외**는 Figma 컴포넌트 설명에서 "접근성 참고:"로 시작하는 줄을 가져옵니다. 예외를 추가하려면 Figma 설명에 그 줄을 쓰고 `components.json`을 다시 내보내세요.

### 사용 규칙(Do / Don't) 쓰는 법

`design-guide/rules/컴포넌트이름.md` 파일에 직접 씁니다. (예: `design-guide/rules/Button.md`)

```md
## Do
- 한 화면에서 가장 중요한 동작에는 `primary`를 하나만 쓴다.

## Don't
- 취소와 확인에 같은 모양의 버튼을 쓰지 않는다.
```

- 이 파일들은 **`npm run sync`나 `npm run guide`를 다시 해도 지워지거나 덮어써지지 않습니다.** (파일이 없을 때만 빈 양식을 만듭니다)
- `- ` 뒤에 한 줄씩 쓰고, 이어 쓰고 싶으면 다음 줄을 들여쓰기 하세요. `코드`는 백틱으로 감싸면 코드 모양으로 보입니다.
- 비어 있으면 문서에 "아직 작성되지 않았어요"라고 나옵니다.
- `src/docs/generated/`의 파일은 **직접 고치지 마세요.** 다음 생성 때 덮어써지고, 검사가 실패합니다.

## 작업 규칙

[.claude/CLAUDE.md](.claude/CLAUDE.md)를 보세요. (토큰만 사용, Figma와 코드 이름 일치, 비밀 파일 commit 금지)
