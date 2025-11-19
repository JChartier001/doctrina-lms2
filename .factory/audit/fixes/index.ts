/**
 * Auto-fix engine exports
 */

export { AutoFixEngine, createAutoFixEngine, fixFile, fixAll } from './auto-fixer';
export { BackupManager, createBackupManager } from './backup';
export { useClientFixer } from './fixers/use-client';
export { exportsFixer } from './fixers/exports';
export { consoleFixer } from './fixers/console';
export { typesFixer } from './fixers/types';
export type { Violation, FixResult, AutoFixer, BackupInfo, AutoFixReport } from './types';
