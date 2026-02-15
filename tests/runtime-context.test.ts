import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import { create } from '../src/runtime/context';
import type { Person, Project, Term, Company } from '../src/types';

describe('runtime/context', () => {
    let testDir: string;
    let contextDir: string;

    beforeEach(async () => {
        testDir = path.join(tmpdir(), `context-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        contextDir = path.join(testDir, 'context');
        await fs.mkdir(contextDir, { recursive: true });

        // Create entity directories
        await fs.mkdir(path.join(contextDir, 'people'), { recursive: true });
        await fs.mkdir(path.join(contextDir, 'projects'), { recursive: true });
        await fs.mkdir(path.join(contextDir, 'companies'), { recursive: true });
        await fs.mkdir(path.join(contextDir, 'terms'), { recursive: true });
        await fs.mkdir(path.join(contextDir, 'ignored'), { recursive: true });
    });

    afterEach(async () => {
        try {
            await fs.rm(testDir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    });

    describe('create and load', () => {
        it('creates a context instance', async () => {
            const ctx = await create({ contextDirectories: [contextDir] });
            expect(ctx).toBeDefined();
            expect(typeof ctx.load).toBe('function');
            expect(typeof ctx.reload).toBe('function');
        });

        it('loads entities from explicit context directories', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Doe\n'
            );

            const ctx = await create({ contextDirectories: [contextDir] });
            const person = ctx.getPerson('john');
            expect(person?.name).toBe('John Doe');
        });

        it('discovers context directories when not explicitly provided', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'), { recursive: true });
            await fs.writeFile(
                path.join(contextDir, 'people', 'jane.yaml'),
                'id: jane\nname: Jane Smith\n'
            );

            const ctx = await create({ startingDir: testDir });
            const person = ctx.getPerson('jane');
            expect(person?.name).toBe('Jane Smith');
        });

        it('returns empty context when no directories found', async () => {
            const emptyDir = path.join(testDir, 'empty');
            await fs.mkdir(emptyDir);

            const ctx = await create({ startingDir: emptyDir });
            expect(ctx.hasContext()).toBe(false);
            expect(ctx.getAllPeople()).toEqual([]);
        });
    });

    describe('entity access', () => {
        let ctx: Awaited<ReturnType<typeof create>>;

        beforeEach(async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Doe\ncompany: acme\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'people', 'jane.yaml'),
                'id: jane\nname: Jane Smith\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'projects', 'proj1.yaml'),
                `id: proj1
name: Project One
classification:
  context_type: work
routing:
  structure: month
  filename_options:
    - date
`
            );
            await fs.writeFile(
                path.join(contextDir, 'companies', 'acme.yaml'),
                'id: acme\nname: Acme Corp\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'terms', 'k8s.yaml'),
                'id: kubernetes\nname: Kubernetes\nprojects:\n  - proj1\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'ignored', 'test.yaml'),
                'id: test\nname: Test\n'
            );

            ctx = await create({ contextDirectories: [contextDir] });
        });

        it('gets person by id', () => {
            const person = ctx.getPerson('john');
            expect(person?.name).toBe('John Doe');
        });

        it('gets project by id', () => {
            const project = ctx.getProject('proj1');
            expect(project?.name).toBe('Project One');
        });

        it('gets company by id', () => {
            const company = ctx.getCompany('acme');
            expect(company?.name).toBe('Acme Corp');
        });

        it('gets term by id', () => {
            const term = ctx.getTerm('kubernetes');
            expect(term?.name).toBe('Kubernetes');
        });

        it('gets ignored term by id', () => {
            const ignored = ctx.getIgnored('test');
            expect(ignored?.name).toBe('Test');
        });

        it('returns undefined for non-existent entity', () => {
            const person = ctx.getPerson('nonexistent');
            expect(person).toBeUndefined();
        });

        it('gets all people', () => {
            const people = ctx.getAllPeople();
            expect(people.length).toBe(2);
            expect(people.map(p => p.name).sort()).toEqual(['Jane Smith', 'John Doe']);
        });

        it('gets all projects', () => {
            const projects = ctx.getAllProjects();
            expect(projects.length).toBe(1);
            expect(projects[0].name).toBe('Project One');
        });

        it('gets all companies', () => {
            const companies = ctx.getAllCompanies();
            expect(companies.length).toBe(1);
            expect(companies[0].name).toBe('Acme Corp');
        });

        it('gets all terms', () => {
            const terms = ctx.getAllTerms();
            expect(terms.length).toBe(1);
            expect(terms[0].name).toBe('Kubernetes');
        });

        it('gets all ignored terms', () => {
            const ignored = ctx.getAllIgnored();
            expect(ignored.length).toBe(1);
            expect(ignored[0].name).toBe('Test');
        });
    });

    describe('isIgnored', () => {
        let ctx: Awaited<ReturnType<typeof create>>;

        beforeEach(async () => {
            await fs.writeFile(
                path.join(contextDir, 'ignored', 'test-term.yaml'),
                'id: test-term\nname: Test Term\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'ignored', 'another.yaml'),
                'id: another\nname: Another Term\n'
            );

            ctx = await create({ contextDirectories: [contextDir] });
        });

        it('returns true for ignored term by id', () => {
            expect(ctx.isIgnored('test-term')).toBe(true);
        });

        it('returns true for ignored term by name (case insensitive)', () => {
            expect(ctx.isIgnored('Test Term')).toBe(true);
            expect(ctx.isIgnored('test term')).toBe(true);
        });

        it('returns false for non-ignored term', () => {
            expect(ctx.isIgnored('not-ignored')).toBe(false);
        });

        it('normalizes term name for comparison', () => {
            expect(ctx.isIgnored('Test-Term')).toBe(true);
        });
    });

    describe('search', () => {
        let ctx: Awaited<ReturnType<typeof create>>;

        beforeEach(async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Doe\nsounds_like:\n  - Jon Doe\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'projects', 'kubernetes.yaml'),
                `id: kubernetes
name: Kubernetes Project
sounds_like:
  - K8s
classification:
  context_type: work
routing:
  structure: month
  filename_options:
    - date
`
            );

            ctx = await create({ contextDirectories: [contextDir] });
        });

        it('searches entities by name', () => {
            const results = ctx.search('john');
            expect(results.length).toBe(1);
            expect(results[0].name).toBe('John Doe');
        });

        it('searches entities by sounds_like', () => {
            const results = ctx.search('k8s');
            expect(results.length).toBe(1);
            expect(results[0].name).toBe('Kubernetes Project');
        });

        it('returns empty array when no matches', () => {
            const results = ctx.search('nonexistent');
            expect(results).toEqual([]);
        });
    });

    describe('findBySoundsLike', () => {
        let ctx: Awaited<ReturnType<typeof create>>;

        beforeEach(async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Doe\nsounds_like:\n  - Jon Doe\n'
            );

            ctx = await create({ contextDirectories: [contextDir] });
        });

        it('finds entity by exact sounds_like match', () => {
            const entity = ctx.findBySoundsLike('Jon Doe');
            expect(entity?.name).toBe('John Doe');
        });

        it('returns undefined when no match', () => {
            const entity = ctx.findBySoundsLike('nonexistent');
            expect(entity).toBeUndefined();
        });
    });

    describe('searchWithContext', () => {
        let ctx: Awaited<ReturnType<typeof create>>;

        beforeEach(async () => {
            await fs.writeFile(
                path.join(contextDir, 'projects', 'parent.yaml'),
                `id: parent
name: Parent Project
classification:
  context_type: work
routing:
  structure: month
  filename_options:
    - date
`
            );
            await fs.writeFile(
                path.join(contextDir, 'projects', 'child.yaml'),
                `id: child
name: Child Project
classification:
  context_type: work
routing:
  structure: month
  filename_options:
    - date
relationships:
  - uri: redaksjon://project/parent
    relationship: parent
`
            );
            await fs.writeFile(
                path.join(contextDir, 'terms', 'k8s.yaml'),
                'id: kubernetes\nname: Kubernetes\nprojects:\n  - parent\n'
            );

            ctx = await create({ contextDirectories: [contextDir] });
        });

        it('returns all results when no context project provided', () => {
            const results = ctx.searchWithContext('project');
            expect(results.length).toBe(2);
        });

        it('scores related projects higher', () => {
            const results = ctx.searchWithContext('project', 'parent');
            expect(results.length).toBe(2);
            // Results should include both parent and child, with related project scored higher
            const ids = results.map(r => r.id);
            expect(ids).toContain('parent');
            expect(ids).toContain('child');
        });

        it('scores terms associated with project higher', () => {
            const results = ctx.searchWithContext('kubernetes', 'parent');
            expect(results.length).toBe(1);
            expect(results[0].id).toBe('kubernetes');
        });

        it('returns unsorted results when context project not found', () => {
            const results = ctx.searchWithContext('project', 'nonexistent');
            expect(results.length).toBe(2);
        });
    });

    describe('getRelatedProjects', () => {
        let ctx: Awaited<ReturnType<typeof create>>;

        beforeEach(async () => {
            await fs.writeFile(
                path.join(contextDir, 'projects', 'parent.yaml'),
                `id: parent
name: Parent
classification:
  context_type: work
routing:
  structure: month
  filename_options:
    - date
`
            );
            await fs.writeFile(
                path.join(contextDir, 'projects', 'child1.yaml'),
                `id: child1
name: Child 1
classification:
  context_type: work
routing:
  structure: month
  filename_options:
    - date
relationships:
  - uri: redaksjon://project/parent
    relationship: parent
`
            );
            await fs.writeFile(
                path.join(contextDir, 'projects', 'child2.yaml'),
                `id: child2
name: Child 2
classification:
  context_type: work
routing:
  structure: month
  filename_options:
    - date
relationships:
  - uri: redaksjon://project/parent
    relationship: parent
`
            );
            await fs.writeFile(
                path.join(contextDir, 'projects', 'sibling.yaml'),
                `id: sibling
name: Sibling
classification:
  context_type: work
routing:
  structure: month
  filename_options:
    - date
relationships:
  - uri: redaksjon://project/child1
    relationship: sibling
`
            );

            ctx = await create({ contextDirectories: [contextDir] });
        });

        it('returns related projects within maxDistance', () => {
            const related = ctx.getRelatedProjects('parent', 2);
            expect(related.length).toBeGreaterThan(0);
            expect(related.some(p => p.id === 'child1')).toBe(true);
        });

        it('returns empty array for non-existent project', () => {
            const related = ctx.getRelatedProjects('nonexistent');
            expect(related).toEqual([]);
        });

        it('sorts by distance', () => {
            const related = ctx.getRelatedProjects('parent', 2);
            // Children (distance 1) should come before siblings (distance 2)
            const child1Index = related.findIndex(p => p.id === 'child1');
            const siblingIndex = related.findIndex(p => p.id === 'sibling');
            
            if (child1Index >= 0 && siblingIndex >= 0) {
                expect(child1Index).toBeLessThan(siblingIndex);
            }
        });

        it('respects maxDistance parameter', () => {
            const related = ctx.getRelatedProjects('parent', 1);
            // Should only include direct children, not siblings
            expect(related.every(p => p.id === 'child1' || p.id === 'child2')).toBe(true);
        });
    });

    describe('saveEntity', () => {
        it('saves entity to closest discovered directory', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));

            const ctx = await create({ startingDir: testDir });

            const person: Person = {
                id: 'new-person',
                name: 'New Person',
                type: 'person',
            };

            await ctx.saveEntity(person);

            // Should be saved to context directory
            const saved = ctx.getPerson('new-person');
            expect(saved?.name).toBe('New Person');
        });

        it('throws error when no configuration directory found', async () => {
            const ctx = await create({ contextDirectories: [] });

            const person: Person = {
                id: 'test',
                name: 'Test',
                type: 'person',
            };

            await expect(ctx.saveEntity(person)).rejects.toThrow('No configuration directory found');
        });

        it('respects allowUpdate parameter', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));
            await fs.writeFile(
                path.join(contextDir, 'people', 'existing.yaml'),
                'id: existing\nname: Original Name\n'
            );

            const ctx = await create({ startingDir: testDir });

            const updated: Person = {
                id: 'existing',
                name: 'Updated Name',
                type: 'person',
            };

            // Should succeed with allowUpdate=true
            await ctx.saveEntity(updated, true);
            const person = ctx.getPerson('existing');
            expect(person?.name).toBe('Updated Name');
        });
    });

    describe('deleteEntity', () => {
        it('deletes entity file', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John\n'
            );

            const ctx = await create({ startingDir: testDir });
            const person = ctx.getPerson('john');

            if (person) {
                const deleted = await ctx.deleteEntity(person);
                expect(deleted).toBe(true);
                expect(ctx.getPerson('john')).toBeUndefined();
            }
        });

        it('returns false when entity file not found', async () => {
            const ctx = await create({ contextDirectories: [contextDir] });

            const person: Person = {
                id: 'nonexistent',
                name: 'Nonexistent',
                type: 'person',
            };

            const deleted = await ctx.deleteEntity(person);
            expect(deleted).toBe(false);
        });
    });

    describe('getEntityFilePath', () => {
        it('returns file path for existing entity', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John\n'
            );

            const ctx = await create({ contextDirectories: [contextDir] });
            const person = ctx.getPerson('john');

            if (person) {
                const filePath = ctx.getEntityFilePath(person);
                expect(filePath).toBe(path.join(contextDir, 'people', 'john.yaml'));
            }
        });

        it('returns undefined for non-existent entity', async () => {
            const ctx = await create({ contextDirectories: [contextDir] });

            const person: Person = {
                id: 'nonexistent',
                name: 'Nonexistent',
                type: 'person',
            };

            const filePath = ctx.getEntityFilePath(person);
            expect(filePath).toBeUndefined();
        });
    });

    describe('reload', () => {
        it('reloads entities from context directories', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Original\n'
            );

            const ctx = await create({ contextDirectories: [contextDir] });
            expect(ctx.getPerson('john')?.name).toBe('John Original');

            // Update file
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Updated\n'
            );

            await ctx.reload();
            expect(ctx.getPerson('john')?.name).toBe('John Updated');
        });
    });

    describe('getDiscoveredDirs, getConfig, getContextDirs', () => {
        it('returns discovery information', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));
            await fs.writeFile(
                path.join(testDir, '.protokoll', 'config.yaml'),
                'setting: value\n'
            );

            const ctx = await create({ startingDir: testDir });

            const discoveredDirs = ctx.getDiscoveredDirs();
            expect(discoveredDirs.length).toBeGreaterThan(0);

            const config = ctx.getConfig();
            expect(config).toBeDefined();

            const contextDirs = ctx.getContextDirs();
            expect(contextDirs.length).toBeGreaterThan(0);
        });
    });

    describe('hasContext', () => {
        it('returns true when context directories found', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));

            const ctx = await create({ startingDir: testDir });
            expect(ctx.hasContext()).toBe(true);
        });

        it('returns false when no context directories found', async () => {
            const emptyDir = path.join(testDir, 'empty');
            await fs.mkdir(emptyDir);

            const ctx = await create({ startingDir: emptyDir });
            expect(ctx.hasContext()).toBe(false);
        });
    });
});
