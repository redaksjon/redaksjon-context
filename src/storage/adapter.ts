import { 
    discoverOvercontext, 
    OvercontextAPI,
    BaseEntity,
    createContext as createOvercontextContext,
    createFjellGcsProvider,
    createSchemaRegistry,
} from '@utilarium/overcontext';
import {
    redaksjonSchemas,
    redaksjonPluralNames,
} from '../schemas';
import type {
    Person,
    Project,
    Company,
    Term,
    IgnoredTerm,
    RedaksjonEntity,
    RedaksjonEntityType,
} from '../types';
import { existsSync, statSync, readdirSync } from 'node:fs';
import * as path from 'node:path';

/**
 * Entity filename strategy: first 8 chars of UUID + slug.
 * Produces filenames like `d00acdc4-gerald-corson.yaml`.
 * Falls back to entity.id when no slug is present.
 */
export const redaksjonFilenameStrategy = (entity: BaseEntity): string => {
    const slug = (entity as RedaksjonEntity & { slug?: string }).slug;
    if (slug) {
        const prefix = entity.id.substring(0, 8);
        return `${prefix}-${slug}`;
    }
    return entity.id;
};

// Re-export types for backwards compatibility
export type { Person, Project, Company, Term, IgnoredTerm, RedaksjonEntity };
export type EntityType = RedaksjonEntityType;
export type Entity = RedaksjonEntity;

/**
 * StorageInstance interface - matches protokoll's current API.
 */
export interface StorageInstance {
  load(contextDirs: string[]): Promise<void>;
  save(entity: Entity, targetDir: string, allowUpdate?: boolean): Promise<void>;
  delete(type: EntityType, id: string, targetDir: string): Promise<boolean>;
  get<T extends Entity>(type: EntityType, id: string): T | undefined;
  getAll<T extends Entity>(type: EntityType): T[];
  search(query: string): Entity[];
  findBySoundsLike(phonetic: string): Entity | undefined;
  clear(): void;
  getEntityFilePath(type: EntityType, id: string, contextDirs: string[]): string | undefined;
}

export interface GcsStorageOptions {
    bucketName: string;
    basePath: string;
    credentialsFile?: string;
}

export interface AdapterCreateOptions {
    gcs?: GcsStorageOptions;
}

/**
 * Create a storage instance backed by overcontext.
 * Maintains API compatibility with protokoll's existing storage.
 */
// Map entity types to their directory names
const TYPE_TO_DIRECTORY: Record<EntityType, string> = {
    person: 'people',
    project: 'projects',
    company: 'companies',
    term: 'terms',
    ignored: 'ignored',
};

export const create = (options: AdapterCreateOptions = {}): StorageInstance => {
    // In-memory cache for sync access (matching original behavior)
    const cache = new Map<EntityType, Map<string, Entity>>();
    let api: OvercontextAPI<typeof redaksjonSchemas> | undefined;
    let loadedContextDirs: string[] = [];
  
    const initCache = () => {
        cache.set('person', new Map());
        cache.set('project', new Map());
        cache.set('company', new Map());
        cache.set('term', new Map());
        cache.set('ignored', new Map());
    };
  
    initCache();
  
    return {
        async load(contextDirs: string[]): Promise<void> {
            initCache();
            loadedContextDirs = contextDirs;
            
            // If no context directories, leave API undefined (empty context)
            if (contextDirs.length === 0) {
                api = undefined;
                return;
            }
      
            try {
                if (options.gcs) {
                    const registry = createSchemaRegistry();
                    for (const [type, schema] of Object.entries(redaksjonSchemas)) {
                        registry.register({
                            type,
                            schema,
                            pluralName: redaksjonPluralNames[type as RedaksjonEntityType] ?? `${type}s`,
                        });
                    }
                    if (options.gcs.credentialsFile && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                        process.env.GOOGLE_APPLICATION_CREDENTIALS = options.gcs.credentialsFile;
                    }
                    const provider = await createFjellGcsProvider({
                        bucketName: options.gcs.bucketName,
                        basePath: options.gcs.basePath,
                        registry,
                    });
                    api = createOvercontextContext({
                        provider,
                        registry,
                        schemas: redaksjonSchemas,
                    });
                } else {
                    // contextDirs are already resolved paths (e.g., /path/to/context or /path/to/.protokoll/context)
                    // We need to determine the parent directory to start overcontext discovery from
                    // The context directory could be at different levels depending on configuration

                    // Take the last (most specific) context dir
                    const lastContextDir = contextDirs[contextDirs.length - 1];

                    // Get the parent directory of the context directory
                    // This will be the directory containing the context/ folder
                    const startDir = path.dirname(lastContextDir);

                    // Create overcontext API with hierarchical discovery
                    // Note: We use 'context' as contextDirName since we're starting from the parent
                    // Use maxLevels: 1 to limit discovery - we've already done hierarchical discovery
                    // in loadHierarchicalConfig and are passing the specific contextDirs we want.
                    // maxLevels: 1 prevents walking too far up the tree in CI environments where
                    // parent directories might contain unrelated context data.
                    api = await discoverOvercontext({
                        schemas: redaksjonSchemas,
                        pluralNames: redaksjonPluralNames,
                        startDir,
                        contextDirName: path.basename(lastContextDir),
                        maxLevels: 1,
                        filenameStrategy: redaksjonFilenameStrategy,
                    });
                }
      
                // Load all entities into cache
                for (const type of ['person', 'project', 'company', 'term', 'ignored'] as EntityType[]) {
                    const entities = await api.getAll(type);
                    for (const entity of entities) {
                        cache.get(type)?.set(entity.id, entity as Entity);
                    }
                }
            } catch (error) {
                // If no context directory found, leave API undefined (empty context)
                if (error instanceof Error && error.message.includes('No context directory found')) {
                    api = undefined;
                } else {
                    throw error;
                }
            }
        },
    
        async save(entity: Entity, _targetDir: string, allowUpdate = false): Promise<void> {
            // Check if entity already exists (for duplicate detection)
            const existing = cache.get(entity.type)?.get(entity.id);
            if (existing && !allowUpdate) {
                throw new Error(`Entity with id "${entity.id}" already exists`);
            }

            // If no API (empty context), just update cache (in-memory only)
            if (!api) {
                cache.get(entity.type)?.set(entity.id, entity);
                return;
            }
      
            // Save via overcontext (upsert will create or update)
            const saved = await api.upsert(entity.type, entity);
      
            // Update cache
            cache.get(entity.type)?.set(saved.id, saved as Entity);
        },
    
        async delete(type: EntityType, id: string, _targetDir: string): Promise<boolean> {
            if (!api) return false;
      
            const deleted = await api.delete(type, id);
            if (deleted) {
                cache.get(type)?.delete(id);
            }
            return deleted;
        },
    
        get<T extends Entity>(type: EntityType, id: string): T | undefined {
            return cache.get(type)?.get(id) as T | undefined;
        },
    
        getAll<T extends Entity>(type: EntityType): T[] {
            return Array.from(cache.get(type)?.values() ?? []) as T[];
        },
    
        search(query: string): Entity[] {
            const normalizedQuery = query.toLowerCase();
            const results: Entity[] = [];
            const seen = new Set<string>();
      
            for (const entityMap of cache.values()) {
                for (const entity of entityMap.values()) {
                    if (seen.has(entity.id)) continue;
          
                    // Check name
                    if (entity.name.toLowerCase().includes(normalizedQuery)) {
                        results.push(entity);
                        seen.add(entity.id);
                        continue;
                    }
          
                    // Check sounds_like
                    const sounds = (entity as Entity & { sounds_like?: string[] }).sounds_like;
                    if (sounds?.some((s: string) => s.toLowerCase().includes(normalizedQuery))) {
                        results.push(entity);
                        seen.add(entity.id);
                    }
                }
            }
      
            return results;
        },
    
        findBySoundsLike(phonetic: string): Entity | undefined {
            const normalized = phonetic.toLowerCase().trim();
      
            for (const entityMap of cache.values()) {
                for (const entity of entityMap.values()) {
                    const sounds = (entity as Entity & { sounds_like?: string[] }).sounds_like;
                    if (sounds?.some((s: string) => s.toLowerCase() === normalized)) {
                        return entity;
                    }
                }
            }
      
            return undefined;
        },
    
        clear(): void {
            initCache();
            api = undefined;
        },
    
        getEntityFilePath(type: EntityType, id: string, contextDirs: string[]): string | undefined {
            if (options.gcs) {
                // GCS-backed storage does not expose local file paths.
                return undefined;
            }

            const dirName = TYPE_TO_DIRECTORY[type];
            const dirsToSearch = contextDirs.length > 0 ? contextDirs : loadedContextDirs;
            const entity = cache.get(type)?.get(id);
            
            for (const contextDir of [...dirsToSearch].reverse()) {
                const entityDir = path.join(contextDir, dirName);

                // Try compound filename first (e.g. d00acdc4-gerald-corson.yaml)
                if (entity) {
                    const compoundName = redaksjonFilenameStrategy(entity as RedaksjonEntity & { slug?: string });
                    for (const ext of ['.yaml', '.yml']) {
                        const filePath = path.join(entityDir, `${compoundName}${ext}`);
                        if (existsSync(filePath) && statSync(filePath).isFile()) {
                            return filePath;
                        }
                    }
                }

                // Fall back to direct id-based filename (legacy)
                for (const ext of ['.yaml', '.yml']) {
                    const filePath = path.join(entityDir, `${id}${ext}`);
                    if (existsSync(filePath) && statSync(filePath).isFile()) {
                        return filePath;
                    }
                }

                // Prefix scan as last resort (handles files we haven't cached yet)
                if (existsSync(entityDir)) {
                    const prefix = id.substring(0, 8);
                    try {
                        const files = readdirSync(entityDir);
                        const match = files.find(f =>
                            f.startsWith(prefix) && (f.endsWith('.yaml') || f.endsWith('.yml'))
                        );
                        if (match) {
                            return path.join(entityDir, match);
                        }
                    } catch { /* directory read failed */ }
                }
            }
            
            return undefined;
        },
    };
};
