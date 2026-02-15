export * from './types';
// Export from overcontext-discovery (preferred implementation)
export { 
    discoverConfigDirectories,
    loadHierarchicalConfig 
} from './overcontext-discovery';
// Also export the standalone discovery for backward compatibility
export { deepMerge } from './discovery';
