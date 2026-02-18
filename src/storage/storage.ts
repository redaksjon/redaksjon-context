/**
 * Context Storage
 * 
 * Handles loading and saving entity YAML files from context directories.
 * Supports hierarchical loading where later directories override earlier ones.
 * 
 * Design Note: This module is designed to be self-contained and may be
 * extracted for use in other tools (kronologi, observasjon) in the future.
 */

import * as yaml from 'js-yaml';
import * as fs from 'fs/promises';
// eslint-disable-next-line no-restricted-imports
import { existsSync, statSync, readdirSync } from 'fs';
import * as path from 'node:path';
import { RedaksjonEntity as Entity, RedaksjonEntityType as EntityType } from '../types';

export interface StorageInstance {
  load(contextDirs: string[]): Promise<void>;
  save(entity: Entity, targetDir: string): Promise<void>;
  delete(type: EntityType, id: string, targetDir: string): Promise<boolean>;
  get<T extends Entity>(type: EntityType, id: string): T | undefined;
  getAll<T extends Entity>(type: EntityType): T[];
  search(query: string): Entity[];
  findBySoundsLike(phonetic: string): Entity | undefined;
  clear(): void;
  getEntityFilePath(type: EntityType, id: string, contextDirs: string[]): string | undefined;
}

type DirectoryName = 'people' | 'projects' | 'companies' | 'terms' | 'ignored';

const DIRECTORY_TO_TYPE: Record<DirectoryName, EntityType> = {
    'people': 'person',
    'projects': 'project',
    'companies': 'company',
    'terms': 'term',
    'ignored': 'ignored',
};

const TYPE_TO_DIRECTORY: Record<EntityType, DirectoryName> = {
    'person': 'people',
    'project': 'projects',
    'company': 'companies',
    'term': 'terms',
    'ignored': 'ignored',
};

/**
 * Simple slugify function for generating slugs from names
 */
function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export const create = (): StorageInstance => {
    const entities: Map<EntityType, Map<string, Entity>> = new Map([
        ['person', new Map()],
        ['project', new Map()],
        ['company', new Map()],
        ['term', new Map()],
        ['ignored', new Map()],
    ]);

    const load = async (contextDirs: string[]): Promise<void> => {
    // Load from all context directories (later directories override)
        for (const contextDir of contextDirs) {
            for (const dirName of Object.keys(DIRECTORY_TO_TYPE) as DirectoryName[]) {
                const typeDir = path.join(contextDir, dirName);
                const entityType = DIRECTORY_TO_TYPE[dirName];
        
                try {
                    const files = await fs.readdir(typeDir);
                    for (const file of files) {
                        if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue;
            
                        const content = await fs.readFile(path.join(typeDir, file), 'utf-8');
                        const parsed = yaml.load(content) as Partial<Entity>;
            
                        if (parsed && parsed.id) {
                            entities.get(entityType)?.set(parsed.id, {
                                ...parsed,
                                type: entityType,
                            } as Entity);
                        }
                    }
                } catch {
                    // Directory doesn't exist, skip
                }
            }
        }
    };

    const save = async (entity: Entity, targetDir: string): Promise<void> => {
        const dirName = TYPE_TO_DIRECTORY[entity.type];
        // Save to context subdirectory (context/people/, context/projects/, etc.)
        const dirPath = path.join(targetDir, 'context', dirName);
        await fs.mkdir(dirPath, { recursive: true });
    
        // Generate filename: {uuid-prefix}-{slug}.yaml
        const entityWithSlug = entity as Entity & { slug?: string };
        const uuidPrefix = entity.id.substring(0, 10);
        const slug = entityWithSlug.slug || slugify(entity.name);
        const filename = `${uuidPrefix}-${slug}.yaml`;
        const filePath = path.join(dirPath, filename);
    
        // Remove type from saved YAML (it's inferred from directory)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { type: _entityType, ...entityWithoutType } = entity;
        const content = yaml.dump(entityWithoutType, { lineWidth: -1, noRefs: true });
        await fs.writeFile(filePath, content, 'utf-8');
    
        entities.get(entity.type)?.set(entity.id, entity);
    };

    const deleteEntity = async (type: EntityType, id: string, targetDir: string): Promise<boolean> => {
        const dirName = TYPE_TO_DIRECTORY[type];
        
        // Resolve ID to UUID if it's a slug
        const resolvedId = resolveEntityId(type, id);
        if (!resolvedId) return false;
        
        // Try to find file with UUID prefix
        const uuidPrefix = resolvedId.substring(0, 10);
        const possibleDirs = [
            path.join(targetDir, dirName),
            path.join(targetDir, 'context', dirName),
        ];
        
        for (const dir of possibleDirs) {
            try {
                const files = await fs.readdir(dir);
                for (const file of files) {
                    if (file.startsWith(uuidPrefix) && (file.endsWith('.yaml') || file.endsWith('.yml'))) {
                        await fs.unlink(path.join(dir, file));
                        entities.get(type)?.delete(resolvedId);
                        return true;
                    }
                }
            } catch {
                // Directory doesn't exist or can't be read, try next
            }
        }
        
        // Fallback: try legacy slug-based filenames
        const possiblePaths = [
            path.join(targetDir, dirName, `${resolvedId}.yaml`),
            path.join(targetDir, dirName, `${resolvedId}.yml`),
            path.join(targetDir, 'context', dirName, `${resolvedId}.yaml`),
            path.join(targetDir, 'context', dirName, `${resolvedId}.yml`),
        ];
        
        for (const filePath of possiblePaths) {
            try {
                await fs.unlink(filePath);
                entities.get(type)?.delete(resolvedId);
                return true;
            } catch {
                // File doesn't exist at this path, try next
            }
        }
        
        return false;
    };

    const getEntityFilePath = (type: EntityType, id: string, contextDirs: string[]): string | undefined => {
        const dirName = TYPE_TO_DIRECTORY[type];
        
        // Resolve ID to UUID if it's a slug
        const resolvedId = resolveEntityId(type, id);
        if (!resolvedId) return undefined;
        
        // Search in reverse order (closest first) to find where the entity is defined
        for (const contextDir of [...contextDirs].reverse()) {
            const typeDir = path.join(contextDir, dirName);
            
            // Check if directory exists
            if (!existsSync(typeDir)) continue;
            
            try {
                // List all files in directory and find matching UUID prefix
                const files = readdirSync(typeDir);
                const uuidPrefix = resolvedId.substring(0, 10);
                
                for (const file of files) {
                    if (file.startsWith(uuidPrefix) && (file.endsWith('.yaml') || file.endsWith('.yml'))) {
                        const filePath = path.join(typeDir, file);
                        const stat = statSync(filePath);
                        if (stat.isFile()) {
                            return filePath;
                        }
                    }
                }
            } catch {
                // Directory read failed, continue
            }
            
            // Fallback: try legacy slug-based filenames
            const possiblePaths = [
                path.join(contextDir, dirName, `${resolvedId}.yaml`),
                path.join(contextDir, dirName, `${resolvedId}.yml`),
            ];
            
            for (const filePath of possiblePaths) {
                if (existsSync(filePath)) {
                    const stat = statSync(filePath);
                    if (stat.isFile()) {
                        return filePath;
                    }
                }
            }
        }
        
        return undefined;
    };

    /**
     * Resolve entity ID from UUID or slug
     * Tries UUID first, then slug lookup
     */
    const resolveEntityId = (type: EntityType, identifier: string): string | undefined => {
        // Try direct UUID lookup first
        if (entities.get(type)?.has(identifier)) {
            return identifier;
        }
        
        // Try slug lookup
        const entityMap = entities.get(type);
        if (entityMap) {
            for (const entity of entityMap.values()) {
                const entityWithSlug = entity as Entity & { slug?: string };
                if (entityWithSlug.slug === identifier) {
                    return entity.id;
                }
            }
        }
        
        return undefined;
    };

    const get = <T extends Entity>(type: EntityType, id: string): T | undefined => {
        // Support both UUID and slug lookup
        const resolvedId = resolveEntityId(type, id);
        return resolvedId ? entities.get(type)?.get(resolvedId) as T | undefined : undefined;
    };

    const getAll = <T extends Entity>(type: EntityType): T[] => {
        return Array.from(entities.get(type)?.values() ?? []) as T[];
    };

    const search = (query: string): Entity[] => {
        const normalizedQuery = query.toLowerCase();
        const results: Entity[] = [];
        const seen = new Set<string>(); // Track by ID to avoid duplicates
    
        for (const entityMap of entities.values()) {
            for (const entity of entityMap.values()) {
                let matched = false;
                
                // Check name
                if (entity.name.toLowerCase().includes(normalizedQuery)) {
                    matched = true;
                }
                
                // Also check sounds_like field
                if (!matched) {
                    const entityWithSoundsLike = entity as Entity & { sounds_like?: string[] };
                    const variants = entityWithSoundsLike.sounds_like;
                    if (variants?.some(v => v.toLowerCase().includes(normalizedQuery))) {
                        matched = true;
                    }
                }
                
                // Also check exact match in sounds_like (for full phrase matching)
                if (!matched) {
                    const entityWithSoundsLike = entity as Entity & { sounds_like?: string[] };
                    const variants = entityWithSoundsLike.sounds_like;
                    if (variants?.some(v => v.toLowerCase() === normalizedQuery)) {
                        matched = true;
                    }
                }
                
                if (matched && !seen.has(entity.id)) {
                    results.push(entity);
                    seen.add(entity.id);
                }
            }
        }
    
        return results;
    };

    const findBySoundsLike = (phonetic: string): Entity | undefined => {
        const normalized = phonetic.toLowerCase().trim();
    
        for (const entityMap of entities.values()) {
            for (const entity of entityMap.values()) {
                // Check sounds_like field on entities that have it
                const entityWithSoundsLike = entity as Entity & { sounds_like?: string[] };
                const variants = entityWithSoundsLike.sounds_like;
                if (variants?.some(v => v.toLowerCase() === normalized)) {
                    return entity;
                }
            }
        }
    
        return undefined;
    };

    const clear = (): void => {
        for (const entityMap of entities.values()) {
            entityMap.clear();
        }
    };

    return { load, save, delete: deleteEntity, get, getAll, search, findBySoundsLike, clear, getEntityFilePath };
};

