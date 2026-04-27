# START HERE

모든 작업자는 산출물을 만들기 전에 반드시 이 파일에서 시작한다.

## 읽기 순서

1. `START_HERE.md`
2. `00_HARNESS_CONTRACT.md`
3. `01_SOURCE_MANIFEST.md`
4. 자기 역할에 해당하는 `tasks/agent-*.md`

## 작업 시작 규칙

- 위 파일들을 읽기 전에는 MD/HTML 산출물을 만들지 않는다.
- 첫 응답 또는 작업 로그에 읽은 파일 목록을 보고한다.
- 기존 `week`, `이론`, `실습`, `특강`, `피드백` 파일은 수정하지 않는다.
- 산출물은 이 `이론보강` 폴더 안에만 만든다.
- MD가 통과하기 전에는 HTML을 만들지 않는다.
- 모든 MD는 비유 설명과 정석 개념 설명을 함께 포함한다.
- 모든 MD는 HTML 시뮬레이터 설계를 포함하고, HTML은 그 설계를 확장한다.

## 검증 명령

하네스만 확인:

```powershell
node .\tools\verify_outputs.mjs --harness-only
```

MD 확인:

```powershell
node .\tools\verify_outputs.mjs --md-only
```

HTML 확인:

```powershell
node .\tools\verify_outputs.mjs --html-only
```

전체 확인:

```powershell
node .\tools\verify_outputs.mjs --full
```

## 역할별 task

| 역할 | 파일 |
| --- | --- |
| 기존 자료 평가 + 커리큘럼 설계 | `tasks/agent-audit-curriculum.md` |
| Week1~2 MD 작성 | `tasks/agent-md-week1-2.md` |
| Week3~4 MD 작성 | `tasks/agent-md-week3-4.md` |
| Week5~6 MD 작성 | `tasks/agent-md-week5-6.md` |
| Week1~3 HTML 제작 | `tasks/agent-html-week1-3.md` |
| Week4~6 HTML 제작 | `tasks/agent-html-week4-6.md` |
| QA 검증 | `tasks/agent-qa.md` |
