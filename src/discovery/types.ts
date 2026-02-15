/**
 * Discovery Types
 * 
 * Types for hierarchical configuration discovery.
 */

export interface ContextDiscoveryOptions {
  configDirName: string;      // e.g., '.protokoll'
  configFileName: string;     // e.g., 'config.yaml'
  maxLevels?: number;         // How far up to search (default: 10)
  startingDir?: string;       // Where to start (default: process.cwd())
}

export interface DiscoveredContextDir {
  path: string;
  level: number;  // 0 = closest, higher = further up
}

export interface HierarchicalContextResult {
  config: Record<string, unknown>;
  discoveredDirs: DiscoveredContextDir[];
  contextDirs: string[];  // All context subdirectories to load
}
