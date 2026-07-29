'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

function RouteProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const activeRef = useRef(false);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const startProgress = () => {
    clearTimers();
    if (trickleRef.current) {
      clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    activeRef.current = true;
    setVisible(true);
    if (reduced) {
      setProgress(40);
      return;
    }
    setProgress(12);
    trickleRef.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.12));
    }, 220);
  };

  const finishProgress = () => {
    if (!activeRef.current) return;
    activeRef.current = false;
    if (trickleRef.current) {
      clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    setProgress(100);
    const delay = reduced ? 0 : 280;
    timersRef.current.push(
      setTimeout(() => {
        setVisible(false);
        timersRef.current.push(setTimeout(() => setProgress(0), delay));
      }, delay),
    );
  };

  useEffect(() => {
    const currentHref = () => window.location.pathname + window.location.search;
    const urlChanged = (raw: URL | string | null | undefined) => {
      if (!raw) return true;
      try {
        const next = new URL(
          typeof raw === 'string' ? raw : raw.href,
          window.location.href,
        );
        return next.pathname + next.search !== currentHref();
      } catch {
        return false;
      }
    };

    const originalPush = history.pushState.bind(history);
    const originalReplace = history.replaceState.bind(history);
    history.pushState = ((state, _unused, url) => {
      if (urlChanged(url)) startProgress();
      return originalPush(state, _unused, url);
    }) as typeof history.pushState;
    history.replaceState = ((state, _unused, url) => {
      if (urlChanged(url)) startProgress();
      return originalReplace(state, _unused, url);
    }) as typeof history.replaceState;

    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const link = target?.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href) return;
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }
      try {
        const next = new URL(href, window.location.href);
        if (next.origin !== window.location.origin) return;
        if (next.pathname + next.search === currentHref()) return;
        startProgress();
      } catch {
        /* ignore malformed hrefs */
      }
    };
    const onPopState = () => startProgress();

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      history.pushState = originalPush;
      history.replaceState = originalReplace;
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const routeKey = pathname + (searchParams?.toString() ?? '');
  useEffect(() => {
    finishProgress();
    return () => {
      clearTimers();
      if (trickleRef.current) {
        clearInterval(trickleRef.current);
        trickleRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] h-0.5 bg-mint transition-[width,opacity] ease-out"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
        transitionDuration: reduced ? '0ms' : '280ms',
      }}
    />
  );
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressInner />
    </Suspense>
  );
}
