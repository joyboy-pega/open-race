'use client';

import { useEffect } from 'react';

/**
 * PWA Service Worker registrar (runs in production only).
 * The install prompt banner has been removed per user preference.
 */
export function PwaRegister() {
  useEffect(() => {
    // Register Service Worker in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('PWA Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('PWA Service Worker registration failed:', err);
        });
    }
  }, []);

  return null;
}
