// Schemas and types (existing exports)
export * from './schemas';
export * from './types';

// Backward-compatible type aliases
export type { RedaksjonEntity as Entity, RedaksjonEntityType as EntityType } from './types';

// Runtime (new exports)
export { create, type ContextInstance, type CreateOptions } from './runtime';
export { 
    create as createStorage,
    createStandaloneStorage,
    type StorageInstance, 
    type Entity as StorageEntity, 
    type EntityType as StorageEntityType 
} from './storage';
export * from './discovery';
export * from './helpers';
