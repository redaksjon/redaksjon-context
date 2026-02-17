import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import { create } from '../src/storage/storage';
import type { Person, Project, Term, Company, IgnoredTerm } from '../src/types';

describe('storage', () => {
    let testDir: string;
    let contextDir: string;

    beforeEach(async () => {
        testDir = path.join(tmpdir(), `storage-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
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

    describe('load', () => {
        it('loads entities from context directory', async () => {
            // Create test entities
            await fs.writeFile(
                path.join(contextDir, 'people', 'john-doe.yaml'),
                'id: john-doe\nname: John Doe\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'projects', 'my-project.yaml'),
                'id: my-project\nname: My Project\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const person = storage.get<Person>('person', 'john-doe');
            const project = storage.get<Project>('project', 'my-project');

            expect(person?.name).toBe('John Doe');
            expect(project?.name).toBe('My Project');
        });

        it('loads entities from multiple context directories', async () => {
            const contextDir2 = path.join(testDir, 'context2');
            await fs.mkdir(path.join(contextDir2, 'people'), { recursive: true });

            await fs.writeFile(
                path.join(contextDir, 'people', 'person1.yaml'),
                'id: person1\nname: Person One\n'
            );
            await fs.writeFile(
                path.join(contextDir2, 'people', 'person2.yaml'),
                'id: person2\nname: Person Two\n'
            );

            const storage = create();
            await storage.load([contextDir, contextDir2]);

            const person1 = storage.get<Person>('person', 'person1');
            const person2 = storage.get<Person>('person', 'person2');

            expect(person1?.name).toBe('Person One');
            expect(person2?.name).toBe('Person Two');
        });

        it('later directories override earlier ones', async () => {
            const contextDir2 = path.join(testDir, 'context2');
            await fs.mkdir(path.join(contextDir2, 'people'), { recursive: true });

            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Original\n'
            );
            await fs.writeFile(
                path.join(contextDir2, 'people', 'john.yaml'),
                'id: john\nname: John Override\n'
            );

            const storage = create();
            await storage.load([contextDir, contextDir2]);

            const person = storage.get<Person>('person', 'john');
            expect(person?.name).toBe('John Override');
        });

        it('handles .yml extension', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'jane.yml'),
                'id: jane\nname: Jane Doe\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const person = storage.get<Person>('person', 'jane');
            expect(person?.name).toBe('Jane Doe');
        });

        it('skips non-yaml files', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'readme.txt'),
                'This is not a YAML file'
            );
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const people = storage.getAll<Person>('person');
            expect(people.length).toBe(1);
            expect(people[0].name).toBe('John');
        });

        it('handles missing directories gracefully', async () => {
            const storage = create();
            await storage.load([path.join(testDir, 'nonexistent')]);

            const people = storage.getAll<Person>('person');
            expect(people).toEqual([]);
        });

        it('adds type field to loaded entities', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const person = storage.get<Person>('person', 'john');
            expect(person?.type).toBe('person');
        });
    });

    describe('save', () => {
        it('saves entity to context directory', async () => {
            const person: Person = {
                id: 'john-doe',
                name: 'John Doe',
                type: 'person',
            };

            const storage = create();
            await storage.save(person, testDir);

            // Find file with UUID prefix (first 10 chars of id)
            const peopleDir = path.join(testDir, 'context', 'people');
            const files = await fs.readdir(peopleDir);
            const uuidPrefix = 'john-doe'.substring(0, 10);
            const savedFile = files.find(f => f.startsWith(uuidPrefix) && f.endsWith('.yaml'));
            expect(savedFile).toBeDefined();

            const content = await fs.readFile(
                path.join(peopleDir, savedFile!),
                'utf-8'
            );

            expect(content).toContain('id: john-doe');
            expect(content).toContain('name: John Doe');
            expect(content).not.toContain('type:'); // Type is not saved
        });

        it('updates in-memory cache after save', async () => {
            const person: Person = {
                id: 'john',
                name: 'John',
                type: 'person',
            };

            const storage = create();
            await storage.save(person, testDir);

            const retrieved = storage.get<Person>('person', 'john');
            expect(retrieved?.name).toBe('John');
        });

        it('saves all entity types correctly', async () => {
            const storage = create();

            const person: Person = { id: 'p1', name: 'Person', type: 'person' };
            const project: Project = { id: 'pr1', name: 'Project', type: 'project' };
            const company: Company = { id: 'c1', name: 'Company', type: 'company' };
            const term: Term = { id: 't1', name: 'Term', type: 'term' };
            const ignored: IgnoredTerm = { id: 'i1', name: 'Ignored', type: 'ignored' };

            await storage.save(person, testDir);
            await storage.save(project, testDir);
            await storage.save(company, testDir);
            await storage.save(term, testDir);
            await storage.save(ignored, testDir);

            // Check that files exist with UUID prefix pattern
            const checkFileExists = async (dir: string, idPrefix: string) => {
                const files = await fs.readdir(dir);
                return files.some(f => f.startsWith(idPrefix) && (f.endsWith('.yaml') || f.endsWith('.yml')));
            };

            expect(await checkFileExists(path.join(testDir, 'context', 'people'), 'p1')).toBe(true);
            expect(await checkFileExists(path.join(testDir, 'context', 'projects'), 'pr1')).toBe(true);
            expect(await checkFileExists(path.join(testDir, 'context', 'companies'), 'c1')).toBe(true);
            expect(await checkFileExists(path.join(testDir, 'context', 'terms'), 't1')).toBe(true);
            expect(await checkFileExists(path.join(testDir, 'context', 'ignored'), 'i1')).toBe(true);
        });

        it('creates directories if they do not exist', async () => {
            const person: Person = {
                id: 'john',
                name: 'John',
                type: 'person',
            };

            const newDir = path.join(testDir, 'new-context');
            const storage = create();
            await storage.save(person, newDir);

            // Check that directory exists and has a file with UUID prefix
            const peopleDir = path.join(newDir, 'context', 'people');
            const dirExists = await fs.access(peopleDir).then(() => true).catch(() => false);
            expect(dirExists).toBe(true);
            
            if (dirExists) {
                const files = await fs.readdir(peopleDir);
                const hasFile = files.some(f => f.startsWith('john') && f.endsWith('.yaml'));
                expect(hasFile).toBe(true);
            }
        });
    });

    describe('delete', () => {
        it('deletes entity file', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const deleted = await storage.delete('person', 'john', contextDir);
            expect(deleted).toBe(true);

            const exists = await fs.access(path.join(contextDir, 'people', 'john.yaml'))
                .then(() => true)
                .catch(() => false);

            expect(exists).toBe(false);
        });

        it('removes entity from cache', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            await storage.delete('person', 'john', contextDir);

            const person = storage.get<Person>('person', 'john');
            expect(person).toBeUndefined();
        });

        it('returns false when entity does not exist', async () => {
            const storage = create();
            const deleted = await storage.delete('person', 'nonexistent', contextDir);
            expect(deleted).toBe(false);
        });

        it('tries both .yaml and .yml extensions', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yml'),
                'id: john\nname: John\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const deleted = await storage.delete('person', 'john', contextDir);
            expect(deleted).toBe(true);
        });

        it('tries both with and without context subdirectory', async () => {
            // Create file directly in targetDir/people (not context/people) with UUID prefix
            await fs.mkdir(path.join(testDir, 'people'), { recursive: true });
            await fs.writeFile(
                path.join(testDir, 'people', 'john-john.yaml'),
                'id: john\nname: John\n'
            );

            const storage = create();
            await storage.load([testDir]);

            const deleted = await storage.delete('person', 'john', testDir);
            expect(deleted).toBe(true);
        });
    });

    describe('get and getAll', () => {
        beforeEach(async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Doe\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'people', 'jane.yaml'),
                'id: jane\nname: Jane Smith\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'projects', 'proj1.yaml'),
                'id: proj1\nname: Project One\n'
            );
        });

        it('gets entity by type and id', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const person = storage.get<Person>('person', 'john');
            expect(person?.name).toBe('John Doe');
        });

        it('returns undefined for non-existent entity', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const person = storage.get<Person>('person', 'nonexistent');
            expect(person).toBeUndefined();
        });

        it('gets all entities of a type', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const people = storage.getAll<Person>('person');
            expect(people.length).toBe(2);
            expect(people.map(p => p.name).sort()).toEqual(['Jane Smith', 'John Doe']);
        });

        it('returns empty array for type with no entities', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const companies = storage.getAll<Company>('company');
            expect(companies).toEqual([]);
        });
    });

    describe('search', () => {
        beforeEach(async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Doe\nsounds_like:\n  - Jon Doe\n  - John Dough\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'projects', 'kubernetes.yaml'),
                'id: kubernetes\nname: Kubernetes\nsounds_like:\n  - K8s\n  - Kube\n'
            );
        });

        it('searches by name', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const results = storage.search('john');
            expect(results.length).toBe(1);
            expect(results[0].name).toBe('John Doe');
        });

        it('searches case-insensitively', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const results = storage.search('JOHN');
            expect(results.length).toBe(1);
            expect(results[0].name).toBe('John Doe');
        });

        it('searches by sounds_like variants', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const results = storage.search('k8s');
            expect(results.length).toBe(1);
            expect(results[0].name).toBe('Kubernetes');
        });

        it('searches with partial matches', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const results = storage.search('doe');
            expect(results.length).toBe(1);
            expect(results[0].name).toBe('John Doe');
        });

        it('returns empty array when no matches', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const results = storage.search('nonexistent');
            expect(results).toEqual([]);
        });

        it('does not return duplicates', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'test.yaml'),
                'id: test\nname: Test Test\nsounds_like:\n  - Test\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const results = storage.search('test');
            expect(results.length).toBe(1);
        });

        it('matches exact sounds_like phrases', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const results = storage.search('jon doe');
            expect(results.length).toBe(1);
            expect(results[0].name).toBe('John Doe');
        });
    });

    describe('findBySoundsLike', () => {
        beforeEach(async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Doe\nsounds_like:\n  - Jon Doe\n  - John Dough\n'
            );
            await fs.writeFile(
                path.join(contextDir, 'terms', 'k8s.yaml'),
                'id: kubernetes\nname: Kubernetes\nsounds_like:\n  - K8s\n  - Kube\n'
            );
        });

        it('finds entity by exact sounds_like match', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const entity = storage.findBySoundsLike('Jon Doe');
            expect(entity?.name).toBe('John Doe');
        });

        it('matches case-insensitively', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const entity = storage.findBySoundsLike('jon doe');
            expect(entity?.name).toBe('John Doe');
        });

        it('trims whitespace', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const entity = storage.findBySoundsLike('  Jon Doe  ');
            expect(entity?.name).toBe('John Doe');
        });

        it('returns undefined when no match', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const entity = storage.findBySoundsLike('nonexistent');
            expect(entity).toBeUndefined();
        });

        it('finds entities across different types', async () => {
            const storage = create();
            await storage.load([contextDir]);

            const person = storage.findBySoundsLike('Jon Doe');
            const term = storage.findBySoundsLike('K8s');

            expect(person?.type).toBe('person');
            expect(term?.type).toBe('term');
        });
    });

    describe('clear', () => {
        it('clears all entities from cache', async () => {
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
        it('finds entity file path in context directory', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John\n'
            );

            const storage = create();
            await storage.load([contextDir]);

            const filePath = storage.getEntityFilePath('person', 'john', [contextDir]);
            expect(filePath).toBe(path.join(contextDir, 'people', 'john.yaml'));
        });

        it('searches in reverse order (closest first)', async () => {
            const contextDir2 = path.join(testDir, 'context2');
            await fs.mkdir(path.join(contextDir2, 'people'), { recursive: true });

            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yaml'),
                'id: john\nname: John Original\n'
            );
            await fs.writeFile(
                path.join(contextDir2, 'people', 'john.yaml'),
                'id: john\nname: John Override\n'
            );

            const storage = create();
            await storage.load([contextDir, contextDir2]);
            const filePath = storage.getEntityFilePath('person', 'john', [contextDir, contextDir2]);

            // Should find the one in contextDir2 (last in array)
            expect(filePath).toBe(path.join(contextDir2, 'people', 'john.yaml'));
        });

        it('returns undefined when entity file not found', async () => {
            const storage = create();
            const filePath = storage.getEntityFilePath('person', 'nonexistent', [contextDir]);
            expect(filePath).toBeUndefined();
        });

        it('checks both .yaml and .yml extensions', async () => {
            await fs.writeFile(
                path.join(contextDir, 'people', 'john.yml'),
                'id: john\nname: John\n'
            );

            const storage = create();
            await storage.load([contextDir]);
            const filePath = storage.getEntityFilePath('person', 'john', [contextDir]);
            expect(filePath).toBe(path.join(contextDir, 'people', 'john.yml'));
        });
    });
});
