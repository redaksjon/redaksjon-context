import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import {
    discoverConfigDirectories,
    loadHierarchicalConfig,
    deepMerge,
} from '../src/discovery/discovery';

describe('discovery', () => {
    let testDir: string;

    beforeEach(async () => {
        // Create a unique temp directory for each test
        testDir = path.join(tmpdir(), `redaksjon-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        await fs.mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        // Clean up test directory
        try {
            await fs.rm(testDir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    });

    describe('discoverConfigDirectories', () => {
        it('discovers .protokoll directories up the tree', async () => {
            // Create nested structure
            const deep = path.join(testDir, 'a', 'b', 'c');
            await fs.mkdir(deep, { recursive: true });
            await fs.mkdir(path.join(testDir, '.protokoll'));
            await fs.mkdir(path.join(testDir, 'a', '.protokoll'));

            const discovered = await discoverConfigDirectories({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: deep,
            });

            expect(discovered.length).toBe(2);
            expect(discovered.some(d => d.path === path.join(testDir, 'a', '.protokoll'))).toBe(true);
            expect(discovered.some(d => d.path === path.join(testDir, '.protokoll'))).toBe(true);
        });

        it('returns empty array when no config directories found', async () => {
            const discovered = await discoverConfigDirectories({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: testDir,
            });

            expect(discovered).toEqual([]);
        });

        it('respects maxLevels option', async () => {
            // Create deep structure
            const deep = path.join(testDir, 'a', 'b', 'c', 'd', 'e');
            await fs.mkdir(deep, { recursive: true });
            await fs.mkdir(path.join(testDir, '.protokoll'));
            await fs.mkdir(path.join(testDir, 'a', 'b', '.protokoll'));

            const discovered = await discoverConfigDirectories({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: deep,
                maxLevels: 2,
            });

            // maxLevels limits how many levels up we search
            // From 'e', with maxLevels: 2, we can only go up 2 levels (to 'c')
            // So we won't find either .protokoll directory
            expect(discovered.length).toBe(0);
        });

        it('assigns correct level numbers', async () => {
            const deep = path.join(testDir, 'a', 'b');
            await fs.mkdir(deep, { recursive: true });
            await fs.mkdir(path.join(testDir, '.protokoll'));
            await fs.mkdir(path.join(testDir, 'a', '.protokoll'));

            const discovered = await discoverConfigDirectories({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: deep,
            });

            // Level is distance from starting directory
            // Starting from 'b', 'a/.protokoll' is 1 level up, root '.protokoll' is 2 levels up
            const level1 = discovered.find(d => d.path === path.join(testDir, 'a', '.protokoll'));
            const level2 = discovered.find(d => d.path === path.join(testDir, '.protokoll'));

            expect(level1?.level).toBe(1);
            expect(level2?.level).toBe(2);
        });

        it('handles symbolic links without infinite loops', async () => {
            const subdir = path.join(testDir, 'subdir');
            await fs.mkdir(subdir, { recursive: true });
            await fs.mkdir(path.join(testDir, '.protokoll'));

            // Create a symlink that could cause a loop
            try {
                await fs.symlink(testDir, path.join(subdir, 'link'));
            } catch {
                // Skip test if symlinks not supported
                return;
            }

            const discovered = await discoverConfigDirectories({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: path.join(subdir, 'link'),
            });

            // Should find the config directory without looping
            expect(discovered.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('loadHierarchicalConfig', () => {
        it('loads and merges config files from multiple levels', async () => {
            const deep = path.join(testDir, 'a', 'b');
            await fs.mkdir(deep, { recursive: true });
            await fs.mkdir(path.join(testDir, '.protokoll'));
            await fs.mkdir(path.join(testDir, 'a', '.protokoll'));

            // Write config files
            await fs.writeFile(
                path.join(testDir, '.protokoll', 'config.yaml'),
                'setting1: value1\nsetting2: value2'
            );
            await fs.writeFile(
                path.join(testDir, 'a', '.protokoll', 'config.yaml'),
                'setting2: overridden\nsetting3: value3'
            );

            const result = await loadHierarchicalConfig({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: deep,
            });

            expect(result.config.setting1).toBe('value1');
            expect(result.config.setting2).toBe('overridden'); // Local overrides
            expect(result.config.setting3).toBe('value3');
        });

        it('returns empty result when no config directories found', async () => {
            const result = await loadHierarchicalConfig({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: testDir,
            });

            expect(result).toEqual({
                config: {},
                discoveredDirs: [],
                contextDirs: [],
            });
        });

        it('resolves context directory from explicit config', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));
            const customContext = path.join(testDir, 'custom-context');
            await fs.mkdir(customContext);

            await fs.writeFile(
                path.join(testDir, '.protokoll', 'config.yaml'),
                `contextDirectory: ${customContext}`
            );

            const result = await loadHierarchicalConfig({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: testDir,
            });

            expect(result.contextDirs).toContain(customContext);
        });

        it('resolves context directory from sibling context/ folder', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));
            const contextDir = path.join(testDir, 'context');
            await fs.mkdir(contextDir);

            const result = await loadHierarchicalConfig({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: testDir,
            });

            expect(result.contextDirs).toContain(contextDir);
        });

        it('resolves context directory from .protokoll/context/ (legacy)', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));
            const legacyContext = path.join(testDir, '.protokoll', 'context');
            await fs.mkdir(legacyContext);

            const result = await loadHierarchicalConfig({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: testDir,
            });

            expect(result.contextDirs).toContain(legacyContext);
        });

        it('prefers explicit contextDirectory over defaults', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));
            const customContext = path.join(testDir, 'custom');
            const defaultContext = path.join(testDir, 'context');
            await fs.mkdir(customContext);
            await fs.mkdir(defaultContext);

            await fs.writeFile(
                path.join(testDir, '.protokoll', 'config.yaml'),
                'contextDirectory: custom'
            );

            const result = await loadHierarchicalConfig({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: testDir,
            });

            expect(result.contextDirs).toContain(customContext);
            expect(result.contextDirs).not.toContain(defaultContext);
        });

        it('handles missing config.yaml files gracefully', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));
            const contextDir = path.join(testDir, 'context');
            await fs.mkdir(contextDir);

            const result = await loadHierarchicalConfig({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: testDir,
            });

            expect(result.config).toEqual({});
            expect(result.contextDirs).toContain(contextDir);
        });

        it('handles relative contextDirectory paths', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));
            const relativeContext = path.join(testDir, 'data', 'context');
            await fs.mkdir(relativeContext, { recursive: true });

            await fs.writeFile(
                path.join(testDir, '.protokoll', 'config.yaml'),
                'contextDirectory: data/context'
            );

            const result = await loadHierarchicalConfig({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: testDir,
            });

            expect(result.contextDirs).toContain(relativeContext);
        });
    });

    describe('deepMerge', () => {
        it('merges simple objects', () => {
            const target = { a: 1, b: 2 };
            const source = { b: 3, c: 4 };
            const result = deepMerge(target, source);

            expect(result).toEqual({ a: 1, b: 3, c: 4 });
        });

        it('merges nested objects', () => {
            const target = { a: { x: 1, y: 2 }, b: 3 };
            const source = { a: { y: 4, z: 5 }, c: 6 };
            const result = deepMerge(target, source);

            expect(result).toEqual({
                a: { x: 1, y: 4, z: 5 },
                b: 3,
                c: 6,
            });
        });

        it('replaces arrays instead of merging', () => {
            const target = { arr: [1, 2, 3] };
            const source = { arr: [4, 5] };
            const result = deepMerge(target, source);

            expect(result.arr).toEqual([4, 5]);
        });

        it('handles null and undefined values', () => {
            const target = { a: 1, b: 2 };
            const source = { b: null, c: undefined };
            const result = deepMerge(target, source);

            expect(result.b).toBeNull();
            expect(result.c).toBeUndefined();
        });

        it('returns source when target is null', () => {
            const source = { a: 1 };
            const result = deepMerge(null as any, source);

            expect(result).toEqual(source);
        });

        it('returns target when source is null', () => {
            const target = { a: 1 };
            const result = deepMerge(target, null as any);

            expect(result).toEqual(target);
        });

        it('handles deeply nested objects', () => {
            const target = {
                level1: {
                    level2: {
                        level3: {
                            value: 'old',
                        },
                    },
                },
            };
            const source = {
                level1: {
                    level2: {
                        level3: {
                            value: 'new',
                            extra: 'data',
                        },
                    },
                },
            };
            const result = deepMerge(target, source);

            expect(result.level1.level2.level3.value).toBe('new');
            expect(result.level1.level2.level3.extra).toBe('data');
        });

        it('does not mutate original objects', () => {
            const target = { a: { x: 1 } };
            const source = { a: { y: 2 } };
            const result = deepMerge(target, source);

            expect(target.a).toEqual({ x: 1 });
            expect(source.a).toEqual({ y: 2 });
            expect(result.a).toEqual({ x: 1, y: 2 });
        });
    });
});
