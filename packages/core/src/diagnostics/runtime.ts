// Runtime capture: uncaught errors, rejections, failed resources, CSP blocks, font failures.
// Installed as early as the script runs; events before that are only caught by the image scan.
import { resourceDraft } from './layout.ts';
import type { Draft } from './record.ts';

const MAX = 50;

const where = (file?: string, line?: number, col?: number) =>
  file ? `${file.replace(location.origin, '')}${line ? `:${line}${col ? `:${col}` : ''}` : ''}` : undefined;

function errorText(reason: unknown): { msg: string; stack?: string } {
  if (reason instanceof Error) return { msg: `${reason.name}: ${reason.message}`, stack: reason.stack };
  try { return { msg: typeof reason === 'string' ? reason : JSON.stringify(reason) }; } catch { return { msg: String(reason) }; }
}

const firstFrames = (stack?: string) =>
  stack ? stack.split('\n').filter((l) => /^\s+at |@/.test(l)).slice(0, 3).map((l) => l.trim()).join(' ← ') : '';

export function captureRuntime(sink: Draft[], changed: () => void, isOwn: (file?: string) => boolean) {
  const push = (d: Draft) => {
    if (sink.length >= MAX) return;
    sink.push(d);
    changed();
  };

  addEventListener('error', (e) => {
    if (e instanceof ErrorEvent) {
      const { msg, stack } = errorText(e.error ?? e.message);
      const frames = firstFrames(stack);
      push({
        code: 'UI-RUNTIME-ERROR', got: msg, src: where(e.filename, e.lineno, e.colno),
        cause: isOwn(e.filename) ? 'agent-ui itself threw; please report it with this line' : `uncaught exception${frames ? ` (${frames})` : ''}`,
        fix: ['fix the throwing code; the rest of that script did not run'],
      });
      return;
    }
    const t = e.target as Element | null;
    if (!t || !(t instanceof Element)) return;
    const url = (t as HTMLImageElement).currentSrc || t.getAttribute('src') || t.getAttribute('href') || '';
    if (url) push(resourceDraft(t, url));
  }, true);

  addEventListener('unhandledrejection', (e) => {
    const { msg, stack } = errorText(e.reason);
    const frames = firstFrames(stack);
    push({
      code: 'UI-RUNTIME-ERROR', got: `unhandled rejection: ${msg}`,
      cause: `a promise rejected and nothing caught it${frames ? ` (${frames})` : ''}`,
      fix: ['await it inside try/catch, or add .catch()'],
    });
  });

  document.addEventListener('securitypolicyviolation', (e) => {
    push({
      code: 'UI-RESOURCE-FAILED', got: `blocked by CSP ${e.effectiveDirective}: ${e.blockedURI || 'inline'}`,
      src: where(e.sourceFile, e.lineNumber, e.columnNumber),
      cause: 'the Content-Security-Policy does not allow this',
      fix: [e.blockedURI === 'inline' ? 'move the inline code to a file the policy allows' : `load it from an allowed origin`],
    });
  });

  document.fonts?.addEventListener?.('loadingerror', (e) => {
    for (const f of (e as FontFaceSetLoadEvent).fontfaces) {
      push({
        code: 'UI-RESOURCE-FAILED', severity: 'warn', got: `font ${f.family} failed to load`,
        cause: 'text falls back to the next font in the stack', fix: ['check the @font-face src URL'],
      });
    }
  });
}
