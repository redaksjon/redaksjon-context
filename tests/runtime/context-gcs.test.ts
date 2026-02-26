import { describe, expect, it, vi } from 'vitest';

const loadHierarchicalConfigMock = vi.fn(async () => ({
  config: {},
  discoveredDirs: [{ path: '/tmp/mock', level: 0 }],
  contextDirs: ['/tmp/mock/context'],
}));

const storageLoadMock = vi.fn(async () => undefined);
const storageClearMock = vi.fn(() => undefined);

vi.mock('../../src/discovery/overcontext-discovery', () => ({
  loadHierarchicalConfig: loadHierarchicalConfigMock,
}));

vi.mock('../../src/storage/adapter', () => ({
  create: vi.fn(() => ({
    load: storageLoadMock,
    clear: storageClearMock,
    get: vi.fn(() => undefined),
    getAll: vi.fn(() => []),
    search: vi.fn(() => []),
    findBySoundsLike: vi.fn(() => undefined),
    save: vi.fn(async () => undefined),
    delete: vi.fn(async () => false),
    getEntityFilePath: vi.fn(() => undefined),
  })),
}));

describe('runtime create gcs', () => {
  it('bypasses filesystem discovery when gcs config is provided', async () => {
    const { create } = await import('../../src/runtime/context');
    const context = await create({
      gcs: {
        bucketName: 'test-bucket',
        basePath: 'shared/context',
      },
    });

    expect(loadHierarchicalConfigMock).not.toHaveBeenCalled();
    expect(storageLoadMock).toHaveBeenCalled();
    expect(context.getContextDirs()).toEqual(['shared/context']);
  });
});
