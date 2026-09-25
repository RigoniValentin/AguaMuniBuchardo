import { useEffect, useRef } from 'react';

export const ADMIN_SCROLL_CONTAINER_SELECTOR = '[data-admin-scroll-container]';

interface UseScrollRestorationOptions {
  /** Clave usada en sessionStorage. Default: 'admin-list-scroll'. */
  storageKey?: string;
  /** Selector CSS del contenedor con scroll. Default: '[data-admin-scroll-container]'. */
  containerSelector?: string;
  /** Cuando es `true`, intenta restaurar la posición guardada (se limpia al restaurar). */
  ready?: boolean;
}

/**
 * Restaura la posición de scroll de un contenedor al volver a una pantalla.
 *
 * - Al montar y cuando `ready` pasa a `true`, lee `sessionStorage[storageKey]`
 *   y aplica `scrollTop` al contenedor. Si la pantalla es más corta que la
 *   posición guardada, espera a que el contenido crezca (con un retry usando
 *   `requestAnimationFrame`) para garantizar que se aplique el valor real.
 * - Al desmontar, guarda el `scrollTop` actual en `sessionStorage` para que
 *   pueda ser restaurado en el próximo montaje.
 *
 * El scope es por pestaña (sessionStorage) y se limpia al restaurar, evitando
 * arrastrar la posición entre sesiones.
 */
export function useScrollRestoration({
  storageKey = 'admin-list-scroll',
  containerSelector = ADMIN_SCROLL_CONTAINER_SELECTOR,
  ready = true,
}: UseScrollRestorationOptions = {}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = document.querySelector<HTMLElement>(containerSelector);
    if (!container) return;
    containerRef.current = container;

    return () => {
      const node = containerRef.current;
      // Reseteamos el flag para que un re-mount (p.ej. StrictMode en dev)
      // pueda volver a intentar restaurar la posición guardada por este cleanup.
      restoredRef.current = false;
      if (node) {
        try {
          sessionStorage.setItem(storageKey, String(node.scrollTop));
        } catch {
          /* sessionStorage no disponible */
        }
      }
    };
  }, [containerSelector, storageKey]);

  useEffect(() => {
    if (!ready || restoredRef.current) return;
    if (typeof window === 'undefined') return;

    const container =
      containerRef.current ?? document.querySelector<HTMLElement>(containerSelector);
    if (!container) return;

    const saved = sessionStorage.getItem(storageKey);
    if (!saved) {
      restoredRef.current = true;
      return;
    }

    const targetY = parseInt(saved, 10);
    sessionStorage.removeItem(storageKey);
    restoredRef.current = true;

    if (Number.isNaN(targetY) || targetY <= 0) return;

    let attempts = 0;
    const maxAttempts = 10;
    const tryRestore = () => {
      const max = container.scrollHeight - container.clientHeight;
      if (container.scrollTop < targetY && max < targetY && attempts < maxAttempts) {
        attempts += 1;
        requestAnimationFrame(tryRestore);
        return;
      }
      container.scrollTop = Math.min(targetY, Math.max(max, 0));
    };
    requestAnimationFrame(tryRestore);
  }, [ready, storageKey, containerSelector]);
}
