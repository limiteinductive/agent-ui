# Agent trial results

## Convergence

"Clean" means 0 errors and 0 warnings at both 360 and 1280 (light), counting each (code, element) once. "Clean ≤ fix k" means the page became clean by the k-th diagnostic-driven fix pass.

| model | cond | n | first-shot clean | clean ≤ fix 1 | clean ≤ fix 2 | p0 errors | p0 warns | gen failures |
|---|---|---|---|---|---|---|---|---|
| gpt-5.6 | skill | 12 | 83% | 100% | 100% | 0.2 | 0.0 | 0 |
| gpt-6.2 | skill | 12 | 92% | 92% | 100% | 0.0 | 0.1 | 2 |
| opus | skill | 12 | 100% | 100% | 100% | 0.0 | 0.0 | 0 |
| sonnet | skill | 12 | 92% | 100% | 100% | 0.2 | 0.1 | 0 |
| haiku | skill | 12 | 92% | 92% | 92% | 0.1 | 0.1 | 0 |
| **all** | skill | 60 | 92% | 97% | 98% | 0.1 | 0.1 | 2 |
| gpt-5.6 | bare | 12 | 0% | 25% | 83% | 12.8 | 11.2 | 1 |
| gpt-6.2 | bare | 12 | 17% | 100% | 100% | 3.3 | 0.4 | 0 |
| opus | bare | 12 | 0% | 83% | 100% | 23.6 | 5.8 | 0 |
| sonnet | bare | 12 | 0% | 58% | 100% | 6.8 | 2.5 | 0 |
| haiku | bare | 12 | 0% | 50% | 100% | 14.4 | 7.6 | 0 |
| **all** | bare | 60 | 3% | 63% | 97% | 12.2 | 5.5 | 1 |

## By task

| task | cond | n | first-shot clean | clean ≤ fix 2 |
|---|---|---|---|---|
| pricing | skill | 10 | 80% | 90% |
| dashboard | skill | 10 | 100% | 100% |
| settings | skill | 10 | 100% | 100% |
| article | skill | 10 | 100% | 100% |
| shop | skill | 10 | 100% | 100% |
| calendar | skill | 10 | 70% | 100% |
| pricing | bare | 10 | 0% | 100% |
| dashboard | bare | 10 | 0% | 90% |
| settings | bare | 10 | 0% | 90% |
| article | bare | 10 | 10% | 100% |
| shop | bare | 10 | 10% | 100% |
| calendar | bare | 10 | 0% | 100% |

## Diagnostics on first shots

| code | cond | pages | instances |
|---|---|---|---|
| layout/horizontal-overflow | skill | 3/60 | 3 |
| row/overflow | skill | 3/60 | 3 |
| UI-BAD-VALUE | skill | 1/60 | 2 |
| row/space-between-many | skill | 1/60 | 1 |
| UI-ALIAS | bare | 50/60 | 645 |
| UI-UNKNOWN-ELEMENT | bare | 49/60 | 1174 |
| UI-UNKNOWN-ATTR | bare | 41/60 | 219 |
| UI-BAD-VALUE | bare | 19/60 | 227 |
| layout/horizontal-overflow | bare | 15/60 | 15 |
| row/overflow | bare | 12/60 | 48 |
| grid/cramped | bare | 6/60 | 7 |
| UI-CONFLICT | bare | 5/60 | 7 |
| UI-NESTED-ROOT | bare | 2/60 | 2 |
| UI-PREFER-NATIVE | bare | 1/60 | 6 |
| UI-MISPLACED-ATTR | bare | 1/60 | 5 |

## Fix passes

Problems keyed by (code, opening tag), errors and warnings only. "Introduced" are problems absent before the pass.

| cond | pass | pages fixed | now clean | E+W before | E+W after | resolved | introduced | pages with new problems |
|---|---|---|---|---|---|---|---|---|
| skill | fix 1 | 5 | 60% | 1.6 | 0.4 | 7 | 1 | 1 |
| skill | fix 2 | 2 | 50% | 1.0 | 0.5 | 1 | 0 | 0 |
| bare | fix 1 | 58 | 62% | 18.3 | 0.7 | 1038 | 37 | 22 |
| bare | fix 2 | 22 | 91% | 2.0 | 0.2 | 38 | 5 | 2 |

## Invented vocabulary (first shots, both conditions)

Counted once per page. These are candidates for aliases or new elements.

### Unknown elements

| spelling | pages | models |
|---|---|---|
| `ui-badge` | 48 | 5 |
| `ui-avatar` | 22 | 5 |
| `ui-divider` | 21 | 4 |
| `ui-text` | 14 | 4 |
| `ui-scroll` | 11 | 4 |
| `ui-chip` | 7 | 5 |
| `ui-heading` | 6 | 3 |
| `ui-cluster` | 5 | 2 |
| `ui-switch` | 4 | 3 |
| `ui-menu` | 4 | 3 |
| `ui-menu-item` | 4 | 3 |
| `ui-input` | 4 | 2 |
| `ui-sidebar` | 3 | 3 |
| `ui-alert` | 3 | 2 |
| `ui-header` | 3 | 2 |
| `ui-field` | 3 | 2 |
| `ui-select` | 3 | 2 |
| `ui-section` | 2 | 2 |
| `ui-checkbox` | 2 | 2 |
| `ui-sidebar-layout` | 2 | 1 |
| `ui-box` | 2 | 1 |
| `ui-icon` | 2 | 1 |
| `ui-tag` | 2 | 1 |
| `ui-code-block` | 2 | 1 |
| `ui-progress` | 2 | 1 |

### Unknown attributes

| spelling | pages | models |
|---|---|---|
| `ui-container padding="md"` | 12 | 4 |
| `ui-grid cols="2"` | 4 | 1 |
| `ui-button block` | 4 | 1 |
| `ui-stack margin="auto"` | 4 | 1 |
| `ui-card span-lg="2"` | 3 | 3 |
| `ui-button href="#"` | 3 | 2 |
| `ui-stack text-align="center"` | 3 | 2 |
| `ui-card width="280px"` | 3 | 2 |
| `ui-grid cols="3"` | 3 | 1 |
| `ui-grid cols="1"` | 3 | 1 |
| `ui-card highlighted` | 2 | 2 |
| `ui-button full` | 2 | 2 |
| `ui-container padding="4"` | 2 | 2 |
| `ui-button full-width` | 2 | 1 |
| `ui-button href="#plans"` | 2 | 1 |
| `ui-card span="2"` | 2 | 1 |
| `ui-card emphasis="high"` | 2 | 1 |
| `ui-stack min-height="100vh"` | 2 | 1 |
| `ui-stack max-width="1180px"` | 2 | 1 |
| `ui-card min-width="280px"` | 2 | 1 |
| `ui-stack as="section"` | 1 | 1 |
| `ui-card highlighted="true"` | 1 | 1 |
| `ui-grid align="stretch"` | 1 | 1 |
| `ui-grid cols-lg="3"` | 1 | 1 |
| `ui-grid cols="7"` | 1 | 1 |

### Aliases used

| spelling | pages | models |
|---|---|---|
| `ui-stack justify="between"` | 22 | 3 |
| `ui-stack direction="row"` | 19 | 4 |
| `ui-row justify="between"` | 16 | 3 |
| `ui-stack gap="none"` | 13 | 3 |
| `ui-stack gap="medium"` | 7 | 1 |
| `ui-stack gap="small"` | 7 | 1 |
| `ui-stack gap="large"` | 7 | 1 |
| `ui-stack padding="large"` | 5 | 1 |
| `ui-grid min="160px"` | 4 | 2 |
| `ui-stack direction="column"` | 4 | 2 |
| `ui-grid min="240px"` | 4 | 2 |
| `ui-grid min="20rem"` | 3 | 3 |
| `ui-card tone="danger"` | 3 | 3 |
| `ui-grid min="260px"` | 3 | 2 |
| `ui-grid min="16rem"` | 3 | 2 |
| `ui-grid min="10rem"` | 3 | 2 |
| `ui-layout <ui-layout>` | 3 | 2 |
| `ui-grid min="220px"` | 3 | 2 |
| `ui-card padding="none"` | 3 | 2 |
| `ui-card variant="elevated"` | 2 | 2 |
| `ui-grid columns-md="3"` | 2 | 2 |
| `ui-app <ui-app>` | 2 | 2 |
| `ui-grid min="13rem"` | 2 | 2 |
| `ui-grid min="280px"` | 2 | 2 |
| `ui-grid columns-lg="3"` | 2 | 2 |

## Library adoption

"Final" is the last page in each chain (the clean one, or fix 2).

| cond | page | n | ui-* elements | distinct ui-* | has <style> | mean CSS chars | style attrs | class attrs | data-ui-allow | diagnostics off |
|---|---|---|---|---|---|---|---|---|---|---|
| skill | first | 60 | 36.9 | 6.7 | 13% | 336 | 0.8 | 3.0 | 3 | 0 |
| skill | final | 60 | 36.9 | 6.7 | 13% | 337 | 0.8 | 3.0 | 3 | 0 |
| bare | first | 60 | 46.6 | 7.4 | 17% | 345 | 0.5 | 2.4 | 0 | 0 |
| bare | final | 60 | 34.5 | 4.4 | 17% | 343 | 0.8 | 2.7 | 0 | 0 |

## Generation failures

- pages-v2/skill/calendar/gpt-6.2-s0-p0.html: ~/agent-ui/eval/trial/node_modules/.bin/codex exit null: gents].enabled = false` disables subagent tools even when the model selects a subagent version, unless `[features].multi_agent_v2` is
- pages-v2/bare/pricing/gpt-5.6-s1-p0.html: ~/agent-ui/eval/trial/node_modules/.bin/codex exit null: 

        <ui-stack direction="row" justify="between" gap="16px" wrap="true">
          <small>© 2026 Orbit, Inc. All rights reserved
- pages-v2/skill/calendar/gpt-6.2-s1-p0.html: ~/agent-ui/eval/trial/node_modules/.bin/codex exit null: gents].enabled = false` disables subagent tools even when the model selects a subagent version, unless `[features].multi_agent_v2` is
