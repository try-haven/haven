'use client';

import { useEffect } from 'react';

/**
 * Handles chunk loading errors that occur when a new deployment
 * invalidates old chunk hashes. Forces a reload to fetch fresh assets.
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error || event.message;
      const errorString = error?.toString() || '';

      // Detect chunk loading errors
      const isChunkError =
        errorString.includes('Loading chunk') ||
        errorString.includes('ChunkLoadError') ||
        errorString.includes('Failed to fetch dynamically imported module') ||
        (event.filename && event.filename.includes('/_next/static/chunks/'));

      if (isChunkError) {
        console.warn('🔄 Chunk loading error detected, reloading page...', error);
        // Prevent error from bubbling
        event.preventDefault();
        // Force reload to get fresh chunks
        window.location.reload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';

      const isChunkError =
        reason.includes('Loading chunk') ||
        reason.includes('Failed to fetch dynamically imported module');

      if (isChunkError) {
        console.warn('🔄 Chunk loading error (unhandled promise), reloading...', event.reason);
        event.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
