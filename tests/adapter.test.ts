import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import { create } from '../src/storage/adapter';
import type { Person, Project, Term } from '../src/types';

describe('storage/adapter', () => {
    let testDir: string;
    let contextDir: string;

    beforeEach(async () => {
        testDir = path.join(tmpdir(), `adapter-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        contextDir = path.join(testDir, 'context');
        await fs.mkdir(contextDir, { recursive: true });

        // Create entity directories
        await fs.mkdir(path.join(contextDir, 'people'), { recursive: true });
        await fs.mkdir(path.join(contextDir, 'projects'), { recursive: true });
        await fs.mkdir(path.join(contextDir, 'terms'), { recursive: true });
    });

    afterEach(async () => {
        try {
            await fs.rm(testDir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    });

    describe('load with empty context', () => {
        it('handles empty context directories array', async () => {
            const storage = create();
            await storage.load([]);

            const people = storage.getAll<Person>('person');
            expect(people).toEqual([]);
        });

        it('loads from context directories successfully', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Doe\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const person = storage.get<Person>('person', 'john');
            expect(person?.name).toBe('John Doe');
        });
    });

    describe('save with allowUpdate', () => {
        it('prevents duplicate saves by default', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const person: Person = {
                id: 'john',
                name: 'John',
                type: 'person',
            };

            await storage.save(person, testDir);

            // Try to save again without allowUpdate
            await expect(storage.save(person, testDir, false)).rejects.toThrow('already exists');
        });

        it('allows updates when allowUpdate is true', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const person: Person = {
                id: 'john',
                name: 'John Original',
                type: 'person',
            };

            await storage.save(person, testDir);

            const updated: Person = {
                id: 'john',
                name: 'John Updated',
                type: 'person',
            };

            await storage.save(updated, testDir, true);

            const result = storage.get<Person>('person', 'john');
            expect(result?.name).toBe('John Updated');
        });

        it('saves to in-memory cache when no API available', async () => {
            const storage = create();
            // Don't load any context directories - API will be undefined

            const person: Person = {
                id: 'john',
                name: 'John',
                type: 'person',
            };

            await storage.save(person, testDir);

            const result = storage.get<Person>('person', 'john');
            expect(result?.name).toBe('John');
        });
    });

    describe('delete', () => {
        it('returns false when no API available', async () => {
            const storage = create();
            // Don't load any context directories

            const deleted = await storage.delete('person', 'nonexistent', testDir);
            expect(deleted).toBe(false);
        });

        it('deletes entity successfully', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const deleted = await storage.delete('person', 'john', contextDir);
            expect(deleted).toBe(true);
            expect(storage.get<Person>('person', 'john')).toBeUndefined();
        });
    });

    describe('search', () => {
        beforeEach(async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Doe\nsounds_like:\n  - Jon Doe\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'people', 'jane.yaml'),
                'id: jane\nname: Jane Smith\n'
            );
        });

        it('searches by name with partial match', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const results = storage.search('john');
            expect(results.length).toBe(1);
            expect(results[0].name).toBe('John Doe');
        });

        it('searches by sounds_like with partial match', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const results = storage.search('jon');
            expect(results.length).toBe(1);
            expect(results[0].name).toBe('John Doe');
        });

        it('avoids duplicate results', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'test.yaml'),
                'id: test\nname: Test Test\nsounds_like:\n  - Test\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const results = storage.search('test');
            expect(results.length).toBe(1);
        });
    });

    describe('findBySoundsLike', () => {
        beforeEach(async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Doe\nsounds_like:\n  - Jon Doe\n  - John Dough\n'
            );
        });

        it('finds by exact sounds_like match', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const entity = storage.findBySoundsLike('Jon Doe');
            expect(entity?.name).toBe('John Doe');
        });

        it('returns undefined when no match', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const entity = storage.findBySoundsLike('Nonexistent');
            expect(entity).toBeUndefined();
        });
    });

    describe('clear', () => {
        it('clears cache and API', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            expect(storage.getAll<Person>('person').length).toBe(1);

            storage.clear();

            expect(storage.getAll<Person>('person').length).toBe(0);
        });
    });

    describe('getEntityFilePath', () => {
        it('finds entity in context directory', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const filePath = storage.getEntityFilePath('person', 'john', [contextDir]);
            expect(filePath).toBe(path.join(contextDir, 'people', 'john.yaml'));
        });

        it('uses loaded context dirs when none provided', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const filePath = storage.getEntityFilePath('person', 'john', []);
            expect(filePath).toBe(path.join(contextDir, 'people', 'john.yaml'));
        });

        it('returns undefined for non-existent entity', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const filePath = storage.getEntityFilePath('person', 'nonexistent', [contextDir]);
            expect(filePath).toBeUndefined();
        });
    });

    describe('overcontext integration', () => {
        it('handles overcontext discovery errors gracefully', async () => {
            const storage = create();
            
            // Try to load from a directory that doesn't have proper overcontext structure
            const invalidDir = path.join(testDir, 'invalid');
            await fs.mkdir(invalidDir, { recursive: true });

            await storage.load([invalidDir]);

            // Should handle gracefully and return empty results
            expect(storage.getAll<Person>('person')).toEqual([]);
        });

        it('loads entities using overcontext API', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Doe\n'
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

            const storage = create();
            await storage.load([contextDir]);

            const person = storage.get<Person>('person', 'john');
            const project = storage.get<Project>('project', 'proj1');

            expect(person?.name).toBe('John Doe');
            expect(project?.name).toBe('Project One');
        });

        it('handles multiple entity types', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'terms', 'k8s.yaml'),
                'id: kubernetes\nname: Kubernetes\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const person = storage.get<Person>('person', 'john');
            const term = storage.get<Term>('term', 'kubernetes');

            expect(person).toBeDefined();
            expect(term).toBeDefined();
        });
    });
});
