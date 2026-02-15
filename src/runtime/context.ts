/**
 * Context Runtime
 * 
 * Main entry point for the context runtime system. Provides a factory function
 * to create context instances that can discover, load, and manage
 * entity data from hierarchical configuration directories.
 */

import { 
    RedaksjonEntity,
    Person, 
    Project, 
    Company, 
    Term,
    IgnoredTerm,
} from '../types';
import * as OvercontextAdapter from '../storage/adapter';
import { getProjectRelationshipDistance } from '../helpers';
import type {
    ContextDiscoveryOptions,
    DiscoveredContextDir,
    HierarchicalContextResult,
} from '../discovery/types';
import { loadHierarchicalConfig } from '../discovery/overcontext-discovery';

export interface ContextInstance {
    // Initialization
    load(): Promise<void>;
    reload(): Promise<void>;
  
    // Discovery info
    getDiscoveredDirs(): DiscoveredContextDir[];
    getConfig(): Record<string, unknown>;
    getContextDirs(): string[];
  
    // Entity access
    getPerson(id: string): Person | undefined;
    getProject(id: string): Project | undefined;
    getCompany(id: string): Company | undefined;
    getTerm(id: string): Term | undefined;
    getIgnored(id: string): IgnoredTerm | undefined;
  
    getAllPeople(): Person[];
    getAllProjects(): Project[];
    getAllCompanies(): Company[];
    getAllTerms(): Term[];
    getAllIgnored(): IgnoredTerm[];
  
    // Check if a term is ignored
    isIgnored(term: string): boolean;
  
    // Search
    search(query: string): RedaksjonEntity[];
    findBySoundsLike(phonetic: string): RedaksjonEntity | undefined;
  
    // Advanced search with context awareness
    searchWithContext(query: string, contextProjectId?: string): RedaksjonEntity[];
    getRelatedProjects(projectId: string, maxDistance?: number): Project[];
  
    // Modification
    saveEntity(entity: RedaksjonEntity, allowUpdate?: boolean): Promise<void>;
    deleteEntity(entity: RedaksjonEntity): Promise<boolean>;
    getEntityFilePath(entity: RedaksjonEntity): string | undefined;
  
    // Check if context is available
    hasContext(): boolean;
}

export interface CreateOptions {
    startingDir?: string;
    configDirName?: string;
    configFileName?: string;
    /** Explicit context directories to load entities from (bypasses discovery) */
    contextDirectories?: string[];
}

/**
 * Create a new context instance using overcontext
 */
export const create = async (options: CreateOptions = {}): Promise<ContextInstance> => {
    const discoveryOptions: ContextDiscoveryOptions = {
        configDirName: options.configDirName ?? '.protokoll',
        configFileName: options.configFileName ?? 'config.yaml',
        startingDir: options.startingDir,
    };

    const storage = OvercontextAdapter.create();
    let discoveryResult: HierarchicalContextResult = {
        config: {},
        discoveredDirs: [],
        contextDirs: [],
    };

    const loadContext = async (): Promise<void> => {
        // If explicit contextDirectories are provided, use them directly
        if (options.contextDirectories && options.contextDirectories.length > 0) {
            discoveryResult = {
                config: {},
                discoveredDirs: options.contextDirectories.map((dir, index) => ({
                    path: dir,
                    level: index,
                })),
                contextDirs: options.contextDirectories,
            };
        } else {
            // Otherwise, use configuration directory discovery
            discoveryResult = await loadHierarchicalConfig(discoveryOptions);
        }
        storage.clear();
        await storage.load(discoveryResult.contextDirs);
    };

    // Initial load
    await loadContext();

    return {
        load: loadContext,
    
        reload: async () => {
            storage.clear();
            await storage.load(discoveryResult.contextDirs);
        },
    
        getDiscoveredDirs: () => discoveryResult.discoveredDirs,
        getConfig: () => discoveryResult.config,
        getContextDirs: () => discoveryResult.contextDirs,
    
        getPerson: (id) => storage.get<Person>('person', id),
        getProject: (id) => storage.get<Project>('project', id),
        getCompany: (id) => storage.get<Company>('company', id),
        getTerm: (id) => storage.get<Term>('term', id),
        getIgnored: (id) => storage.get<IgnoredTerm>('ignored', id),
    
        getAllPeople: () => storage.getAll<Person>('person'),
        getAllProjects: () => storage.getAll<Project>('project'),
        getAllCompanies: () => storage.getAll<Company>('company'),
        getAllTerms: () => storage.getAll<Term>('term'),
        getAllIgnored: () => storage.getAll<IgnoredTerm>('ignored'),
        
        isIgnored: (term: string) => {
            const normalizedTerm = term.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            const ignoredTerms = storage.getAll<IgnoredTerm>('ignored');
            return ignoredTerms.some(ignored => 
                ignored.id === normalizedTerm || 
                ignored.name.toLowerCase() === term.toLowerCase()
            );
        },
    
        search: (query) => storage.search(query),
        findBySoundsLike: (phonetic) => storage.findBySoundsLike(phonetic),
        
        searchWithContext: (query, contextProjectId) => {
            const results = storage.search(query);
            
            if (!contextProjectId) {
                return results;
            }
            
            const contextProject = storage.get<Project>('project', contextProjectId);
            if (!contextProject) {
                return results;
            }
            
            const scoredResults = results.map(entity => {
                let score = 0;
                
                if (entity.type === 'project') {
                    const distance = getProjectRelationshipDistance(contextProject, entity as Project);
                    if (distance >= 0) {
                        score += (3 - distance) * 50;
                    }
                }
                
                if (entity.type === 'term') {
                    const term = entity as Term;
                    if (term.projects?.includes(contextProjectId)) {
                        score += 100;
                    }
                }
                
                return { entity, score };
            });
            
            return scoredResults
                .sort((a, b) => b.score - a.score)
                .map(r => r.entity);
        },
        
        getRelatedProjects: (projectId, maxDistance = 2) => {
            const project = storage.get<Project>('project', projectId);
            if (!project) return [];
            
            const allProjects = storage.getAll<Project>('project');
            const related: Array<{ project: Project; distance: number }> = [];
            
            for (const otherProject of allProjects) {
                if (otherProject.id === projectId) continue;
                
                const distance = getProjectRelationshipDistance(project, otherProject);
                if (distance >= 0 && distance <= maxDistance) {
                    related.push({ project: otherProject, distance });
                }
            }
            
            return related
                .sort((a, b) => a.distance - b.distance)
                .map(r => r.project);
        },
    
        saveEntity: async (entity, allowUpdate = false) => {
            const closestDir = discoveryResult.discoveredDirs
                .sort((a, b) => a.level - b.level)[0];
      
            if (!closestDir) {
                throw new Error('No configuration directory found. Cannot save entity.');
            }
      
            await storage.save(entity, closestDir.path, allowUpdate);
        },
        
        deleteEntity: async (entity) => {
            const filePath = storage.getEntityFilePath(entity.type, entity.id, discoveryResult.contextDirs);
            if (!filePath) {
                return false;
            }
            
            const contextDir = discoveryResult.contextDirs.find(dir => filePath.startsWith(dir));
            if (!contextDir) {
                return false;
            }
            
            return storage.delete(entity.type, entity.id, contextDir);
        },
        
        getEntityFilePath: (entity) => {
            return storage.getEntityFilePath(entity.type, entity.id, discoveryResult.contextDirs);
        },
    
        hasContext: () => discoveryResult.discoveredDirs.length > 0,
    };
};
