import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import {
    discoverConfigDirectories,
    loadHierarchicalConfig,
} from '../src/discovery/overcontext-discovery';

describe('overcontext-discovery', () => {
    let testDir: string;

    beforeEach(async () => {
        testDir = path.join(tmpdir(), `overcontext-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        await fs.mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        try {
            await fs.rm(testDir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    });

    describe('discoverConfigDirectories', () => {
        it('discovers config directories using overcontext', async () => {
            const deep = path.join(testDir, 'a', 'b');
            await fs.mkdir(deep, { recursive: true });
            await fs.mkdir(path.join(testDir, '.protokoll'));
            await fs.mkdir(path.join(testDir, 'a', '.protokoll'));

            const discovered = await discoverConfigDirectories({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: deep,
            });

            expect(discovered.length).toBeGreaterThan(0);
            expect(discovered.some(d => d.path.includes('.protokoll'))).toBe(true);
        });

        it('returns empty array when no directories found', async () => {
            const discovered = await discoverConfigDirectories({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: testDir,
            });

            expect(discovered).toEqual([]);
        });

        it('respects maxLevels option', async () => {
            const deep = path.join(testDir, 'a', 'b', 'c');
            await fs.mkdir(deep, { recursive: true });
            await fs.mkdir(path.join(testDir, '.protokoll'));

            const discovered = await discoverConfigDirectories({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: deep,
                maxLevels: 1,
            });

            // With maxLevels: 1, should not find root .protokoll
            expect(discovered.length).toBe(0);
        });
    });

    describe('loadHierarchicalConfig', () => {
        it('loads config using overcontext discovery', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));
            const contextDir = path.join(testDir, 'context');
            await fs.mkdir(contextDir);

            await fs.writeFile(
                path.join(testDir, '.protokoll', 'config.yaml'),
                'setting: value\n'
            );

            const result = await loadHierarchicalConfig({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: testDir,
            });

            expect(result.config).toEqual({ setting: 'value' });
            expect(result.contextDirs).toContain(contextDir);
        });

        it('returns empty result when no config found', async () => {
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

        it('resolves explicit contextDirectory from config', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));
            const customContext = path.join(testDir, 'custom');
            await fs.mkdir(customContext);

            await fs.writeFile(
                path.join(testDir, '.protokoll', 'config.yaml'),
                `contextDirectory: ${customContext}\n`
            );

            const result = await loadHierarchicalConfig({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: testDir,
            });

            expect(result.contextDirs).toContain(customContext);
        });

        it('resolves sibling context/ directory', async () => {
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

        it('resolves legacy .protokoll/context/ directory', async () => {
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

        it('merges configs from multiple levels', async () => {
            const deep = path.join(testDir, 'a');
            await fs.mkdir(deep, { recursive: true });
            await fs.mkdir(path.join(testDir, '.protokoll'));
            await fs.mkdir(path.join(deep, '.protokoll'));

            await fs.writeFile(
                path.join(testDir, '.protokoll', 'config.yaml'),
                'setting1: value1\nsetting2: value2\n'
            );
            await fs.writeFile(
                path.join(deep, '.protokoll', 'config.yaml'),
                'setting2: overridden\n'
            );

            const result = await loadHierarchicalConfig({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: deep,
            });

            expect(result.config.setting1).toBe('value1');
            expect(result.config.setting2).toBe('overridden');
        });

        it('handles relative contextDirectory paths', async () => {
            await fs.mkdir(path.join(testDir, '.protokoll'));
            const relativeContext = path.join(testDir, 'data', 'context');
            await fs.mkdir(relativeContext, { recursive: true });

            await fs.writeFile(
                path.join(testDir, '.protokoll', 'config.yaml'),
                'contextDirectory: data/context\n'
            );

            const result = await loadHierarchicalConfig({
                configDirName: '.protokoll',
                configFileName: 'config.yaml',
                startingDir: testDir,
            });

            expect(result.contextDirs).toContain(relativeContext);
        });

        it('handles missing config files gracefully', async () => {
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
    });
});
