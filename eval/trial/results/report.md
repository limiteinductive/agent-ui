# Agent trial results

## Convergence

"Clean" means 0 errors and 0 warnings at both 360 and 1280 (light), counting each (code, element) once. "Clean ≤ fix k" means the page became clean by the k-th diagnostic-driven fix pass.

| model | cond | n | first-shot clean | clean ≤ fix 1 | clean ≤ fix 2 | p0 errors | p0 warns | gen failures |
|---|---|---|---|---|---|---|---|---|
| gpt-5.6 | skill | 12 | 50% | 67% | 75% | 0.5 | 0.7 | 0 |
| gpt-6.2 | skill | 12 | 92% | 100% | 100% | 0.1 | 0.0 | 0 |
| opus | skill | 12 | 75% | 100% | 100% | 0.1 | 0.3 | 0 |
| sonnet | skill | 12 | 75% | 92% | 92% | 0.2 | 0.2 | 0 |
| haiku | skill | 12 | 75% | 92% | 92% | 0.3 | 0.1 | 0 |
| **all** | skill | 60 | 73% | 90% | 92% | 0.2 | 0.2 | 0 |
| gpt-5.6 | bare | 12 | 0% | 17% | 58% | 15.5 | 13.7 | 0 |
| gpt-6.2 | bare | 12 | 17% | 100% | 100% | 2.4 | 1.3 | 0 |
| opus | bare | 12 | 0% | 25% | 83% | 19.7 | 4.8 | 0 |
| sonnet | bare | 12 | 0% | 33% | 83% | 10.8 | 1.9 | 0 |
| haiku | bare | 12 | 0% | 33% | 92% | 21.3 | 7.8 | 0 |
| **all** | bare | 60 | 3% | 42% | 83% | 13.9 | 5.9 | 0 |

## By task

| task | cond | n | first-shot clean | clean ≤ fix 2 |
|---|---|---|---|---|
| pricing | skill | 10 | 90% | 90% |
| dashboard | skill | 10 | 50% | 80% |
| settings | skill | 10 | 70% | 90% |
| article | skill | 10 | 100% | 100% |
| calendar | skill | 10 | 40% | 90% |
| shop | skill | 10 | 90% | 100% |
| pricing | bare | 10 | 0% | 70% |
| dashboard | bare | 10 | 0% | 80% |
| settings | bare | 10 | 0% | 70% |
| article | bare | 10 | 10% | 90% |
| calendar | bare | 10 | 10% | 100% |
| shop | bare | 10 | 0% | 90% |

## Diagnostics on first shots

| code | cond | pages | instances |
|---|---|---|---|
| layout/horizontal-overflow | skill | 10/60 | 10 |
| row/overflow | skill | 10/60 | 18 |
| UI-UNKNOWN-ATTR | skill | 1/60 | 1 |
| UI-UNKNOWN-ELEMENT | bare | 53/60 | 1241 |
| UI-ALIAS | bare | 51/60 | 711 |
| UI-UNKNOWN-ATTR | bare | 41/60 | 195 |
| UI-BAD-VALUE | bare | 27/60 | 205 |
| layout/horizontal-overflow | bare | 23/60 | 28 |
| row/overflow | bare | 8/60 | 30 |
| grid/cramped | bare | 6/60 | 10 |
| UI-PREFER-NATIVE | bare | 5/60 | 28 |
| UI-CONFLICT | bare | 4/60 | 5 |
| UI-MISPLACED-ATTR | bare | 1/60 | 1 |
| UI-NESTED-ROOT | bare | 1/60 | 1 |

## Fix passes

Problems keyed by (code, opening tag), errors and warnings only. "Introduced" are problems absent before the pass.

| cond | pass | pages fixed | now clean | E+W before | E+W after | resolved | introduced | pages with new problems |
|---|---|---|---|---|---|---|---|---|
| skill | fix 1 | 16 | 63% | 1.7 | 0.4 | 21 | 5 | 4 |
| skill | fix 2 | 6 | 17% | 1.2 | 1.0 | 4 | 3 | 2 |
| bare | fix 1 | 58 | 40% | 20.5 | 1.2 | 1176 | 63 | 34 |
| bare | fix 2 | 35 | 71% | 2.0 | 0.4 | 64 | 12 | 9 |

## Invented vocabulary (first shots, both conditions)

Counted once per page. These are candidates for aliases or new elements.

### Unknown elements

| spelling | pages | models |
|---|---|---|
| `ui-badge` | 51 | 5 |
| `ui-divider` | 20 | 4 |
| `ui-avatar` | 19 | 4 |
| `ui-text` | 15 | 3 |
| `ui-scroll` | 13 | 4 |
| `ui-cluster` | 12 | 2 |
| `ui-heading` | 7 | 2 |
| `ui-input` | 5 | 3 |
| `ui-select` | 5 | 3 |
| `ui-header` | 5 | 1 |
| `ui-section` | 4 | 3 |
| `ui-field` | 4 | 3 |
| `ui-chip` | 4 | 3 |
| `ui-icon` | 4 | 2 |
| `ui-alert` | 3 | 3 |
| `ui-sidebar` | 3 | 2 |
| `ui-checkbox` | 3 | 2 |
| `ui-menu` | 3 | 2 |
| `ui-footer` | 3 | 1 |
| `ui-toggle` | 2 | 2 |
| `ui-callout` | 2 | 2 |
| `ui-menu-item` | 2 | 2 |
| `ui-image` | 2 | 2 |
| `ui-sidebar-layout` | 2 | 1 |
| `ui-nav` | 1 | 1 |

### Unknown attributes

| spelling | pages | models |
|---|---|---|
| `ui-container padding="md"` | 12 | 4 |
| `ui-button full-width` | 5 | 2 |
| `ui-stack margin="auto"` | 4 | 2 |
| `ui-grid cols="3"` | 4 | 1 |
| `ui-button href="#plans"` | 3 | 2 |
| `ui-button href="#"` | 3 | 2 |
| `ui-card highlighted` | 3 | 2 |
| `ui-card span="2"` | 3 | 2 |
| `ui-stack max-width="1280px"` | 3 | 2 |
| `ui-button block` | 3 | 1 |
| `ui-grid cols="1"` | 3 | 1 |
| `ui-grid cols="2"` | 2 | 2 |
| `ui-grid cols-md="3"` | 2 | 2 |
| `ui-card span-md="2"` | 2 | 2 |
| `ui-stack max-width="960px"` | 2 | 2 |
| `ui-stack text-align="center"` | 2 | 1 |
| `ui-grid cols="7"` | 2 | 1 |
| `ui-stack min-height="100vh"` | 2 | 1 |
| `ui-stack center` | 2 | 1 |
| `ui-card width="280"` | 2 | 1 |
| `ui-stack padding-block="lg"` | 2 | 1 |
| `ui-card item-width="sm"` | 1 | 1 |
| `ui-grid cols="4"` | 1 | 1 |
| `ui-card border="primary"` | 1 | 1 |
| `ui-card overflow="x"` | 1 | 1 |

### Aliases used

| spelling | pages | models |
|---|---|---|
| `ui-stack justify="between"` | 20 | 5 |
| `ui-stack direction="row"` | 18 | 5 |
| `ui-stack gap="none"` | 13 | 4 |
| `ui-row justify="between"` | 10 | 4 |
| `ui-stack gap="medium"` | 8 | 1 |
| `ui-stack gap="small"` | 8 | 1 |
| `ui-stack gap="large"` | 8 | 1 |
| `ui-grid min="260px"` | 6 | 3 |
| `ui-stack padding="large"` | 5 | 1 |
| `ui-grid min="200px"` | 4 | 3 |
| `ui-grid min="150px"` | 4 | 2 |
| `ui-stack direction="column"` | 4 | 2 |
| `ui-grid min="240px"` | 4 | 2 |
| `ui-grid gap="medium"` | 4 | 1 |
| `ui-grid gap="large"` | 4 | 1 |
| `ui-stack padding="medium"` | 4 | 1 |
| `ui-grid min="20rem"` | 2 | 2 |
| `ui-card padding="none"` | 2 | 2 |
| `ui-grid min="320px"` | 2 | 2 |
| `ui-grid min="220px"` | 2 | 2 |
| `ui-grid min="160px"` | 2 | 2 |
| `ui-layout <ui-layout>` | 2 | 1 |
| `ui-grid min="18rem"` | 2 | 1 |
| `ui-button size="large"` | 2 | 1 |
| `ui-card padding="medium"` | 2 | 1 |

## Library adoption

"Final" is the last page in each chain (the clean one, or fix 2).

| cond | page | n | ui-* elements | distinct ui-* | has <style> | mean CSS chars | style attrs | class attrs | data-ui-allow | diagnostics off |
|---|---|---|---|---|---|---|---|---|---|---|
| skill | first | 60 | 36.6 | 6.6 | 13% | 210 | 1.1 | 1.2 | 5 | 0 |
| skill | final | 60 | 36.6 | 6.6 | 13% | 210 | 1.4 | 1.2 | 5 | 0 |
| bare | first | 60 | 45.6 | 7.5 | 17% | 307 | 0.5 | 1.1 | 0 | 0 |
| bare | final | 60 | 32.3 | 4.3 | 17% | 304 | 0.7 | 1.3 | 0 | 0 |
