// Export adapter as the primary storage implementation
export { 
    create,
    redaksjonFilenameStrategy,
    type StorageInstance,
    type Entity,
    type EntityType 
} from './adapter';

// Also export the standalone storage for backward compatibility
export { create as createStandaloneStorage } from './storage';
