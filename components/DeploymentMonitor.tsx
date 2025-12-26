'use client';

import { useVersionCheck } from '@/hooks/useVersionCheck';
import { ChunkErrorHandler } from './ChunkErrorHandler';

/**
 * Monitors for new deployments and handles chunk loading errors.
 * Automatically reloads the page when a new version is detected or
 * when chunk loading fails due to deployment.
 */
export function DeploymentMonitor() {
  useVersionCheck();

  return <ChunkErrorHandler />;
}
