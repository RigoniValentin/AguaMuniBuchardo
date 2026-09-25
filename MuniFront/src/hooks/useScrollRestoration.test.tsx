import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, render } from '@testing-library/react';
import { useScrollRestoration } from './useScrollRestoration';

function makeContainer(height: number): HTMLElement {
  const el = document.createElement('div');
  const state: { scrollTop: number } = { scrollTop: 0 };
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: height + 200 });
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: 200 });
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get() {
      return state.scrollTop;
    },
    set(v: number) {
      const max = el.scrollHeight - el.clientHeight;
      state.scrollTop = Math.max(0, Math.min(v, max));
    },
  });
  el.setAttribute('data-admin-scroll-container', '');
  document.body.appendChild(el);
  return el;
}

function Probe({
  ready,
  storageKey,
}: {
  ready?: boolean;
  storageKey?: string;
}) {
  useScrollRestoration({ storageKey, ready });
  return null;
}

describe('useScrollRestoration', () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('restores scrollTop from sessionStorage when ready', async () => {
    const container = makeContainer(800);
    sessionStorage.setItem('admin-list-scroll', '350');

    render(<Probe />);

    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });

    expect(container.scrollTop).toBe(350);
    expect(sessionStorage.getItem('admin-list-scroll')).toBeNull();
  });

  it('saves scrollTop on unmount', async () => {
    const container = makeContainer(800);
    container.scrollTop = 200;

    const { unmount } = render(<Probe storageKey="save-key" />);
    unmount();

    expect(sessionStorage.getItem('save-key')).toBe('200');
  });

  it('does not restore until ready is true', async () => {
    const container = makeContainer(800);
    sessionStorage.setItem('admin-list-scroll', '420');

    const Wrapper = ({ ready }: { ready: boolean }) => {
      return <Probe ready={ready} />;
    };

    const { rerender } = render(<Wrapper ready={false} />);

    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });
    expect(container.scrollTop).toBe(0);
    expect(sessionStorage.getItem('admin-list-scroll')).toBe('420');

    rerender(<Wrapper ready={true} />);

    // Give React time to run effects and the rAF chain to flush.
    await act(async () => {
      for (let i = 0; i < 10; i += 1) {
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }
    });

    expect(container.scrollTop).toBe(420);
    expect(sessionStorage.getItem('admin-list-scroll')).toBeNull();
  });

  it('clamps target to scrollable max when content shrinks', async () => {
    const container = makeContainer(200); // max scroll = 0 (no overflow)
    sessionStorage.setItem('admin-list-scroll', '999');

    render(<Probe />);

    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });

    expect(container.scrollTop).toBe(0);
    expect(sessionStorage.getItem('admin-list-scroll')).toBeNull();
  });

  it('ignores negative or non-numeric saved values', async () => {
    const container = makeContainer(800);
    sessionStorage.setItem('admin-list-scroll', 'abc');

    render(<Probe />);

    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });

    expect(container.scrollTop).toBe(0);
  });
});
