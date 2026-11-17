# my-design-system

Figma에서 만든 개인 디자인 시스템을 코드(React + TypeScript)로 옮기고, Figma와 코드가 어긋나는지 명령 하나로 검사하는 프로젝트입니다.

- Figma의 변수(색, 간격, radius, 크기, 글꼴)와 텍스트 스타일을 JSON으로 내보내고, 그 JSON에서 CSS 토큰을 자동으로 만듭니다.
- 컴포넌트 4개(Button, Tag, Input, Toast)를 Figma 속성 이름·값·기본값과 같게 구현했습니다.
- `npm run sync` 하나로 토큰 변환 → Storybook 가이드 생성 → 검사를 순서대로 실행합니다.

Figma 원본 파일은 이 저장소에 들어 있지 않습니다. 저장소에 있는 `figma-tokens/`의 JSON이 코드의 기준입니다.

## 들어 있는 것

### 토큰 (Figma 변수 71개 + 텍스트 스타일 6개)

| 컬렉션 | 개수 | 내용 |
|---|---|---|
| primitive | 21 | 원본 색 (primary, neutral, red, green, orange) |
| semantic | 21 | 용도별 색 (bg, text, border, status). primitive를 참조하며, 모드는 light 하나 |
| dimension | 28 | spacing, radius, size, font-size, line-height, font-weight |
| typography | 1 | font-family |

텍스트 스타일은 `heading/lg`, `heading/md`, `body/md`, `body/sm`, `label/md`, `label/sm` 6개이고 CSS 클래스(`.text-heading-lg` 등)로 만들어집니다.

### 컴포넌트 4개

props 이름과 값은 Figma 컴포넌트 속성과 같습니다.

| 컴포넌트 | props |
|---|---|
| Button | `variant`(primary·secondary·ghost), `size`(sm·md), `disabled`, `loading`, `label` |
| Tag | `color`(neutral·primary·success·error·warning), `size`(sm·md), `label` |
| Input | `size`(md), `error`, `disabled`, `label`, `helperText` |
| Toast | `type`(success·error·info), `title`, `description`, `closable` (+ 코드에만 있는 `onClose`) |

- Figma의 `state`(default·hover·focus)는 props가 아니라 CSS 상태(`:hover`, `:focus-visible` 등)로 구현했습니다.
- 색, 간격, radius, 크기, 글자는 토큰만 사용합니다. 직접 적은 값 2개(Button 스피너 두께와 회전 속도)는 코드에 이유를 주석으로 적었습니다.

## 시작하기

Node.js 24에서 만들고 확인했습니다. (다른 버전은 확인하지 않았습니다)

```bash
npm install
npm run storybook      # http://localhost:6006
```

| 하고 싶은 일 | 명령 |
|---|---|
| **토큰 변환 → 가이드 생성 → 검사를 한 번에** | `npm run sync` |
| Storybook 열기 | `npm run storybook` |
| 토큰 CSS만 다시 만들기 | `npm run tokens` |
| Storybook 가이드 문서만 다시 만들기 | `npm run guide` |
| 검사만 하기 | `npm run audit` |
| 타입 검사 + 앱 빌드 | `npm run build` |
| 스토리 테스트 | `npx vitest run --project storybook` |

`npm run storybook`을 실행하면 토큰 CSS와 가이드 문서가 먼저 자동으로 다시 만들어집니다. (`dev`, `build`는 토큰 CSS만)

`src/App.tsx`의 앱 화면은 "Storybook에서 확인하세요"라는 안내만 있습니다. 컴포넌트는 Storybook에서 확인합니다.

## 폴더 구조

```
.
├─ figma-tokens/          Figma에서 내보낸 JSON — 모든 것의 기준
│   ├─ variables.json       변수 (이름, 값/참조, 용도, Code syntax)
│   ├─ text-styles.json     텍스트 스타일
│   └─ components.json      컴포넌트 속성·값·기본값·접근성 메모
├─ scripts/
│   └─ generate-tokens.mjs  JSON → src/tokens/tokens.css, public/favicon.svg
├─ design-audit/          검사와 가이드 생성
│   ├─ audit.mjs            검사 (npm run audit)
│   ├─ generate-guide.mjs   가이드 생성 (npm run guide)
│   ├─ config.json          검사 대상·허용 예외 설정
│   ├─ lib/                 검사·생성 함수들
│   └─ reports/             검사 리포트 (실행할 때마다 생성, commit하지 않음)
├─ design-guide/rules/    컴포넌트별 사용 규칙(Do/Don't) — 직접 쓰는 파일
├─ src/
│   ├─ tokens/tokens.css    자동 생성 (직접 수정 금지)
│   ├─ components/          Button, Tag, Input, Toast (각 폴더: .tsx, .module.css, .stories.tsx)
│   ├─ docs/                Storybook 가이드: GuideBlocks.tsx(직접 쓴 화면 조각), generated/(자동 생성 MDX)
│   ├─ styles/fonts.css     글꼴 불러오기
│   └─ App.tsx, main.tsx, index.css
├─ public/favicon.svg     자동 생성 (직접 수정 금지)
├─ .storybook/            Storybook 설정
├─ .claude/CLAUDE.md      이 프로젝트의 작업 규칙 (Claude Code용)
└─ .env.example           필요한 환경 변수 견본 (FIGMA_FILE_KEY)
```

## 데이터가 흐르는 길

```
Figma (변수·텍스트 스타일·컴포넌트)
   ↓ 내보내기 (아래 "Figma에서 다시 내보내기")
figma-tokens/*.json
   ↓ npm run tokens   → src/tokens/tokens.css, public/favicon.svg   (직접 수정 금지)
   ↓ npm run guide    → src/docs/generated/*.mdx                    (직접 수정 금지)
   ↓ npm run audit    → design-audit/reports/audit-날짜.md
Storybook·앱에서 var(--bg-primary), .text-body-md 로 사용
```

- CSS 변수 이름은 Figma 변수의 Code syntax와 똑같습니다. (예: `color/primary/600` → `var(--color-primary-600)`)
- semantic 변수는 값을 복사하지 않고 primitive를 참조합니다. (`--bg-primary: var(--color-primary-600)`)
- 숫자 변수는 px로 나옵니다. (`font-weight`만 단위 없음)
- semantic은 모드별로 나눠 출력합니다. 지금은 light만 있고(`:root`, `[data-theme="light"]`), Figma에 모드가 추가되면 `[data-theme="모드이름"]` 블록이 자동으로 생깁니다.
- 글꼴의 한글 대체 목록(Apple SD Gothic Neo, Noto Sans KR 등)은 Figma에 없는 정보라서 `scripts/generate-tokens.mjs`의 `FONT_FALLBACKS`에 있습니다.
- Inter 글꼴은 `src/styles/fonts.css`에서 Google Fonts로 불러옵니다. (인터넷 연결 필요, 앱과 Storybook이 같은 파일을 사용)

## 자동화: npm run sync

`npm run sync`는 아래 세 단계를 **순서대로** 실행합니다. 중간에 실패하면 거기서 멈추고, 마지막 검사에서 문제가 나오면 종료 코드 1로 끝납니다. (나중에 배포 전에 자동으로 막는 용도로 만들었지만, 아직 CI에 연결하지는 않았습니다)

| 순서 | 명령 | 하는 일 |
|---|---|---|
| 1 | `npm run tokens` | Figma 변수·텍스트 스타일 → 토큰 CSS, 파비콘 |
| 2 | `npm run guide` | Storybook Docs 가이드(MDX) 생성 |
| 3 | `npm run audit` | Figma ↔ 코드 검사, 하드코딩 찾기, 가이드 최신 여부 |

### 검사 (npm run audit)

| 검사 | 보는 것 | 실패로 치는 것 |
|---|---|---|
| 토큰 | Figma 변수·텍스트 스타일 ↔ `src/tokens/tokens.css` | **불일치**(값이 다름), **Figma 전용**(CSS에 없음), **코드 전용**(Figma에 없는 CSS 변수) |
| 컴포넌트 | Figma 속성 이름·값·기본값 ↔ 코드 props (`state`는 props가 아니라 CSS 상태인지도 확인) | 이름·값·기본값·타입이 다른 것, Figma에 없는 코드 props |
| 하드코딩 | `src/components`, `src/docs/GuideBlocks.tsx`, `src/App.tsx`, `src/index.css`의 색상값(#hex·rgb 등), px 숫자, 시간 값, 스타일 속 숫자, Tailwind 임의 값(`w-[13px]`) | 위 값이 토큰 없이 적혀 있는 곳 |
| 가이드 | `src/docs/generated`가 지금 원본으로 만들 결과와 같은지 | 직접 고친 흔적, `npm run guide`를 안 한 경우 |

- 결과는 터미널에 요약으로 나오고, 같은 내용이 `design-audit/reports/audit-날짜.md`에 저장됩니다. (같은 날 다시 실행하면 덮어씁니다)
- **하드코딩 예외**: 같은 줄이나 바로 위 줄에 `예외: 이유` 주석을 쓰면 "허용된 예외"로 따로 세고 실패로 치지 않습니다.
- **코드에만 있는 props**는 `design-audit/config.json`의 `codeOnlyProps`에 이유와 함께 적어야 허용됩니다. (예: Toast의 `onClose`)
- 새 컴포넌트를 만들면 `design-audit/config.json`의 `components`에 한 줄을 추가하세요.
- 이 검사가 **확인하지 않는 것**: 화면 모양(픽셀)이 Figma와 같은지는 자동으로 확인하지 않습니다. 컴포넌트를 만들 때 Figma 스크린샷과 Storybook 화면을 따로 비교했습니다.
- 컴포넌트 검사는 TypeScript 파일의 글자를 읽어서 props를 분석합니다. 이 프로젝트의 작성 방식(`export type 이름 = 'a' | 'b'`, `export interface 이름Props`, `export function 이름({ ... }: 이름Props)`)을 따라야 읽을 수 있습니다.

### Storybook 가이드 문서 (npm run guide)

- **Foundations**: Colors, Spacing, Radius, Size, Typography — 견본과 함께 *Figma 이름 / 코드 이름 / Code syntax*를 보여줍니다.
- **Components/○○ → Docs**: 컴포넌트마다 미리보기, *Figma 속성 ↔ 코드 props 표*(일치 여부 포함), 접근성 예외, 사용 규칙(Do/Don't), Controls가 나옵니다.
- 접근성 예외는 Figma 컴포넌트 설명에서 "접근성 참고:"로 시작하는 줄을 가져옵니다.

### 사용 규칙(Do / Don't) 쓰는 법

`design-guide/rules/컴포넌트이름.md`에 직접 씁니다. (예: `design-guide/rules/Button.md`)

```md
## Do
- 한 화면에서 가장 중요한 동작에는 `primary`를 하나만 쓴다.

## Don't
- 취소와 확인에 같은 모양의 버튼을 쓰지 않는다.
```

- 이 파일들은 `npm run sync`나 `npm run guide`를 다시 해도 지워지거나 덮어써지지 않습니다. (파일이 없을 때만 빈 양식을 만듭니다)
- `- ` 뒤에 한 줄씩 쓰고, 이어 쓰려면 다음 줄을 들여쓰기 하세요. `코드`는 백틱으로 감쌉니다.
- 비어 있으면 문서에 "아직 작성되지 않았어요"라고 나옵니다.
- `src/docs/generated/`는 직접 고치지 마세요. 다음 생성 때 덮어써지고 검사가 실패합니다.

## Figma에서 다시 내보내기

Figma에서 변수, 텍스트 스타일, 컴포넌트를 바꿨다면 JSON 세 개를 다시 내보내야 코드와 가이드에 반영됩니다. Figma 변수는 Figma 안에서 파일로 바로 내려받는 기능이 없어서, 이 프로젝트에서는 Figma가 연결된 Claude Code에 시켜서 내보냈습니다. 같은 모양의 JSON을 만들 수 있다면 다른 방법도 됩니다.

Claude Code에 이렇게 요청합니다. (복사해서 붙여넣기)

```
Figma 파일 <파일 링크>에서 변수, 텍스트 스타일, 컴포넌트를 다시 내보내줘.
- figma-tokens/variables.json : 모든 컬렉션·모드·변수
  (이름, 타입, 용도(scopes), Code syntax(Web), 모드별 값. semantic처럼 다른 변수를 참조하면
  alias(참조 대상 이름)와 resolved(실제 값)를 같이 적기)
- figma-tokens/text-styles.json : 텍스트 스타일 전부
  (이름, 글꼴 굵기 이름, 그리고 fontFamily·fontSize·lineHeight·fontWeight가 각각 연결된 변수 이름)
- figma-tokens/components.json : Components 페이지의 컴포넌트 세트 전부
  (이름, 속성 이름·종류(VARIANT/BOOLEAN/TEXT)·값 목록·기본값, 설명, 설명 중 "접근성 참고:"로 시작하는 줄은 accessibilityNotes로 따로)
기존 파일의 형식을 그대로 따르고, Figma 파일 키는 JSON 파일에 넣지 마. 다 하면 npm run sync를 실행해서 결과를 알려줘.
```

끝나고 확인할 것:

- `npm run sync`가 끝까지 통과해야 합니다.
- 모든 변수에 Code syntax가 있어야 합니다. 없거나 이름 규칙과 다르면 스크립트가 어떤 변수인지 알려 주며 멈춥니다.
- 새 글꼴 변수를 만들었다면 `scripts/generate-tokens.mjs`의 `FONT_FALLBACKS`에 대체 글꼴도 추가해야 합니다.
- Figma 컴포넌트 설명에는 큰따옴표(`"`)를 쓰지 마세요. Figma가 `&quot;`라는 글자로 바꿔 저장합니다. ‘ ’를 쓰면 됩니다.
- Figma 파일 키는 JSON에 넣지 않습니다. 필요하면 `.env.example`을 `.env`로 복사해서 `FIGMA_FILE_KEY=`에 적으세요. (`.env`는 commit되지 않습니다. 지금 코드는 이 값을 읽지 않고, 적어 둘 자리만 있습니다)

### JSON 파일의 모양 (일부)

`figma-tokens/variables.json`
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

`figma-tokens/text-styles.json`
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

`figma-tokens/components.json`
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

## 알려진 한계

- 컴포넌트는 4개이고, 색 모드는 light 하나입니다. 앱 화면은 안내 문구만 있습니다.
- 글꼴은 Pretendard를 쓸 수 없는 환경이어서 Inter로 만들었습니다.
- 접근성 검사(Storybook의 axe)에서 알려진 예외가 있습니다.
  - disabled 상태의 글자는 명도 대비가 4.5:1보다 낮습니다. 비활성 요소는 WCAG 대비 기준의 예외로 보고 그대로 두었습니다. (Button, Input)
  - Toast의 아이콘 기호(✓ ✕ i)와 닫기 ✕, 닫기 버튼 이름("닫기")과 보이는 글자("✕")의 차이는 검사 도구가 "확인 필요"로 남깁니다. 기호 문자라 자동 계산이 안 되는 항목이고, 명도 대비는 직접 계산해서 4.5:1 이상임을 확인했습니다.
- Figma → JSON 내보내기는 스크립트가 아니라 Claude Code로 하는 수동 단계입니다. 내보내기를 빠뜨리면 검사는 "JSON ↔ 코드"만 비교하므로 Figma의 최신 상태와는 어긋날 수 있습니다.
- CI(자동 실행)와 배포는 연결하지 않았습니다.

## 작업 규칙

[.claude/CLAUDE.md](.claude/CLAUDE.md)에 있습니다. (토큰만 사용, Figma와 코드 이름·기본값 일치, 비밀 파일 commit 금지 등)

## 사용한 도구

React 19, TypeScript, Vite, Storybook 10(addon-a11y, addon-docs, addon-vitest), oxlint. 글꼴은 Google Fonts의 Inter입니다.
