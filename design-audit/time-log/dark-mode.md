# 다크 모드 추가 — 시간 기록

- **시작 시각**: 2026-11-17 21:29:10
- 단계가 끝날 때마다 아래 표에 시각과 걸린 시간을 이어서 적습니다.

| 단계 | 시작 | 끝 | 걸린 시간 | 내용 |
|---|---|---|---|---|
| 1. 읽기 전용 분석 | 21:29:10 | 21:30:21 | 1분 11초 | 지정된 다크 값 11개와 전체 조합의 명도 대비 계산, text/on-primary 미달 해결 후보, status·border/error용 primitive 2안 설계 (Figma·코드는 아직 안 바꿈) |
| 2. 결정 대기 (사용자 선택) | 21:30:21 | 21:31:52 | 1분 31초 | on-primary=B(배경 밝게), status=1안(300/900), placeholder=neutral/600 선택 |
| 3. Figma 적용 | 21:31:52 | 21:32:41 | 0분 49초 | semantic에 dark 모드 추가, primitive 6개 추가(green·red·orange 300/900), semantic 22개 전체에 dark 값 설정(라이트 값은 변경 없음 확인) |
| 4. Dark 확인용 프레임 | 21:32:41 | 21:33:22 | 0분 41초 | Components 페이지에 "Dark 확인용"(34:44) 생성, dark 모드로 설정, Button·Tag·Input·Toast 인스턴스 배치, 스크린샷 확인, 적용 후 전체 대비 재계산 |

## 합계

- 시작 21:29:10 → 끝 21:33:22, **전체 4분 12초** (사용자 선택을 기다린 시간 1분 31초 포함)
- 이번에 바꾼 것: Figma 파일만 (코드, JSON 내보내기, 토큰 CSS는 아직 변경하지 않음)

## 선택한 값

- text/on-primary 미달 해결: B안 — bg/primary → primary/300, bg/primary-hover → primary/100, text/on-primary → neutral/900
- status·border/error: 1안(300/900) — green·red·orange 300/900 primitive 6개 추가
- text/placeholder (dark): neutral/600

## 남은 확인 사항

- Button primary의 focus 테두리(border/focus=primary/300)가 배경(bg/primary=primary/300)과 같은 색이라 보이지 않음 (대비 1.00:1)

---

# 2차: Figma 다크 모드를 코드에 반영

- **2차 시작 요청**: 2026-11-17 21:35:48
- 위 1차 표의 마지막 단계(21:33:22) 이후 이어서 기록합니다.

| 단계 | 시작 | 끝 | 걸린 시간 | 내용 |
|---|---|---|---|---|
| 5. 사용자 확인 대기 | 21:33:22 | 21:35:48 | 2분 26초 | 1차 결과(focus 문제 포함)를 보고 코드 반영을 요청하실 때까지 |
| 6. variables.json 내보내기 + 토큰 CSS | 21:35:48 | 21:36:20 | 0분 32초 | Figma 내보내기(79개)와 길이·해시 일치 확인, npm run tokens로 [data-theme="dark"] 블록(22개, 모두 primitive 참조) 자동 생성 — 스크립트 수정 없음 |
| 7. Storybook 라이트/다크 전환 버튼 | 21:36:20 | 21:38:12 | 1분 52초 | 위쪽 도구 막대 버튼(globalTypes), <html data-theme> 반영(.storybook/theme-sync.ts), 문서 컨테이너 테마 연동(ThemedDocsContainer.tsx), 바탕색 토큰화(preview.css). 새 패키지 없음. 주소 지정·버튼 클릭 모두 동작 확인 |
| 8. Foundations 색 견본 light/dark | 21:38:12 | 21:39:29 | 1분 17초 | semantic 22개 견본을 light·dark 나란히, 모드별 참조·색 표시(guide-builder.mjs, GuideBlocks.tsx). 라이트·다크 화면 모두 확인 |
| 9. 다크 접근성 검사 + Figma 비교 | 21:39:29 | 21:41:58 | 2분 29초 | Figma "Dark 확인용" 인스턴스 17개의 연결 변수·dark 색 읽기, Storybook 다크 66개 항목 색 비교(다른 것 0), 컴포넌트 4개 axe 검사(위반은 Input 비활성 도움말 1종), 나란히 놓은 화면 비교 |
| 10. 하드코딩·불일치 확인 + README | 21:41:58 | 21:45:09 | 3분 11초 | .storybook을 하드코딩 검사 대상에 추가, npm run sync 통과(토큰 일치 85/불일치 0, 컴포넌트 20/0, 하드코딩 0), Vercel과 같은 명령 빌드 성공, 빌드 결과물에서 다크 동작·색 비교·접근성 재확인, README 숫자·모드 설명 갱신. 스토리 테스트는 첫 실행만 일시 실패, 이후 5회 통과 |

## 2차 합계

- 2차 시작 21:35:48 → 끝 21:45:09, **2차 9분 21초** (사용자 확인 대기 제외, 5번 단계 이후 작업 시간)
- 1차(Figma 적용) 4분 12초 + 2차 합계 = 다크 모드 전체 작업 시간
- 이번에 바꾼 것: variables.json(dark 포함 79개), 토큰 CSS, Storybook 도구 막대 전환 버튼, Foundations 색 견본(light/dark), 검사 대상(.storybook 추가), README
- 아직 commit하지 않음 (사용자 확인 후 commit)

## 남은 확인 사항

- Button primary의 focus 테두리(border/focus=primary/300)가 배경(bg/primary=primary/300)과 같은 색이라 다크에서 보이지 않음 (Figma 쪽 결정 대기)
- Input 비활성 도움말(text/disabled on bg/default 2.67:1)은 axe가 지적하지만 비활성 요소 예외로 둔 값 (라이트와 같은 성격)
- text/placeholder(dark) 2.68:1, border/default(dark) 2.68:1 (3:1 미만) — 선택하신 값

---

# 3차: Button primary focus 테두리 문제 해결 (추천 A안)

- **3차 시작 요청**: 2026-11-17 21:56:04
- 선택: A안 — 다크의 border/focus를 neutral/0(흰색)으로 (라이트는 그대로)

| 단계 | 시작 | 끝 | 걸린 시간 | 내용 |
|---|---|---|---|---|
| 11. 사용자 확인 대기 | 21:45:09 | 21:56:04 | 10분 55초 | 다크 모드 commit·push 후 focus 문제 해결 방향을 정하실 때까지 |
| 12. focus 문제 해결 (A안) | 21:56:04 | 21:59:25 | 3분 21초 | Figma border/focus dark 값을 neutral/0으로 변경(라이트 그대로), variables.json 내보내기(Figma와 길이·해시 일치), 토큰 CSS 1줄 변경, README 한계 문구 갱신, Figma·Storybook 화면에서 흰색 focus 테두리 확인, Vercel과 같은 명령 빌드·비교 66개 다른 것 0·접근성·테스트 확인 |

## 3차 합계

- 3차 시작 21:56:04 → 끝 21:59:25, **3차 3분 21초** (사용자 확인 대기 제외)
- 1차(Figma 적용)는 결정 대기 1분 31초를 빼면 2분 41초, 2차는 9분 21초(대기 제외)입니다.
- 이번에 바꾼 것: Figma border/focus(dark) 1개, variables.json 1줄, 토큰 CSS 1줄, 가이드 문서(자동 생성), README 1줄
- 아직 commit하지 않음 (사용자 확인 후 commit)
